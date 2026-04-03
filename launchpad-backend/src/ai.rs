use crate::auth::extract_email_from_token;
use crate::models::ApiError;
use axum::{
    extract::Json,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::post,
    Router,
};
use serde::Serialize;
use serde_json::json;

#[derive(Serialize)]
pub struct EnhanceResponse {
    pub enhanced_text: String,
}

pub fn router() -> Router {
    Router::new().route("/enhance", post(enhance_text))
}

/// POST /ai/enhance
/// Rewrites resume sections using Groq Cloud API (Llama 3)
async fn enhance_text(
    headers: HeaderMap,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // SECURITY: Validate JWT token
    let _email = match extract_email_from_token(&headers) {
        Ok(e) => e,
        Err(_) => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!(ApiError {
                    error: "UNAUTHORIZED".to_string(),
                    message: "Invalid or missing token. You must be signed in to use AI features."
                        .to_string(),
                })),
            )
                .into_response()
        }
    };

    let groq_api_key = match std::env::var("GROQ_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            tracing::error!("GROQ_API_KEY is missing");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "CONFIG_ERROR".to_string(),
                    message: "AI service is not configured.".to_string(),
                })),
            )
                .into_response();
        }
    };

    let client = reqwest::Client::new();

    let system_prompt = "You are an expert executive resume writer and strict data processor. You will receive a JSON object representing the user's current resume draft, including a 'summary', 'skills' list, and an 'experiences' array containing objects with raw input. Your job is to deeply enhance ALL sections to be highly professional and ATS-optimized.
CRITICAL: If an experience 'rawText' implies multiple jobs or promotions, you MUST split them into multiple separate experience objects!
CRITICAL: You MUST output ONLY valid JSON matching this exact structure containing the enhanced fields:
{
  \"summary\": \"The enhanced 2-3 sentence overview...\",
  \"skills\": \"A clean, comma-separated list of ATS-friendly keywords...\",
  \"experiences\": [
    {
       \"id\": \"Keep original ID or generate a new unique string if you invent a new one\",
       \"sectionTitle\": \"Maintain the original section object's title, e.g. Professional Experience, Education, Projects\",
       \"company\": \"Company name...\",
       \"role\": \"Job Title...\",
       \"duration\": \"YYYY - YYYY...\",
       \"enhancedBullets\": [\"Bullet point 1...\", \"Bullet point 2...\"]
    }
  ]
}
Return ONLY the JSON object. NO conversational filler.";

    let body = serde_json::json!({
        "model": "llama-3.3-70b-versatile",
        "response_format": { "type": "json_object" },
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": payload.to_string()
            }
        ],
        "temperature": 0.3,
        "max_tokens": 2048,
    });

    match client
        .post("https://api.groq.com/openai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", groq_api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => {
            let json_resp: serde_json::Value = match resp.json().await {
                Ok(v) => v,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!(ApiError {
                            error: "AI_PARSE_ERROR".to_string(),
                            message: "Failed to parse AI response.".to_string(),
                        })),
                    )
                        .into_response();
                }
            };

            let enhanced_text = json_resp["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or_default()
                .trim()
                .to_string();

            (
                StatusCode::OK,
                Json(json!(EnhanceResponse { enhanced_text })),
            )
                .into_response()
        }
        Ok(resp) => {
            let error_text = resp.text().await.unwrap_or_default();
            tracing::error!("Groq API error: {}", error_text);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "AI_GENERATION_FAILED".to_string(),
                    message: "Failed to enhance text using AI.".to_string(),
                })),
            )
                .into_response()
        }
        Err(e) => {
            tracing::error!("Reqwest failed: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!(ApiError {
                    error: "EXTERNAL_API_ERROR".to_string(),
                    message: "Failed to connect to the AI service.".to_string(),
                })),
            )
                .into_response()
        }
    }
}
