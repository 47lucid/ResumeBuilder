<div align="center">

<img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Status">
<img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
<img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
<img src="https://img.shields.io/badge/Rust-1.83-orange?style=flat-square&logo=rust" alt="Rust">
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase" alt="Supabase">
<img src="https://img.shields.io/github/actions/workflow/status/47lucid/ResumeBuilder/ci-cd.yml?style=flat-square&label=CI%2FCD" alt="CI/CD">

<br /><br />

# ⬡ LaunchPad Resume Builder

**A production-grade, full-stack resume builder built for modern professionals.**  
AI-enhanced bullet points · Passwordless magic-link auth · Cloud sync · One-click PDF export

[**Live Demo**](https://launchpad-frontend-latest.onrender.com) · [**Report a Bug**](https://github.com/47lucid/ResumeBuilder/issues) · [**Request Feature**](https://github.com/47lucid/ResumeBuilder/issues)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Enhancement** | Groq-powered Llama 3.3 rewrites your resume bullets, summary, and skills to be ATS-optimized |
| 🔒 **Magic Link Auth** | Passwordless login via Resend email — no passwords to remember or leak |
| ☁️ **Cloud Sync** | Resumes are securely saved to Supabase PostgreSQL and accessible from any device |
| 📄 **3 Premium Templates** | Modern, Minimal, and Creative — all print-ready with glassmorphism design |
| ↓ **PDF Export** | One-click, browser-native, pixel-perfect PDF export with no watermarks |
| 🔐 **JWT Sessions** | Stateless JWTs with inactivity timeout (15 min) and automatic expiry validation |
| 🚀 **Production Ready** | Docker multi-stage builds, GitHub Actions CI/CD, Render deploy hooks |

---

## 🏗️ Architecture

```
ResumeBuilder/
├── launchpad-frontend/     # Next.js 16 + React 19 (App Router)
│   ├── app/
│   │   ├── page.tsx            # Landing page (hero, features, templates)
│   │   ├── dashboard/          # Resume editor + live preview
│   │   ├── auth/callback/      # Magic link verification + bloom animation
│   │   ├── explore/            # Template showcase
│   │   ├── components/
│   │   │   └── templates/      # Modern, Minimal, Creative templates
│   │   └── context/
│   │       └── AuthContext.tsx # JWT auth context (lazy initializer pattern)
│   └── Dockerfile              # 3-stage Node build (deps → build → runner)
│
├── launchpad-backend/      # Rust + Axum (async, ~5ms p99 latency)
│   ├── src/
│   │   ├── main.rs             # Server entry, routing, CORS
│   │   ├── auth.rs             # Magic link, JWT, password auth
│   │   ├── ai.rs               # Groq Cloud (Llama 3.3-70b) integration
│   │   ├── resume.rs           # Resume CRUD via Supabase REST
│   │   ├── waitlist.rs         # Waitlist + Resend welcome email
│   │   ├── db.rs               # Supabase client (typed REST calls)
│   │   ├── email.rs            # Email broadcasting
│   │   ├── metrics.rs          # Platform metrics endpoint
│   │   └── models.rs           # Shared request/response types
│   └── Dockerfile              # 2-stage Rust build → Debian slim runtime
│
├── .github/workflows/
│   ├── ci-cd.yml           # Lint → Type-check → Docker push → Render deploy
│   └── benchmark.yml       # wrk load test (runs on main branch changes)
│
├── keep-alive.ts           # Multi-URL keep-alive pinger (for Render free tier)
└── benchmark.ts            # Local load test using autocannon
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — App Router, `output: standalone` for Docker
- **[React 19](https://react.dev/)** with React Compiler enabled
- **Vanilla CSS** with custom design tokens (Space Grotesk, glassmorphism theme)
- **TypeScript 5** — strict mode, zero ESLint errors

### Backend
- **[Rust](https://www.rust-lang.org/)** + **[Axum](https://github.com/tokio-rs/axum)** — async, minimal overhead
- **[Tokio](https://tokio.rs/)** runtime for high-concurrency request handling
- **[SQLx](https://github.com/launchbadge/sqlx)** / Supabase REST API via `reqwest`
- **[jsonwebtoken](https://crates.io/crates/jsonwebtoken)** for stateless JWT auth

### Infrastructure & Services
| Service | Purpose |
|---|---|
| **[Supabase](https://supabase.com/)** | PostgreSQL DB (subscribers, users, resumes, campaigns) |
| **[Resend](https://resend.com/)** | Transactional email (magic links, welcome emails) |
| **[Groq Cloud](https://groq.com/)** | Llama 3.3-70b inference for AI resume enhancement |
| **[Render](https://render.com/)** | Hosting (web services for frontend + backend) |
| **[GHCR](https://ghcr.io)** | Docker image registry (GitHub Container Registry) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Rust 1.83+ (`rustup install stable`)
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) account
- A [Groq](https://console.groq.com/) API key

### 1. Clone the repository

```bash
git clone https://github.com/47lucid/ResumeBuilder.git
cd ResumeBuilder
```

### 2. Configure the backend environment

```bash
cp launchpad-backend/.env.example launchpad-backend/.env
```

Edit `launchpad-backend/.env`:

```env
# Server
PORT=8080

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
JWT_SECRET=your_super_secret_key_min_32_chars

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=LaunchPad <noreply@yourdomain.com>

# AI (Groq)
GROQ_API_KEY=gsk_your_groq_key
```

### 3. Configure the frontend environment

```bash
# launchpad-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4. Run locally

**Backend:**
```bash
cd launchpad-backend
cargo run
# → Server starts on http://localhost:8080
# → Health check: http://localhost:8080/health
```

**Frontend (in a separate terminal):**
```bash
cd launchpad-frontend
npm install
npm run dev
# → App running at http://localhost:3000
```

---

## 🐳 Docker

Build and run both services with Docker:

```bash
# Backend
docker build -t launchpad-backend ./launchpad-backend
docker run -p 8080:8080 --env-file launchpad-backend/.env launchpad-backend

# Frontend
docker build -t launchpad-frontend ./launchpad-frontend
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 launchpad-frontend
```

---

## 🔄 CI/CD Pipeline

GitHub Actions runs on every push to `main`:

```
Push to main
    │
    ├── [backend-check]   cargo fmt --check + cargo clippy + cargo check
    ├── [frontend-check]  tsc --noEmit + eslint
    │
    └── [docker-build-push]   Builds & pushes to GHCR
            │
            └── [deploy-render]   Triggers Render deploy hooks
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL for the backend service |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render deploy hook URL for the frontend service |
| `SUPABASE_URL` | Used in benchmark CI job |
| `SUPABASE_ANON_KEY` | Used in benchmark CI job |
| `SUPABASE_SERVICE_ROLE_KEY` | Used in benchmark CI job |
| `GROQ_API_KEY` | Used in benchmark CI job |
| `RESEND_API_KEY` | Used in benchmark CI job |

---

## 📊 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check with timestamp |
| `POST` | `/api/auth/register` | Register with email + password |
| `POST` | `/api/auth/login` | Login with email + password |
| `POST` | `/api/auth/magic-link` | Send passwordless magic link |
| `GET` | `/api/auth/verify-link` | Verify magic link token |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/resume` | Fetch saved resume (JWT required) |
| `POST` | `/api/resume` | Save/update resume (JWT required) |
| `POST` | `/api/ai/enhance` | Enhance resume with Groq AI |
| `POST` | `/api/waitlist/subscribe` | Join the waitlist |
| `GET` | `/api/waitlist/count` | Get subscriber count |
| `GET` | `/api/metrics` | Platform metrics |

---

## 🏎️ Performance & Benchmarking

Run a local load test against the backend:

```bash
# Start the backend first, then:
BACKEND_URL=http://localhost:8080 npx tsx benchmark.ts
```

Or trigger the GitHub Actions benchmark workflow manually from the Actions tab.

**Benchmarked endpoints:** `/health`, `/api/metrics`, `POST /api/waitlist/subscribe`

---

## 🔧 Keep-Alive (Render Free Tier)

To prevent Render's free tier from spinning down your services, use an external pinger (e.g. [UptimeRobot](https://uptimerobot.com/)) pointing to:

```
https://your-backend.onrender.com/health
https://your-frontend.onrender.com
```

Or run the built-in keep-alive pinger:

```bash
KEEP_ALIVE_URLS=https://your-backend.onrender.com,https://your-frontend.onrender.com \
  npx tsx keep-alive.ts
```

---

## 🗄️ Database Schema

The backend expects the following tables in your Supabase project:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  magic_token TEXT,
  magic_token_expires TIMESTAMPTZ
);

-- Resumes  
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  resume_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  recipients_count INT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit with a clear message — `git commit -m 'feat: add your feature'`
4. Push to your fork — `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure:
- `cargo fmt` passes for Rust changes
- `cargo clippy` has no warnings
- `npm run lint` passes for frontend changes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using **Rust**, **Next.js**, **Supabase**, and **Groq AI**

⬡ [LaunchPad Resume](https://github.com/47lucid/ResumeBuilder)

</div>
