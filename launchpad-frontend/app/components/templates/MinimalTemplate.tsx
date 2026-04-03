import React from "react";
import { TemplateProps } from "./types";

export default function MinimalTemplate({ data }: TemplateProps) {
  const { name, title, summary, experiences, skills, accentColor, resumeBg } = data;
  const accent = accentColor || "var(--primary)";
  const bg     = resumeBg    || "var(--surface)";

  return (
    <div
      id="print-area"
      className="glass-card"
      style={{ width: "100%", maxWidth: "210mm", background: bg, border: "1px solid rgba(255,255,255,0.05)", padding: "4rem", borderRadius: "8px", minHeight: "297mm", color: "var(--on-surface)", fontFamily: "Georgia, serif" }}
    >
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${accent}`, paddingBottom: "1rem", marginBottom: "1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "normal", margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "1px", color: "var(--on-surface)" }}>
          {name || "Your Name"}
        </h1>
        <div style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--on-surface-variant)" }}>
          {title || "Your Title"}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ lineHeight: 1.5, fontSize: "0.95rem", margin: 0, color: "var(--on-surface-variant)" }}>{summary}</p>
        </div>
      )}

      {/* Experience — grouped by sectionTitle */}
      {experiences && (() => {
        const rendered: React.ReactNode[] = [];
        let lastTitle = "";
        experiences.forEach((exp, idx) => {
          const secTitle = exp.sectionTitle?.trim() || "";
          if (secTitle !== lastTitle) {
            lastTitle = secTitle;
            if (secTitle) rendered.push(
              <h2 key={`h-${idx}`} style={{ fontSize: "1.1rem", fontWeight: "bold", borderBottom: `1px solid ${accent}`, paddingBottom: "0.25rem", marginTop: idx === 0 ? 0 : "1.5rem", marginBottom: "1rem", textTransform: "uppercase", color: accent }}>
                {secTitle}
              </h2>
            );
          }
          rendered.push(
            <div key={exp.id} style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.15rem", minHeight: "20px" }}>
                <span style={{ fontWeight: "bold", fontSize: "1rem", color: "var(--on-surface)" }}>{exp.role}</span>
                <span style={{ fontSize: "0.9rem", color: "var(--on-surface-variant)", fontStyle: "italic" }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: "0.95rem", marginBottom: "0.5rem", fontWeight: "bold", color: "var(--on-surface)", minHeight: "18px" }}>{exp.company}</div>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", margin: 0, fontSize: "0.9rem", lineHeight: 1.4, color: "var(--on-surface-variant)" }}>
                {exp.enhancedBullets && exp.enhancedBullets.length > 0 ? (
                  exp.enhancedBullets.map((bullet, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{bullet}</li>
                  ))
                ) : (
                  <li style={{ fontStyle: "italic", opacity: 0.5 }}>Add raw data to generate bullets...</li>
                )}
              </ul>
            </div>
          );
        });
        return <div style={{ marginBottom: "1.5rem" }}>{rendered}</div>;
      })()}

      {/* Skills */}
      {skills && (
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", borderBottom: `1px solid ${accent}`, paddingBottom: "0.25rem", marginBottom: "0.75rem", textTransform: "uppercase", color: accent }}>
            Skills
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.5, margin: 0, color: "var(--on-surface-variant)" }}>
            {skills.split(",").map((s) => s.trim()).filter(Boolean).join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
