use crate::db::SupabaseClient;
use crate::models::{
    ApiError, AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest,
    ResetPasswordRequest,
};
use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<SupabaseClient>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
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

    if let Ok(Some(_)) = state.db.get_user_by_email(email).await {
        return (
            StatusCode::CONFLICT,
            Json(json!(ApiError {
                error: "ACCOUNT_EXISTS".to_string(),
                message: "Account already exists.".to_string(),
            })),
        )
            .into_response();
    }

    match state.db.create_user(email, Some(&hashed)).await {
        Ok(_) => {
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
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "SERVER_ERROR".to_string(),
                message: "Failed to create JWT.".to_string(),
            })),
        )
            .into_response(),
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
            tracing::info!("🔗 [MOCK EMAIL] Password Reset link for {}: http://localhost:3000/auth/reset?email={}&token={}", user.email, user.email, token);
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
    if state.db.update_password(&user.email, &hashed_pw).await.is_err() {
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
        .unwrap_or_else(|_| "LaunchPad <onboarding@resend.dev>".to_string());
    let client = reqwest::Client::new();
    let magic_link_url = format!(
        "http://localhost:3000/auth/callback?token={}&email={}",
        token,
        urlencoding::encode(email)
    );

    let html_content = format!(
        "<h2>Login to LaunchPad Resume Builder</h2>\
        <p>Click the link below to securely login to your account. This link will expire in 60 seconds.</p>\
        <a href=\"{}\" style=\"padding: 12px 24px; background: #a1fd60; color: #000; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;\">Login to LaunchPad</a>",
        magic_link_url
    );

    let body = serde_json::json!({
        "from": from_email,
        "to": [email],
        "subject": "Your Magic Login Link - LaunchPad Resume Builder",
        "html": html_content,
    });

    if client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", resend_api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false)
    {
        (
            StatusCode::OK,
            Json(json!(MagicLinkResponse {
                success: true,
                message: "Magic link sent successfully. Check your inbox (expires in 60s)."
                    .to_string(),
            })),
        )
            .into_response()
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "EMAIL_SEND_FAILED".to_string(),
                message: "Failed to send the email.".to_string(),
            })),
        )
            .into_response()
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
