import React from "react";
import { TemplateProps } from "./types";

export default function CreativeTemplate({ data }: TemplateProps) {
  const { name, title, summary, experiences, skills } = data;

  return (
    <div id="print-area" className="glass-card" style={{ width: "100%", maxWidth: "210mm", background: "var(--surface)", display: "flex", minHeight: "297mm", color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk), sans-serif", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", overflow: "hidden" }}>
      
      {/* Sidebar Focus (left side) */}
      <div style={{ width: "32%", background: "var(--surface-container-high)", color: "var(--on-surface)", padding: "3rem 2rem", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Name and Title */}
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: "0 0 0.5rem 0", lineHeight: 1.1, textTransform: "uppercase" }}>
            {name || "Your Name"}
          </h1>
          <div style={{ fontSize: "1rem", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
            {title || "Your Title"}
          </div>
        </div>

        {/* Skills */}
        {skills && (
          <div style={{ marginBottom: "3rem" }}>
             <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                Skills
             </h2>
             <ul style={{ listStyleType: "none", padding: 0, margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--on-surface-variant)" }}>
                {skills.split(",").map((s, i) => s.trim() ? (
                  <li key={i} style={{ marginBottom: "8px" }}>✓ {s.trim()}</li>
                ) : null)}
             </ul>
          </div>
        )}
      </div>

      {/* Main Content (right side) */}
      <div style={{ width: "68%", padding: "3rem", background: "transparent" }}>
        
        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: "3rem" }}>
             <p style={{ fontSize: "1rem", lineHeight: 1.6, margin: 0, color: "var(--on-surface-variant)", fontStyle: "italic" }}>
                {`"${summary}"`}
             </p>
          </div>
        )}

        {/* Experience */}
        <div>
           <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--on-surface)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "2rem", textTransform: "uppercase" }}>
              Experience
           </h2>
           
           <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
             {experiences && experiences.map(exp => (
               <div key={exp.id}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem", minHeight: "24px" }}>
                   <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "var(--on-surface)" }}>{exp.company}</span>
                   {exp.duration && (
                     <span style={{ fontSize: "0.9rem", color: "var(--surface)", fontWeight: "bold", background: "var(--primary)", padding: "4px 8px", borderRadius: "4px" }}>
                       {exp.duration}
                     </span>
                   )}
                 </div>
                 <div style={{ fontSize: "1rem", color: "var(--on-surface-variant)", fontWeight: "bold", marginBottom: "0.75rem", minHeight: "18px" }}>
                   {exp.role}
                 </div>
                 
                 <ul style={{ listStyleType: "square", paddingLeft: "1.5rem", margin: 0, color: "var(--on-surface-variant)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                   {exp.enhancedBullets && exp.enhancedBullets.length > 0 ? (
                     exp.enhancedBullets.map((bullet, i) => (
                       <li key={i} style={{ marginBottom: "6px" }}>{bullet}</li>
                     ))
                   ) : (
                     <li style={{ fontStyle: "italic", opacity: 0.6 }}>Details go here...</li>
                   )}
                 </ul>
               </div>
             ))}
           </div>
        </div>

      </div>

    </div>
  );
}
