use axum::{http::Method, Router};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod ai;
mod auth;
mod db;
mod email;
mod metrics;
mod models;
mod resume;
mod waitlist;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env
    dotenv::dotenv().ok();

    // Init tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "launchpad_backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db_client = std::sync::Arc::new(
        db::SupabaseClient::new().expect("Failed to initialize Supabase DB client"),
    );

    // CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS, Method::PATCH])
        .allow_origin(Any)
        .allow_headers(Any);

    // Build API router using the flattened modules
    let api_router = Router::new()
        .nest("/auth", auth::router(db_client.clone()))
        .nest("/waitlist", waitlist::router())
        .nest("/email", email::router())
        .nest("/metrics", metrics::router())
        .nest("/resume", resume::router(db_client.clone()))
        .nest("/ai", ai::router());

    // Build main app router
    let app = Router::new()
        .route("/health", axum::routing::get(|| async { 
            axum::Json(serde_json::json!({ "status": "ok", "timestamp": chrono::Utc::now().to_rfc3339() })) 
        }))
        .nest("/api", api_router)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);
    let addr: SocketAddr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("🚀 LaunchPad backend listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
