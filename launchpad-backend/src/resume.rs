use crate::db::SupabaseClient;
use crate::models::{ApiError, SaveResumeRequest};
use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<SupabaseClient>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

pub fn router(db: Arc<SupabaseClient>) -> Router {
    let state = AppState { db };
    Router::new()
        .route("/", get(get_resume).post(save_resume))
        .with_state(state) // Mount base at /api/resume
}

fn extract_email_from_token(headers: &HeaderMap) -> Result<String, ()> {
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

async fn get_resume(headers: HeaderMap, State(state): State<AppState>) -> impl IntoResponse {
    let email = match extract_email_from_token(&headers) {
        Ok(e) => e,
        Err(_) => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "UNAUTHORIZED".to_string(),
                    message: "Invalid or missing token.".to_string(),
                })),
            )
                .into_response()
        }
    };

    match state.db.get_resume_by_email(&email).await {
        Ok(Some(resume)) => (StatusCode::OK, Json(resume.resume_data)).into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(json!(ApiError {
                error: "NOT_FOUND".to_string(),
                message: "No resume found.".to_string(),
            })),
        )
            .into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_ERROR".to_string(),
                message: "Failed to fetch resume.".to_string(),
            })),
        )
            .into_response(),
    }
}

async fn save_resume(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<SaveResumeRequest>,
) -> impl IntoResponse {
    let email = match extract_email_from_token(&headers) {
        Ok(e) => e,
        Err(_) => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "UNAUTHORIZED".to_string(),
                    message: "Invalid or missing token.".to_string(),
                })),
            )
                .into_response()
        }
    };

    match state.db.upsert_resume(&email, &payload.resume_data).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({"success": true, "message": "Resume securely saved in the cloud!"})),
        )
            .into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!(ApiError {
                error: "DB_ERROR".to_string(),
                message: "Failed to save resume.".to_string(),
            })),
        )
            .into_response(),
    }
}
