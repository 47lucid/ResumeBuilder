"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl } from "../../lib/api";


function ResetPasswordUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!email || !token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", maxWidth: "400px" }}>
          <h2 style={{ color: "var(--error)", marginBottom: "1rem" }}>Invalid Reset Link</h2>
          <p style={{ color: "var(--on-surface-variant)", marginBottom: "2rem" }}>Missing required parameters. Please request a new link.</p>
          <button onClick={() => router.push("/")} className="btn-secondary" style={{ padding: "10px 20px" }}>Return Home</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(getApiUrl("/api/auth/reset-password"), {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, new_password: password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Password reset successfully! Returning to login...");
        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password. Link may be expired.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Could not reach server.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "var(--background)" }}>
      <div style={{ zIndex: 10, width: "100%", maxWidth: "450px", padding: "20px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(161,253,96,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid rgba(161,253,96,0.2)" }}>
            <span style={{ fontSize: "2rem" }}>🔐</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "2rem", fontWeight: 700, color: "var(--on-surface)", marginBottom: "0.5rem" }}>
            Secure Reset
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "1rem" }}>
            Enter a new password for <strong>{email}</strong>
          </p>
        </div>

        {status === "success" ? (
           <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
             <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
             <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>Password Updated</h2>
             <p style={{ color: "var(--on-surface-variant)" }}>Your account is secure. Redirecting...</p>
           </div>
        ) : (
          <form className="glass-card" onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-neon"
              style={{ padding: "14px 18px", width: "100%" }}
              disabled={status === "loading"}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-neon"
              style={{ padding: "14px 18px", width: "100%" }}
              disabled={status === "loading"}
            />
            
            <button
              type="submit"
              className="btn-primary"
              disabled={status === "loading"}
              style={{ padding: "14px", marginTop: "1rem", width: "100%", opacity: status === "loading" ? 0.7 : 1, cursor: status === "loading" ? "wait" : "pointer" }}
            >
              {status === "loading" ? "Securing Account..." : "Reset Password →"}
            </button>

            {message && (
              <p style={{ textAlign: "center", marginTop: "10px", fontSize: "0.875rem", color: status === "error" ? "var(--error)" : "var(--primary)" }}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--background)" }} />}>
      <ResetPasswordUI />
    </Suspense>
  );
}
