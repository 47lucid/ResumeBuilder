use anyhow::Result;
use reqwest::Client;
use serde_json::{json, Value};

pub struct SupabaseClient {
    client: Client,
    base_url: String,
    anon_key: String,
    service_role_key: String,
}

impl SupabaseClient {
    pub fn new() -> Result<Self> {
        let base_url = std::env::var("SUPABASE_URL").expect("SUPABASE_URL must be set");
        let anon_key = std::env::var("SUPABASE_ANON_KEY").expect("SUPABASE_ANON_KEY must be set");
        let service_role_key = std::env::var("SUPABASE_SERVICE_ROLE_KEY")
            .unwrap_or_else(|_| {
                tracing::warn!("SUPABASE_SERVICE_ROLE_KEY is missing! Using ANON_KEY. User operations may fail due to RLS.");
                anon_key.clone()
            });

        Ok(Self {
            client: Client::new(),
            base_url,
            anon_key,
            service_role_key,
        })
    }

    /// Insert a new subscriber into the waitlist table
    pub async fn insert_subscriber(&self, email: &str, source: Option<&str>) -> Result<Value> {
        let url = format!("{}/rest/v1/subscribers", self.base_url);

        let body = json!({
            "email": email,
            "source": source.unwrap_or("landing_page"),
            "created_at": chrono::Utc::now().to_rfc3339(),
        });

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .header("Prefer", "return=representation")
            .json(&body)
            .send()
            .await?;

        let data: Value = response.json().await?;
        Ok(data)
    }

    /// Get total subscriber count
    pub async fn get_subscriber_count(&self) -> Result<i64> {
        let url = format!("{}/rest/v1/subscribers?select=count", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Prefer", "count=exact")
            .send()
            .await?;

        // Parse count from Content-Range header: "0-N/COUNT"
        let count = response
            .headers()
            .get("content-range")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.split('/').next_back())
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(0);

        Ok(count)
    }

    /// Get all subscriber emails for broadcast
    pub async fn get_all_emails(&self) -> Result<Vec<String>> {
        let url = format!("{}/rest/v1/subscribers?select=email", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .send()
            .await?;

        let data: Vec<serde_json::Value> = response.json().await?;
        let emails = data
            .iter()
            .filter_map(|v| v["email"].as_str().map(|s| s.to_string()))
            .collect();

        Ok(emails)
    }

    /// Check if email already exists
    pub async fn email_exists(&self, email: &str) -> Result<bool> {
        let url = format!(
            "{}/rest/v1/subscribers?email=eq.{}&select=id",
            self.base_url, email
        );

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .send()
            .await?;

        let data: Vec<serde_json::Value> = response.json().await?;
        Ok(!data.is_empty())
    }

    /// Save campaign record to DB
    pub async fn save_campaign(&self, subject: &str, recipients: usize) -> Result<()> {
        let url = format!("{}/rest/v1/campaigns", self.base_url);

        let body = json!({
            "subject": subject,
            "recipients_count": recipients,
            "sent_at": chrono::Utc::now().to_rfc3339(),
        });

        self.client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        Ok(())
    }

    /// Get campaign count
    pub async fn get_campaign_count(&self) -> Result<i64> {
        let url = format!("{}/rest/v1/campaigns?select=count", self.base_url);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Prefer", "count=exact")
            .send()
            .await?;

        let count = response
            .headers()
            .get("content-range")
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.split('/').next_back())
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(0);

        Ok(count)
    }

    /// User Operations

    pub async fn get_user_by_email(&self, email: &str) -> Result<Option<crate::models::User>> {
        let url = format!("{}/rest/v1/users?email=eq.{}", self.base_url, email);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .send()
            .await?;

        let mut data: Vec<crate::models::User> = response.json().await?;
        Ok(data.pop())
    }

    pub async fn create_user(
        &self,
        email: &str,
        password_hash: Option<&str>,
    ) -> Result<crate::models::User> {
        let url = format!("{}/rest/v1/users", self.base_url);

        let body = json!({
            "email": email,
            "password_hash": password_hash,
        });

        let response = self
            .client
            .post(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .header("Prefer", "return=representation")
            .json(&body)
            .send()
            .await?;

        let mut data: Vec<crate::models::User> = response.json().await?;
        if data.is_empty() {
            anyhow::bail!("Failed to insert user");
        }
        Ok(data.remove(0))
    }

    pub async fn update_magic_token(
        &self,
        email: &str,
        token: &str,
        expires: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        let url = format!("{}/rest/v1/users?email=eq.{}", self.base_url, email);

        let body = json!({
            "magic_token": token,
            "magic_token_expires": expires.to_rfc3339(),
        });

        self.client
            .patch(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        Ok(())
    }

    pub async fn clear_magic_token(&self, email: &str) -> Result<()> {
        let url = format!("{}/rest/v1/users?email=eq.{}", self.base_url, email);

        let body = json!({
            "magic_token": serde_json::Value::Null,
            "magic_token_expires": serde_json::Value::Null,
        });

        self.client
            .patch(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        Ok(())
    }

    pub async fn update_password(&self, email: &str, password_hash: &str) -> Result<()> {
        let url = format!("{}/rest/v1/users?email=eq.{}", self.base_url, email);

        let body = json!({
            "password_hash": password_hash,
        });

        self.client
            .patch(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        Ok(())
    }

    /// Resume Operations

    pub async fn get_resume_by_email(
        &self,
        email: &str,
    ) -> Result<Option<crate::models::ResumeData>> {
        let url = format!("{}/rest/v1/resumes?user_email=eq.{}", self.base_url, email);

        let response = self
            .client
            .get(&url)
            .header("apikey", &self.anon_key)
            .header("Authorization", format!("Bearer {}", self.service_role_key))
            .send()
            .await?;

        let mut data: Vec<crate::models::ResumeData> = response.json().await?;
        Ok(data.pop())
    }

    pub async fn upsert_resume(&self, email: &str, resume_data: &serde_json::Value) -> Result<()> {
        // Technically Supabase supports upsert via POST if conflict resolution is set,
        // but since we don't have exact PK, we can just delete and insert or post with on_conflict.
        // Let's use standard POST with Prefer: resolution=merge-duplicates if possible,
        // or just check if it exists and PATCH.
        let existing = self.get_resume_by_email(email).await?;
        if existing.is_some() {
            let url = format!("{}/rest/v1/resumes?user_email=eq.{}", self.base_url, email);
            let body = json!({
                "resume_data": resume_data,
            });
            self.client
                .patch(&url)
                .header("apikey", &self.anon_key)
                .header("Authorization", format!("Bearer {}", self.service_role_key))
                .header("Content-Type", "application/json")
                .json(&body)
                .send()
                .await?;
        } else {
            let url = format!("{}/rest/v1/resumes", self.base_url);
            let body = json!({
                "user_email": email,
                "resume_data": resume_data,
            });
            self.client
                .post(&url)
                .header("apikey", &self.anon_key)
                .header("Authorization", format!("Bearer {}", self.service_role_key))
                .header("Content-Type", "application/json")
                .json(&body)
                .send()
                .await?;
        }
        Ok(())
    }
}
