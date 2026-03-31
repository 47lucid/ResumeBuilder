use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde_json::json;
use validator::Validate;

use crate::{
    db::SupabaseClient,
    models::{ApiError, SubscribeRequest, SubscribeResponse},
};

pub fn router() -> Router {
    Router::new()
        .route("/subscribe", post(subscribe))
        .route("/count", get(get_count))
}

/// POST /api/waitlist/subscribe
/// Adds a new email to Supabase and sends a welcome email via Resend
async fn subscribe(Json(payload): Json<SubscribeRequest>) -> impl IntoResponse {
    // Validate input
    if let Err(e) = payload.validate() {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!(ApiError {
                error: "VALIDATION_ERROR".to_string(),
                message: e.to_string(),
            })),
        )
            .into_response();
    }

    let db = match SupabaseClient::new() {
        Ok(db) => db,
        Err(e) => {
            tracing::error!("Failed to create Supabase client: {}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "DB_ERROR".to_string(),
                    message: "Database connection failed".to_string(),
                })),
            )
                .into_response();
        }
    };

    // Check for duplicates
    match db.email_exists(&payload.email).await {
        Ok(true) => {
            return (
                StatusCode::CONFLICT,
                Json(json!(SubscribeResponse {
                    success: false,
                    message: "You're already on the waitlist! We'll be in touch soon.".to_string(),
                    subscriber_count: None,
                })),
            )
                .into_response();
        }
        Err(e) => tracing::warn!("Could not check duplicate: {}", e),
        Ok(false) => {}
    }

    // Insert into Supabase
    if let Err(e) = db
        .insert_subscriber(&payload.email, payload.source.as_deref())
        .await
    {
        tracing::error!("Failed to insert subscriber: {}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_INSERT_ERROR".to_string(),
                message: "Failed to save your email. Please try again.".to_string(),
            })),
        )
            .into_response();
    }

    // Send welcome email via Resend
    if let Err(e) = send_welcome_email(&payload.email).await {
        tracing::warn!("Failed to send welcome email to {}: {}", payload.email, e);
        // Don't fail the request — subscriber was saved
    }

    let count = db.get_subscriber_count().await.unwrap_or(0);

    (
        StatusCode::CREATED,
        Json(json!(SubscribeResponse {
            success: true,
            message: "🚀 You're on the list! Watch your inbox for launch updates.".to_string(),
            subscriber_count: Some(count),
        })),
    )
        .into_response()
}

/// GET /api/waitlist/count
async fn get_count() -> impl IntoResponse {
    let db = match SupabaseClient::new() {
        Ok(db) => db,
        Err(_) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"count": 0}))).into_response();
        }
    };

    let count = db.get_subscriber_count().await.unwrap_or(0);
    (StatusCode::OK, Json(json!({"count": count}))).into_response()
}

/// Send welcome email via Resend API
async fn send_welcome_email(to_email: &str) -> anyhow::Result<()> {
    let resend_api_key = std::env::var("RESEND_API_KEY")?;
    let from_email = std::env::var("RESEND_FROM_EMAIL")
        .unwrap_or_else(|_| "AuraIn. <hello@aurain.me>".to_string());

    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "from": from_email,
        "to": [to_email],
        "subject": "🚀 You're on the AuraIn. waitlist!",
        "html": r#"
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { background: #0e0e0f; color: #e5e2e3; font-family: Inter, sans-serif; margin: 0; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; }
                .logo { font-size: 24px; font-weight: 700; color: #a1fd60; letter-spacing: -0.04em; margin-bottom: 32px; }
                .headline { font-size: 32px; font-weight: 700; letter-spacing: -0.04em; margin-bottom: 16px; }
                .body { color: #c0cab3; line-height: 1.6; margin-bottom: 32px; }
                .cta { display: inline-block; background: linear-gradient(135deg, #a1fd60, #5fb41b); color: #0b2000; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; }
                .footer { margin-top: 48px; color: #565556; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">AuraIn.</div>
                <h1 class="headline">You're officially on the list. 🎉</h1>
                <p class="body">
                  Thank you for joining the AuraIn. waitlist. We will notify you when our professional resume builder is ready.<br><br>
                  We'll send you early access, and launch day news directly to this inbox.
                </p>
                <a href="https://aurain.me" class="cta">Visit AuraIn. →</a>
                <div class="footer">
                  You received this because you signed up at aurain.me<br>
                  <a href="https://aurain.me/unsubscribe" style="color: #767576;">Unsubscribe</a>
                </div>
              </div>
            </body>
            </html>
        "#
    });

    let response = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", resend_api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await?;

    if !response.status().is_success() {
        let err_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Resend API error: {}", err_text));
    }

    Ok(())
}
