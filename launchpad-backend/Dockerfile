# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build (uses official Rust image — musl for fully static binary)
# ─────────────────────────────────────────────────────────────────────────────
FROM rust:1.83-slim AS builder

# Install build deps for musl/OpenSSL
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies first (faster rebuilds)
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -f target/release/deps/launchpad_backend*

# Now copy real source and do the real build
COPY src ./src
RUN cargo build --release

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime (minimal Debian — no Rust toolchain)
# ─────────────────────────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

# Install only runtime deps (libssl, ca-certs for HTTPS outbound)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -ms /bin/bash appuser
USER appuser
WORKDIR /home/appuser

# Copy the compiled binary
COPY --from=builder /app/target/release/launchpad-backend ./launchpad-backend

# Expose the port Render will inject via $PORT
EXPOSE 8080

# Health check for Docker / Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

CMD ["./launchpad-backend"]
