use crate::db::SupabaseClient;
use crate::models::{ApiError, SaveResumeRequest};
use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};

use serde_json::json;
use std::sync::Arc;

use crate::auth::extract_email_from_token;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<SupabaseClient>,
}

pub fn router(db: Arc<SupabaseClient>) -> Router {
    let state = AppState { db };
    Router::new()
        .route("/", get(get_resume).post(save_resume))
        .with_state(state) // Mount base at /api/resume
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
