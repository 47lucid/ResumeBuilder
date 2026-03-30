use axum::{http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use serde_json::json;

use crate::{
    db::SupabaseClient,
    models::{ApiError, MetricsResponse},
};

pub fn router() -> Router {
    Router::new().route("/", get(get_metrics))
}

/// GET /api/metrics
/// Returns launch metrics: subscriber count, campaign count, days since launch
async fn get_metrics() -> impl IntoResponse {
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

    // Fetch subscriber count
    let subscriber_count = db.get_subscriber_count().await.unwrap_or(0);

    // Fetch campaign count
    let campaign_count = db.get_campaign_count().await.unwrap_or(0);

    // Days since launch (read from env, default to a placeholder)
    let launch_day = std::env::var("LAUNCH_TIMESTAMP")
        .ok()
        .and_then(|ts| ts.parse::<i64>().ok())
        .map(|ts| {
            let now = chrono::Utc::now().timestamp();
            (now - ts) / 86400
        })
        .unwrap_or(0);

    // Open rate placeholder (can be wired to actual Resend webhooks later)
    let open_rate = 0.0f64;

    (
        StatusCode::OK,
        Json(json!(MetricsResponse {
            subscriber_count,
            campaign_count,
            launch_day,
            open_rate,
        })),
    )
        .into_response()
}
