use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[allow(dead_code)] // Deserialized from Supabase responses; not directly constructed in app code
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subscriber {
    pub id: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub source: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct SubscribeRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub source: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SubscribeResponse {
    pub success: bool,
    pub message: String,
    pub subscriber_count: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct MetricsResponse {
    pub subscriber_count: i64,
    pub campaign_count: i64,
    pub launch_day: i64,
    pub open_rate: f64,
}

#[derive(Debug, Deserialize, Validate)]
pub struct BroadcastRequest {
    #[validate(length(min = 1, message = "Subject cannot be empty"))]
    pub subject: String,
    #[validate(length(min = 1, message = "Body cannot be empty"))]
    pub body: String,
    /// Optional: only send to specific emails (for testing)
    pub test_recipients: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
pub struct BroadcastResponse {
    pub success: bool,
    pub message: String,
    pub recipients_count: usize,
}

#[derive(Debug, Serialize)]
pub struct ApiError {
    pub error: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: Option<String>,
    pub magic_token: Option<String>,
    pub magic_token_expires: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub password: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub password: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ForgotPasswordRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ResetPasswordRequest {
    #[validate(email(message = "Invalid email address"))]
    pub email: String,
    pub token: String,
    pub new_password: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub success: bool,
    pub token: Option<String>,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResumeData {
    pub id: String,
    pub user_email: String,
    pub resume_data: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct SaveResumeRequest {
    pub resume_data: serde_json::Value,
}
