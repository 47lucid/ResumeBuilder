use crate::db::SupabaseClient;
use crate::models::{
    ApiError, AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest,
    ResetPasswordRequest,
};
use axum::http::HeaderMap;
use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<SupabaseClient>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub(crate) fn extract_email_from_token(headers: &HeaderMap) -> Result<String, ()> {
    let _auth_header = headers.get("Authorization").ok_or(())?;
    let auth_str = _auth_header.to_str().map_err(|_| ())?;
    if !auth_str.starts_with("Bearer ") {
        return Err(());
    }

    let token = &auth_str[7..];
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_dev_key".to_string());

    let token_data = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(c) => c,
        Err(_) => return Err(()),
    };

    Ok(token_data.claims.sub)
}

#[derive(Deserialize)]
pub struct MagicLinkRequest {
    pub email: String,
}

#[derive(Serialize)]
pub struct MagicLinkResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Deserialize)]
pub struct VerifyLinkRequest {
    pub email: String,
    pub token: String,
}

pub fn router(db: Arc<SupabaseClient>) -> Router {
    let state = AppState { db };
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/magic-link", post(send_magic_link))
        .route("/verify-link", post(verify_link))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .with_state(state)
}

fn create_jwt(email: &str) -> String {
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "super_secret_dev_key".to_string());
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: email.to_owned(),
        exp: expiration as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .unwrap_or_default()
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim();
    if email.is_empty() || payload.password.is_none() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!(ApiError {
                error: "INVALID_INPUT".to_string(),
                message: "Email and password are required.".to_string(),
            })),
        )
            .into_response();
    }

    let plain_pw = payload.password.unwrap();
    let hashed = match hash(&plain_pw, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "HASH_FAILED".to_string(),
                    message: "Encryption failed.".to_string(),
                })),
            )
                .into_response()
        }
    };

    let mut account_ready = false;

    if let Ok(Some(existing_user)) = state.db.get_user_by_email(email).await {
        if existing_user.password_hash.is_some() {
            return (
                StatusCode::CONFLICT,
                Json(json!(ApiError {
                    error: "ACCOUNT_EXISTS".to_string(),
                    message: "Account already exists with a password.".to_string(),
                })),
            )
                .into_response();
        } else {
            // Already created via magic link but without a password. Update it.
            if state.db.update_password(email, &hashed).await.is_ok() {
                account_ready = true;
            }
        }
    } else {
        // Did not exist. Create new.
        if state.db.create_user(email, Some(&hashed)).await.is_ok() {
            account_ready = true;
        }
    }

    if account_ready {
        let token = create_jwt(email);
        (
            StatusCode::OK,
            Json(json!(AuthResponse {
                success: true,
                token: Some(token),
                message: "Registration successful".to_string(),
            })),
        )
            .into_response()
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "SERVER_ERROR".to_string(),
                message: "Failed to create or update account.".to_string(),
            })),
        )
            .into_response()
    }
}

pub async fn forgot_password(
    State(state): State<AppState>,
    Json(payload): Json<ForgotPasswordRequest>,
) -> impl IntoResponse {
    let user = match state.db.get_user_by_email(&payload.email).await {
        Ok(Some(u)) => u,
        _ => {
            // Even if user not found, we return success to prevent email enumeration
            return (StatusCode::OK, Json(json!({"success": true, "message": "If an account exists, a reset link was sent."}))).into_response();
        }
    };

    // Generate 60-second token
    let token = Uuid::new_v4().to_string();
    let expires = Utc::now() + Duration::seconds(60);

    match state
        .db
        .update_magic_token(&user.email, &token, expires)
        .await
    {
        Ok(_) => {
            let frontend_url =
                std::env::var("FRONTEND_URL").unwrap_or_else(|_| "https://aurain.me".to_string());
            tracing::info!(
                "🔗 [MOCK EMAIL] Password Reset link for {}: {}/auth/reset?email={}&token={}",
                user.email,
                frontend_url,
                user.email,
                token
            );
            (
                StatusCode::OK,
                Json(
                    json!({"success": true, "message": "Password reset link sent to your email!"}),
                ),
            )
                .into_response()
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_ERROR".to_string(),
                message: "Failed to generate reset link.".to_string(),
            })),
        )
            .into_response(),
    }
}

pub async fn reset_password(
    State(state): State<AppState>,
    Json(payload): Json<ResetPasswordRequest>,
) -> impl IntoResponse {
    let new_pw = match payload.new_password {
        Some(p) if p.len() >= 6 => p,
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!(ApiError {
                    error: "WEAK_PASSWORD".to_string(),
                    message: "Password must be at least 6 characters.".to_string(),
                })),
            )
                .into_response()
        }
    };

    let user = match state.db.get_user_by_email(&payload.email).await {
        Ok(Some(u)) => u,
        _ => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!(ApiError {
                    error: "USER_NOT_FOUND".to_string(),
                    message: "Invalid reset link.".to_string(),
                })),
            )
                .into_response()
        }
    };

    match (user.magic_token, user.magic_token_expires) {
        (Some(saved_token), Some(expires)) => {
            if saved_token != payload.token {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(json!(ApiError {
                        error: "INVALID_TOKEN".to_string(),
                        message: "Invalid reset token.".to_string(),
                    })),
                )
                    .into_response();
            }
            if Utc::now() > expires {
                return (
                    StatusCode::GONE,
                    Json(json!(ApiError {
                        error: "EXPIRED_TOKEN".to_string(),
                        message: "Reset link expired.".to_string(),
                    })),
                )
                    .into_response();
            }
        }
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "NO_TOKEN".to_string(),
                    message: "No active reset request found.".to_string(),
                })),
            )
                .into_response();
        }
    }

    let hashed_pw = match hash(new_pw, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "HASH_ERROR".to_string(),
                    message: "Could not hash password".to_string(),
                })),
            )
                .into_response()
        }
    };

    // Update password
    if state
        .db
        .update_password(&user.email, &hashed_pw)
        .await
        .is_err()
    {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_ERROR".to_string(),
                message: "Failed to update password.".to_string(),
            })),
        )
            .into_response();
    }

    // Always nullify token after use
    let _ = state.db.clear_magic_token(&user.email).await;

    (
        StatusCode::OK,
        Json(json!({"success": true, "message": "Password successfully reset!"})),
    )
        .into_response()
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim();
    if email.is_empty() || payload.password.is_none() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!(ApiError {
                error: "INVALID_INPUT".to_string(),
                message: "Email and password required.".to_string(),
            })),
        )
            .into_response();
    }

    let user = match state.db.get_user_by_email(email).await {
        Ok(Some(u)) => u,
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "UNAUTHORIZED".to_string(),
                    message: "Invalid credentials.".to_string(),
                })),
            )
                .into_response()
        }
    };

    let hashed = match user.password_hash {
        Some(h) => h,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "UNAUTHORIZED".to_string(),
                    message: "Login via magic link required for this account.".to_string(),
                })),
            )
                .into_response()
        }
    };

    if verify(payload.password.unwrap(), &hashed).unwrap_or(false) {
        let token = create_jwt(email);
        (
            StatusCode::OK,
            Json(json!(AuthResponse {
                success: true,
                token: Some(token),
                message: "Login successful".to_string(),
            })),
        )
            .into_response()
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!(ApiError {
                error: "UNAUTHORIZED".to_string(),
                message: "Invalid credentials.".to_string(),
            })),
        )
            .into_response()
    }
}

async fn send_magic_link(
    State(state): State<AppState>,
    Json(payload): Json<MagicLinkRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim();
    if email.is_empty() || !email.contains('@') {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!(ApiError {
                error: "INVALID_EMAIL".to_string(),
                message: "A valid email is required.".to_string(),
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
                    message: "Email service is not configured.".to_string(),
                })),
            )
                .into_response()
        }
    };

    let _user = match state.db.get_user_by_email(email).await {
        Ok(Some(u)) => u,
        _ => {
            // Create user with null password if they don't exist
            match state.db.create_user(email, None).await {
                Ok(u) => u,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!(ApiError {
                            error: "DB_ERROR".to_string(),
                            message: "Failed to initialize user session.".to_string(),
                        })),
                    )
                        .into_response()
                }
            }
        }
    };

    // 60-second magic token
    let token = Uuid::new_v4().to_string();
    let expires = Utc::now() + Duration::seconds(60);

    if state
        .db
        .update_magic_token(email, &token, expires)
        .await
        .is_err()
    {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_ERROR".to_string(),
                message: "Failed to set magic token.".to_string(),
            })),
        )
            .into_response();
    }

    let from_email = std::env::var("RESEND_FROM_EMAIL")
        .unwrap_or_else(|_| "AuraIn. <auth@aurain.me>".to_string());

    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "https://aurain.me".to_string());

    let client = reqwest::Client::new();
    let magic_link_url = format!(
        "{}/auth/callback?token={}&email={}",
        frontend_url,
        token,
        urlencoding::encode(email)
    );

    let html_content = format!(
        "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;\">\
            <div style=\"padding-bottom: 20px;\">\
                <p style=\"margin-top: 0;\">Hello,</p>\
                <p>Here is your magic link to securely sign in to AuraIn.</p>\
                <p>Simply click the button below to authenticate your session. For your security, this link will expire in 60 seconds.</p>\
                <div style=\"text-align: center; margin: 40px 0;\">\
                    <a href=\"{}\" style=\"background-color: #a1fd60; color: #000; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; display: inline-block; border: 3px solid #000;\">Login to AuraIn</a>\
                </div>\
                <p>If you didn't request this email, you can safely ignore it.</p>\
            </div>\
            <div style=\"border-top: 1px solid #eaeaea; padding-top: 30px; text-align: center;\">\
                <h2 style=\"margin: 0; color: #000; font-size: 28px; font-weight: 900; letter-spacing: -1px;\">AuraIn.</h2>\
                <div style=\"margin-top: 15px; color: #888; font-size: 12px;\">\
                    <p style=\"margin: 0;\">AuraIn, Inc.</p>\
                    <p style=\"margin: 5px 0 0 0;\"><a href=\"https://aurain.me\" style=\"color: #888; text-decoration: underline;\">Visit our website</a></p>\
                </div>\
            </div>\
        </div>",
        magic_link_url
    );

    let body = serde_json::json!({
        "from": from_email,
        "to": [email],
        "subject": "Your Magic Login Link - AuraIn.",
        "html": html_content,
    });

    let res = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", resend_api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await;

    match res {
        Ok(r) if r.status().is_success() => (
            StatusCode::OK,
            Json(json!(MagicLinkResponse {
                success: true,
                message: "Magic link sent successfully. Check your inbox (expires in 60s)."
                    .to_string(),
            })),
        )
            .into_response(),
        Ok(r) => {
            let err_text = r.text().await.unwrap_or_default();
            tracing::error!("Resend error: {}", err_text);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "EMAIL_SEND_FAILED".to_string(),
                    message: format!("Failed to send the email: {}", err_text),
                })),
            )
                .into_response()
        }
        Err(e) => {
            tracing::error!("Reqwest error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "EMAIL_SEND_FAILED".to_string(),
                    message: format!("Failed to send the email: {}", e),
                })),
            )
                .into_response()
        }
    }
}

async fn verify_link(
    State(state): State<AppState>,
    Json(payload): Json<VerifyLinkRequest>,
) -> impl IntoResponse {
    let user = match state.db.get_user_by_email(&payload.email).await {
        Ok(Some(u)) => u,
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!(ApiError {
                    error: "INVALID_LINK".to_string(),
                    message: "Invalid or expired link.".to_string(),
                })),
            )
                .into_response()
        }
    };

    if let (Some(db_token), Some(expires)) = (user.magic_token, user.magic_token_expires) {
        if db_token == payload.token && Utc::now() < expires {
            let _ = state.db.clear_magic_token(&payload.email).await;
            let token = create_jwt(&payload.email);
            return (
                StatusCode::OK,
                Json(json!(AuthResponse {
                    success: true,
                    token: Some(token),
                    message: "Login successful".to_string(),
                })),
            )
                .into_response();
        }
    }

    (
        StatusCode::BAD_REQUEST,
        Json(json!(ApiError {
            error: "EXPIRED_LINK".to_string(),
            message: "Link is invalid or has expired.".to_string(),
        })),
    )
        .into_response()
}
