# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────────────────────
FROM rust:1.83-slim AS builder

# build-essential is required by bcrypt (native C bindings via cc crate).
# pkg-config + libssl-dev kept in case any future dep needs them.
# ca-certificates ensures HTTPS works during the build (crate downloads).
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependency caching layer ──────────────────────────────────────────────────
# Copy manifests only first. Then create a minimal stub for EVERY source file
# so `cargo build --release` can compile ALL external crates without seeing
# the real application code. This layer is cached unless Cargo.toml or
# Cargo.lock change.
COPY Cargo.toml Cargo.lock ./

RUN mkdir src && \
    # Dummy binary entry point (no mod declarations — avoids needing stubs)
    echo 'fn main() { println!("stub"); }' > src/main.rs && \
    # Stub every module so rustc can verify extern crate usage without code
    for mod in ai auth db email metrics models resume waitlist; do \
      echo "" > src/${mod}.rs; \
    done

# Build and cache all dependencies
RUN cargo build --release

# ── Application build layer ───────────────────────────────────────────────────
# Remove ALL fingerprints and compiled artifacts for our own crate so cargo
# does a clean rebuild of application code against the cached dep artifacts.
RUN rm -rf \
    target/release/.fingerprint/launchpad-backend-* \
    target/release/deps/launchpad_backend-* \
    target/release/launchpad-backend

# Copy real source and compile the final binary
COPY src ./src
RUN touch src/*.rs && cargo build --release

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — minimal Debian, no Rust toolchain, no build tools
# ─────────────────────────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

# ca-certificates for outbound HTTPS (Supabase, Groq, Resend).
# curl for the Docker HEALTHCHECK.
# No libssl3 needed — reqwest uses rustls (pure Rust TLS).
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root for security
RUN useradd -ms /bin/bash appuser
USER appuser
WORKDIR /home/appuser

# Copy the statically-linked binary from builder
COPY --from=builder /app/target/release/launchpad-backend ./launchpad-backend

EXPOSE 8080

# Health check — Render and Docker will use this to confirm the service is up
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f "http://localhost:${PORT:-8080}/health" || exit 1

CMD ["./launchpad-backend"]
