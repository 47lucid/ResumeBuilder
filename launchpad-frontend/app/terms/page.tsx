"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", padding: "4rem 2rem", color: "var(--on-surface)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", textDecoration: "none", marginBottom: "2rem", fontWeight: 600 }}>
            <span style={{ fontSize: "1.2rem" }}>←</span> Back to Home
          </Link>
          <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "1.1rem" }}>
            Last updated: April 2026
          </p>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: 1.7 }}>
          
          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              By accessing and using AuraIn, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our resume building platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              2. Description of Service
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              AuraIn provides a suite of online tools for designing, editing, and exporting professional resumes (&quot;the Service&quot;). We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              3. User Accounts & Security
            </h2>
            <p style={{ color: "var(--on-surface-variant)", marginBottom: "1rem" }}>
              To utilize features such as saving and AI enhancements, you must register for an account. By registering:
            </p>
            <ul style={{ color: "var(--on-surface-variant)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>You agree to provide accurate, current, and complete information.</li>
              <li>You are responsible for maintaining the confidentiality of your authentication details (such as your password or magic link access).</li>
              <li>You agree to notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              4. Fair Use of AI Enhancements
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              Our AI optimization features are provided to help structure and polish your existing professional data. You agree not to abuse the AI endpoints (e.g., using automated scripts/bots) or attempt to use the AI functionality for generating offensive, illegal, or misleading content. Excessive or abusive requests may result in account suspension.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              5. Intellectual Property & User Content
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              The design systems, templates, UI, and proprietary software belonging to AuraIn remain the exclusive property of our operating group. However, you retain full ownership of all the distinct textual data (your name, experience, resume content) that you input into the Service.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", color: "var(--primary)" }}>
              6. Limitation of Liability
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>
              AuraIn is provided &quot;as is&quot; without any warranties of any kind. We do not guarantee that your use of the Service will result in employment. In no event shall AuraIn or its creators be liable for any indirect, incidental, or consequential damages resulting from your use of the Service.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
