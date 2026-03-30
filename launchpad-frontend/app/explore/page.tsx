"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernTemplate, MinimalTemplate, CreativeTemplate, TemplateSelector, Experience } from "../components/templates";

const dummyExperiences: Experience[] = [
  {
    id: "1",
    company: "Stripe",
    role: "Senior Software Engineer",
    duration: "2021 - Present",
    rawText: "Built payment APIs.",
    enhancedBullets: [
      "Architected high-throughput payment processing APIs handling $10M+ daily volume with 99.99% uptime.",
      "Optimized database indexing strategies reducing latency by 45%.",
      "Mentored junior engineers and led technical design reviews."
    ]
  },
  {
    id: "2",
    company: "Google",
    role: "Software Engineer",
    duration: "2018 - 2021",
    rawText: "Worked on Google Maps.",
    enhancedBullets: [
      "Developed real-time location tracking features impacting 50M+ MAU.",
      "Integrated machine learning models for route optimization using C++ and Python."
    ]
  }
];

export default function ExploreTemplates() {
  const router = useRouter();
  const [templateId, setTemplateId] = useState("modern");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const blockAction = (e?: React.MouseEvent | React.FocusEvent) => {
    e?.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)", position: "relative" }}>
      
      {/* ─── MODAL OVERLAY ─── */}
      {showLoginModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", textAlign: "center", border: "1px solid var(--primary)", animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "1.5rem", marginBottom: "1rem" }}>Sign in to Customize</h2>
            <p style={{ color: "var(--on-surface-variant)", marginBottom: "2rem", lineHeight: 1.5 }}>
              Create a free account to edit this template with your own data, use the AI enhancer, and export directly to PDF!
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn-secondary" style={{ padding: "10px 24px" }} onClick={() => setShowLoginModal(false)}>Close</button>
              <button className="btn-primary" style={{ padding: "10px 24px" }} onClick={() => router.push("/#login")}>Sign up free →</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LEFT PANEL: READ ONLY EDITOR ─── */}
      <div style={{ width: "450px", borderRight: "1px solid rgba(72,72,73,0.2)", height: "100vh", overflowY: "auto", background: "var(--surface-container-low)", padding: "2rem", zIndex: 10, position: "relative" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>
            ⬡ Interactive Preview
          </div>
          <button onClick={() => router.push("/")} style={{ background: "transparent", border: "none", color: "var(--on-surface)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
            Back Home
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", opacity: 0.9 }}>
          
          <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />

          <section onClick={blockAction}>
            <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Basics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", pointerEvents: "none" }}>
              <input className="input-neon" value="Sarah Engineer" readOnly placeholder="Full Name" style={{ width: "100%", padding: "12px" }} />
              <input className="input-neon" value="Staff Systems Engineer" readOnly placeholder="Professional Title" style={{ width: "100%", padding: "12px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <textarea className="input-neon" value="High-impact engineering leader with a decade of distributed systems experience." readOnly style={{ width: "100%", padding: "12px", minHeight: "80px", resize: "none" }} />
                <textarea className="input-neon" value="High-impact engineering leader with a decade of distributed systems experience." readOnly style={{ width: "100%", padding: "12px", minHeight: "80px", resize: "none" }} />
              </div>
            </div>
          </section>

          <section onClick={blockAction}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience</h3>
              <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem", pointerEvents: "none" }}>+ Add</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", pointerEvents: "none" }}>
              {dummyExperiences.map((exp) => (
                <div key={exp.id} style={{ background: "var(--surface-container)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(72,72,73,0.2)" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input className="input-neon" value={exp.company} readOnly style={{ flex: 1, padding: "10px", fontSize: "0.875rem" }} />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input className="input-neon" value={exp.role} readOnly style={{ flex: 1, padding: "10px", fontSize: "0.875rem" }} />
                    <input className="input-neon" value={exp.duration} readOnly style={{ width: "120px", padding: "10px", fontSize: "0.875rem" }} />
                  </div>
                  
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginBottom: "4px", display: "block" }}>What did you do? (Raw Data)</label>
                    <textarea 
                      className="input-neon" 
                      value={exp.rawText} 
                      readOnly 
                      style={{ width: "100%", padding: "10px", minHeight: "40px", fontSize: "0.875rem", resize: "none" }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Master AI Button at Bottom */}
          <section onClick={blockAction} style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
            <button 
              className="btn-primary" 
              style={{ padding: "16px", width: "100%", fontSize: "1.0625rem", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", boxShadow: "0 0 20px rgba(161,253,96,0.2)" }}
            >
              <span style={{ fontSize: "1.2rem" }}>✦</span> Enhance Entire Resume with AI
            </button>
          </section>

        </div>
      </div>

      {/* ─── RIGHT PANEL: LIVE PREVIEW ─── */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto", position: "relative" }}>
        
        {/* Banner */}
        <div style={{ position: "sticky", top: "2rem", display: "flex", justifyContent: "center", padding: "0 2rem", zIndex: 50, pointerEvents: "none" }}>
          <div onClick={blockAction} style={{ cursor: "pointer", background: "rgba(161,253,96,0.2)", backdropFilter: "blur(12px)", padding: "8px 20px", borderRadius: "100px", border: "1px solid var(--primary)", display: "flex", alignItems: "center", gap: "10px", pointerEvents: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <span style={{ fontWeight: 600, color: "var(--primary)" }}>Want this resume?</span>
            <button className="btn-primary" style={{ padding: "4px 16px", borderRadius: "100px", fontSize: "0.875rem" }}>
              Unlock Editor
            </button>
          </div>
        </div>

        {/* The Live Resume Paper */}
        <div style={{ padding: "4rem 2rem", display: "flex", justifyContent: "center", transition: "all 0.3s ease" }}>
          {templateId === "modern" && <ModernTemplate data={{ name: "Sarah Engineer", title: "Staff Systems Engineer", summary: "High-impact engineering leader with a decade of distributed systems experience.", skills: "Rust, Go, Kubernetes, AWS, System Design", experiences: dummyExperiences }} />}
          {templateId === "minimal" && <MinimalTemplate data={{ name: "Sarah Engineer", title: "Staff Systems Engineer", summary: "High-impact engineering leader with a decade of distributed systems experience.", skills: "Rust, Go, Kubernetes, AWS, System Design", experiences: dummyExperiences }} />}
          {templateId === "creative" && <CreativeTemplate data={{ name: "Sarah Engineer", title: "Staff Systems Engineer", summary: "High-impact engineering leader with a decade of distributed systems experience.", skills: "Rust, Go, Kubernetes, AWS, System Design", experiences: dummyExperiences }} />}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
