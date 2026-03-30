use axum::{extract::Json, http::StatusCode, response::IntoResponse, routing::post, Router};
use serde_json::json;
use validator::Validate;

use crate::{
    db::SupabaseClient,
    models::{ApiError, BroadcastRequest, BroadcastResponse},
};

pub fn router() -> Router {
    Router::new().route("/broadcast", post(broadcast))
}

/// POST /api/email/broadcast
/// Sends a mass email to all subscribers via Resend
async fn broadcast(Json(payload): Json<BroadcastRequest>) -> impl IntoResponse {
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

    let resend_api_key = match std::env::var("RESEND_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "CONFIG_ERROR".to_string(),
                    message: "Resend API key not configured".to_string(),
                })),
            )
                .into_response();
        }
    };

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

    // Fetch recipient list (use test_recipients if provided)
    let recipients = if let Some(test_list) = &payload.test_recipients {
        test_list.clone()
    } else {
        match db.get_all_emails().await {
            Ok(emails) => emails,
            Err(e) => {
                tracing::error!("Failed to fetch subscriber emails: {}", e);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!(ApiError {
                        error: "DB_FETCH_ERROR".to_string(),
                        message: "Failed to fetch subscriber list".to_string(),
                    })),
                )
                    .into_response();
            }
        }
    };

    if recipients.is_empty() {
        return (
            StatusCode::OK,
            Json(json!(BroadcastResponse {
                success: true,
                message: "No subscribers to send to.".to_string(),
                recipients_count: 0,
            })),
        )
            .into_response();
    }

    let from_email = std::env::var("RESEND_FROM_EMAIL")
        .unwrap_or_else(|_| "LaunchPad <noreply@yourdomain.com>".to_string());

    let client = reqwest::Client::new();
    let mut sent_count = 0usize;
    let mut errors = 0usize;

    // Resend supports up to 50 recipients per API call — batch accordingly
    for chunk in recipients.chunks(50) {
        let body = serde_json::json!({
            "from": from_email,
            "to": chunk,
            "subject": payload.subject,
            "html": payload.body,
        });

        match client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", resend_api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
        {
            Ok(resp) if resp.status().is_success() => {
                sent_count += chunk.len();
            }
            Ok(resp) => {
                let err_text = resp.text().await.unwrap_or_default();
                tracing::error!("Resend batch error: {}", err_text);
                errors += chunk.len();
            }
            Err(e) => {
                tracing::error!("Resend request failed: {}", e);
                errors += chunk.len();
            }
        }
    }

    // Save campaign record
    if let Err(e) = db.save_campaign(&payload.subject, sent_count).await {
        tracing::warn!("Failed to save campaign record: {}", e);
    }

    let success = errors == 0;
    let message = if success {
        format!(
            "🚀 Broadcast sent successfully to {} subscribers!",
            sent_count
        )
    } else {
        format!(
            "Partially sent: {} succeeded, {} failed.",
            sent_count, errors
        )
    };

    (
        if success {
            StatusCode::OK
        } else {
            StatusCode::PARTIAL_CONTENT
        },
        Json(json!(BroadcastResponse {
            success,
            message,
            recipients_count: sent_count,
        })),
    )
        .into_response()
}
