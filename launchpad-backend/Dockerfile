# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Chef base — cargo-chef handles dep-caching correctly
# ─────────────────────────────────────────────────────────────────────────────
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef

# ring (dep of rustls → reqwest) and bcrypt both compile native C.
# build-essential provides gcc/g++/make. pkg-config + libssl-dev for any
# crates that link against OpenSSL. ca-certificates for HTTPS during build.
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Planner — analyses the dependency graph, outputs a recipe
# ─────────────────────────────────────────────────────────────────────────────
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Builder — cook deps first (cached), then build the app
# ─────────────────────────────────────────────────────────────────────────────
FROM chef AS builder

# Cook (compile) only the dependencies using the recipe.
# This layer is cached as long as Cargo.toml / Cargo.lock haven't changed.
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Now copy the real source and build only the application code.
# Deps are already compiled in the layer above — this is fast.
COPY . .
RUN cargo build --release --bin launchpad-backend

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: Runtime — minimal Debian, no Rust toolchain, no build tools
# ─────────────────────────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

# ca-certificates for outbound HTTPS (Supabase, Groq, Resend).
# curl for the Docker/Render HEALTHCHECK.
# No libssl needed — reqwest uses pure-Rust rustls.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root
RUN useradd -ms /bin/bash appuser
USER appuser
WORKDIR /home/appuser

# Default ENV fallback (can be overridden at runtime)
ENV RESEND_FROM_EMAIL="auth@aurain.me"

COPY --from=builder /app/target/release/launchpad-backend ./launchpad-backend

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f "http://localhost:${PORT:-8080}/health" || exit 1

CMD ["./launchpad-backend"]
