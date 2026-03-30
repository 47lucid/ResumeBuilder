"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { getApiUrl } from "./lib/api";

/* ─── Sub-components ─────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        background: scrolled ? "rgba(14,14,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(72,72,73,0.12)" : "none",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
          fontSize: "1.25rem",
          letterSpacing: "-0.04em",
          color: "var(--primary)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>⬡</span>
        LaunchPad Resume
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["Templates", "Features"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              color: "var(--on-surface-variant)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "var(--on-surface)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color =
                "var(--on-surface-variant)")
            }
          >
            {item}
          </Link>
        ))}
        <Link
          href="#login"
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "0.875rem", textDecoration: "none" }}
        >
          Login / Start Building
        </Link>
      </div>
    </nav>
  );
}

function LiveResumeCard() {
  return (
    <div
      className="animate-float"
      style={{
        position: "relative",
        width: "380px",
        flexShrink: 0,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Ambient glow behind card */}
      <div
        style={{
          position: "absolute",
          inset: "-40px",
          background:
            "radial-gradient(ellipse at center, rgba(161,253,96,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main glass card - Resume Mock */}
      <div
        className="glass-card"
        style={{
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
          transform: "rotateY(-15deg) rotateX(5deg)",
          boxShadow: "var(--shadow-ambient)",
        }}
      >
        {/* Profile Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--on-primary)",
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--on-surface)",
                letterSpacing: "-0.02em",
              }}
            >
              Alex Developer
            </div>
            <div style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 500 }}>
              Senior Next.js Engineer
            </div>
          </div>
        </div>

        {/* Mock Content */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Experience
          </div>
          <div style={{ background: "var(--surface-container)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ color: "var(--on-surface)", fontWeight: 600, fontSize: "0.875rem" }}>TechCorp Inc.</span>
              <span style={{ color: "var(--on-surface-variant)", fontSize: "0.75rem" }}>2022 - Present</span>
            </div>
            <div style={{ height: "4px", width: "100%", background: "var(--surface-bright)", borderRadius: "var(--radius-full)", marginBottom: "0.5rem" }} />
            <div style={{ height: "4px", width: "80%", background: "var(--surface-bright)", borderRadius: "var(--radius-full)" }} />
          </div>
        </div>

        {/* Skills Chips */}
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Top Skills
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["React", "Rust", "TypeScript", "Tailwind"].map((skill) => (
              <span key={skill} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"magic" | "login" | "register" | "forgot">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");

    try {
      if (mode === "magic") {
        const res = await fetch(getApiUrl("/api/auth/magic-link"), {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (res.ok) {
          setStatus("success");
          setMessage("Magic link sent! Check your inbox.");
          setEmail("");
        } else {
          const d = await res.json();
          setStatus("error");
          setMessage(d.message || "Failed to send link.");
        }
      } else if (mode === "forgot") {
        const res = await fetch(getApiUrl("/api/auth/forgot-password"), {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setStatus("success");
          setMessage("If the email exists, a reset link was sent.");
          setEmail("");
        } else {
          setStatus("error");
          setMessage("Failed to process request.");
        }
      } else {
        const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
        const res = await fetch(getApiUrl(endpoint), {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const d = await res.json();
        
        if (res.ok && d.success && d.token) {
          setStatus("success");
          setMessage(mode === "login" ? "Welcome back!" : "Account created!");
          login(d.token);
          // Briefly wait for UI updates then redirect
          setTimeout(() => router.push("/dashboard"), 800);
        } else {
          setStatus("error");
          setMessage(d.message || "Authentication failed.");
        }
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Is the backend running?");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{
          position: "relative",
          display: "inline-flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "100px",
          padding: "4px",
          marginBottom: "1.5rem",
          gap: "4px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        {/* Sliding Pill Background inside Glassmorphism container */}
        <div style={{
            position: "absolute",
            top: "4px",
            bottom: "4px",
            width: mode === "magic" ? "100px" : mode === "login" ? "130px" : mode === "register" ? "90px" : "0px",
            left: mode === "magic" ? "4px" : mode === "login" ? "108px" : "242px",
            background: "var(--primary)",
            borderRadius: "100px",
            transition: "left 0.42s cubic-bezier(0.34, 1.2, 0.64, 1), width 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
            opacity: mode === "forgot" ? 0 : 1,
            zIndex: 0
        }} />

        <button 
          type="button"
          onClick={() => { setStatus("idle"); setMessage(""); setMode("magic"); }} 
          style={{ width: "100px", position: "relative", zIndex: 1, background: "transparent", color: mode === "magic" ? "#000" : "var(--on-surface)", padding: "8px 0", borderRadius: "100px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.3s ease", textAlign: "center" }}
        >
          Magic Link
        </button>
        <button 
          type="button"
          onClick={() => { setStatus("idle"); setMessage(""); setMode("login"); }} 
          style={{ width: "130px", position: "relative", zIndex: 1, background: "transparent", color: mode === "login" ? "#000" : "var(--on-surface)", padding: "8px 0", borderRadius: "100px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.3s ease", textAlign: "center" }}
        >
          Password Login
        </button>
        <button 
          type="button"
          onClick={() => { setStatus("idle"); setMessage(""); setMode("register"); }} 
          style={{ width: "90px", position: "relative", zIndex: 1, background: "transparent", color: mode === "register" ? "#000" : "var(--on-surface)", padding: "8px 0", borderRadius: "100px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "color 0.3s ease", textAlign: "center" }}
        >
          Register
        </button>
      </div>

      <form id="login" onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="input-neon"
          style={{ flex: "1 1 200px", padding: "14px 18px", fontSize: "0.9375rem" }}
          disabled={status === "loading" || status === "success"}
        />
        {mode !== "magic" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="input-neon"
            style={{ flex: "1 1 200px", padding: "14px 18px", fontSize: "0.9375rem" }}
            disabled={status === "loading" || status === "success"}
          />
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "loading" || status === "success"}
          style={{ padding: "14px 28px", fontSize: "0.9375rem", flexShrink: 0, opacity: status === "loading" ? 0.7 : 1, cursor: status === "loading" ? "wait" : "pointer" }}
        >
          {status === "loading" ? "Processing..." : status === "success" ? "✓ Success!" : mode === "magic" ? "Send Link →" : mode === "login" ? "Login →" : mode === "forgot" ? "Send Reset Link →" : "Register →"}
        </button>
        
        {mode === "login" && (
          <div style={{ flex: "1 1 100%", marginTop: "4px" }}>
            <button 
              type="button"
              onClick={() => { setStatus("idle"); setMessage(""); setMode("forgot"); }}
              style={{ background: "transparent", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline", padding: 0 }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {mode === "forgot" && (
           <div style={{ flex: "1 1 100%", marginTop: "4px" }}>
            <button 
              type="button"
              onClick={() => { setStatus("idle"); setMessage(""); setMode("login"); }}
              style={{ background: "transparent", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline", padding: 0 }}
            >
              ← Back to Login
            </button>
          </div>
        )}

        {message && (
          <p style={{ flex: "1 1 100%", fontSize: "0.875rem", color: status === "error" ? "var(--error)" : "var(--primary)", marginTop: "4px" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

const features = [
  {
    id: "ai-editing",
    icon: "✦",
    title: "AI-Powered Editing",
    desc: "Craft the perfect bullet points with AI that understands industry keywords and impact metrics.",
    accent: "var(--primary)",
    glow: "rgba(161,253,96,0.06)",
  },
  {
    id: "live-preview",
    icon: "👁️",
    title: "Live Preview",
    desc: "See your changes instantly. What you see is exactly what recruiters will see.",
    accent: "var(--secondary)",
    glow: "rgba(0,238,252,0.06)",
  },
  {
    id: "export",
    icon: "↓",
    title: "One-Click Export",
    desc: "Download pixel-perfect, ATS-friendly PDFs instantly with no watermarks.",
    accent: "var(--tertiary)",
    glow: "rgba(255,109,207,0.06)",
  },
  {
    id: "save",
    icon: "☁️",
    title: "Saved Resumes via Supabase",
    desc: "Your resumes are securely stored in the cloud. Access and edit them from any device, anywhere.",
    accent: "var(--primary)",
    glow: "rgba(161,253,96,0.06)",
  },
  {
    id: "login",
    icon: "🔒",
    title: "Secure Magic Links",
    desc: "Passwordless login powered by Resend. Just click the magic link in your email and you're in.",
    accent: "var(--secondary)",
    glow: "rgba(0,238,252,0.06)",
  }
];

function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: "var(--surface-container-low)",
        padding: "6rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <span className="badge" style={{ marginBottom: "1rem", display: "inline-block" }}>
            PREMIUM FEATURES
          </span>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "var(--on-surface)",
              marginBottom: "0.75rem",
            }}
          >
            Built for modern professionals
          </h2>
          <p
            style={{
              color: "var(--on-surface-variant)",
              fontSize: "1rem",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Every tool you need to curate your professional narrative and stand out to top-tier companies.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {features.map((f) => (
            <div
              key={f.id}
              style={{
                flex: "1 1 300px",
                maxWidth: "400px",
                background: `radial-gradient(circle at top left, ${f.glow}, var(--surface-container) 60%)`,
                border: "1px solid rgba(72,72,73,0.12)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-ambient)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "1.25rem",
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--surface-container-high)",
                  borderRadius: "var(--radius-md)",
                  color: f.accent
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--on-surface)",
                  marginBottom: "0.75rem",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateShowcase() {
  return (
    <section id="templates" style={{ padding: "6rem 2rem", background: "var(--background)", overflow: "hidden" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4rem" }}>
        
        {/* Left Side: Cards overlapping */}
        <div style={{ flex: "1 1 400px", position: "relative", height: "400px" }}>
          <div className="glass-card" style={{ position: "absolute", top: "10%", left: "5%", width: "240px", height: "300px", transform: "rotate(-8deg)", zIndex: 1, boxShadow: "var(--shadow-ambient)" }} />
          <div className="glass-card" style={{ position: "absolute", top: "20%", left: "30%", width: "240px", height: "300px", transform: "rotate(4deg)", background: "rgba(0,238,252,0.05)", zIndex: 2, boxShadow: "var(--shadow-ambient)", border: "1px solid rgba(0,238,252,0.2)" }} />
          <div className="glass-card" style={{ position: "absolute", top: "5%", left: "55%", width: "240px", height: "300px", transform: "rotate(12deg)", zIndex: 1, boxShadow: "var(--shadow-ambient)" }} />
        </div>

        {/* Right Side: Copy */}
        <div style={{ flex: "1 1 400px" }}>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "var(--on-surface)",
              marginBottom: "1.5rem",
            }}
          >
            Curated Templates for <span style={{ color: "var(--secondary)" }}>Top Performers.</span>
          </h2>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "1.0625rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Avoid generic word documents. Our templates are designed by top recruiters and visual designers to pass through ATS systems while still looking visually stunning.
          </p>
          <Link href="/explore" className="btn-secondary" style={{ padding: "12px 24px", fontSize: "0.9375rem", textDecoration: "none", display: "inline-block" }}>
            Explore Templates
          </Link>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { label: "Secure Login via Email", icon: "🔒" },
  { label: "Choose a Template", icon: "📄" },
  { label: "Export & Share", icon: "🚀" },
];

function HowItWorks() {
  return (
    <section
      style={{
        background: "var(--surface-container-low)",
        padding: "5rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            Start building in seconds
          </h2>
        </div>

        {/* Horizontal flow */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {steps.map((m, i) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div
                style={{
                  padding: "16px 24px",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--surface-container)",
                  border: "1px solid rgba(72,72,73,0.3)",
                  color: "var(--on-surface)",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    height: "2px",
                    width: "40px",
                    background: "var(--outline-variant)",
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface-container-low)",
        borderTop: "1px solid rgba(72,72,73,0.1)",
        padding: "2.5rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.04em",
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          ⬡ LaunchPad Resume
        </Link>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} LaunchPad Group.
        </p>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          {["Privacy", "Terms"].map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase()}`}
              style={{ color: "var(--on-surface-variant)", fontSize: "0.8rem", textDecoration: "none" }}
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "7rem 2rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background ambient lighting */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "50%",
            height: "70%",
            background: "var(--gradient-hero)",
            filter: "blur(100px)",
            pointerEvents: "none",
            zIndex: -1,
            animation: "orb-drift 20s infinite alternate ease-in-out",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "4rem",
            zIndex: 1,
          }}
        >
          {/* Left Area */}
          <div
            className="animate-fade-up"
            style={{
              flex: "1 1 500px",
              maxWidth: "600px",
            }}
          >
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "var(--on-surface)",
                marginBottom: "1.5rem",
              }}
            >
              Your Resume. <br />
              <span
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Reimagined.
              </span>
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--on-surface-variant)",
                lineHeight: 1.6,
                maxWidth: "480px",
              }}
            >
              Stop treating your career history like a form. Design premium, ATS-ready resumes that open doors to top tech companies. Connect securely and save everything in the cloud.
            </p>

            {/* Email Magic Link Form Container */}
            <LoginForm />
          </div>

          {/* Right Area (3D Glass Card Mock) */}
          <LiveResumeCard />
        </div>
      </section>

      {/* Rest of the page */}
      <FeaturesSection />
      <TemplateShowcase />
      <HowItWorks />
      <Footer />
    </>
  );
}
