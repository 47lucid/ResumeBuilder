"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", padding: "4rem 2rem", color: "var(--on-surface)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", textDecoration: "none", marginBottom: "2rem", fontWeight: 600 }}>
            <span style={{ fontSize: "1.2rem" }}>←</span> Back to Home
          </Link>
          <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "1.1rem" }}>
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7 }}>
          
          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              1. Introduction
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              Welcome to AuraIn. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our resume builder platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              2. Information We Collect
            </h2>
            <ul style={{ color: "var(--on-surface-variant)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><strong>Account Data:</strong> We collect your email address when you sign up using our secure magic link system.</li>
              <li><strong>Resume Data:</strong> Information you input into your resume (names, job experiences, skills) is stored securely via Supabase so you can access it across devices.</li>
              <li><strong>Usage Data:</strong> Basic analytics such as page visits and template usage to help us improve the platform.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              3. How We Use Your Information
            </h2>
            <p style={{ color: "var(--on-surface-variant)", marginBottom: "1rem" }}>
              We use the data we collect primarily to provide, maintain, and improve our services to you:
            </p>
            <ul style={{ color: "var(--on-surface-variant)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>To create and authenticate your account.</li>
              <li>To save your resume progress so you can download or edit it later.</li>
              <li>To power the AI processing features (sending resume drafts securely to our AI providers to generate enhanced bullet points).</li>
              <li>To send you important system notifications (like magic login links).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              4. Data Sharing & AI Providers
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              We do not sell your personal data. When you use the AI Enhancer feature, the specific text you submit is sent securely to our partner AI API (e.g., Groq/Llama 3) strictly for the purpose of rewriting and optimizing your resume. They do not use your data to train their public models.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              5. Data Security
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              We implement robust security measures, including HTTPS encryption and JWT (JSON Web Token) authentication, to protect your data from unauthorized access. Your data is stored on secure Supabase servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              6. Your Rights
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              You have the right to access, update, or delete your personal data at any time. If you wish to delete your account and all associated resume data entirely from our databases, please contact our support team.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
