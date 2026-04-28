import React from "react";
import { TemplateProps } from "./types";

export default function ModernTemplate({ data }: TemplateProps) {
  const { name, title, summary, experiences, skills, accentColor, resumeBg, textColor } = data;
  const accent = accentColor || "var(--primary)";
  const bg     = resumeBg    || "var(--surface)";

  const rootStyle = {
    "--on-surface": textColor || "#ffffff",
    "--on-surface-variant": textColor ? `${textColor}cc` : "#adaaab",
    width: "100%", maxWidth: "210mm", background: bg, border: "1px solid rgba(255,255,255,0.05)", padding: "3rem", borderRadius: "8px", minHeight: "297mm", color: "var(--on-surface)"
  } as React.CSSProperties;

  return (
    <div
      id="print-area"
      className="glass-card"
      style={rootStyle}
    >
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--on-surface)", marginBottom: "0.25rem" }}>
          {name || "Your Name"}
        </h1>
        <div style={{ color: accent, fontSize: "1.125rem", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {title || "Your Title"}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--on-surface-variant)", lineHeight: 1.6, fontSize: "0.95rem" }}>{summary}</p>
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
              <h2 key={`h-${idx}`} style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--on-surface)", marginTop: idx === 0 ? 0 : "2.5rem", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em", borderLeft: `3px solid ${accent}`, paddingLeft: "0.75rem" }}>
                {secTitle}
              </h2>
            );
          }
          rendered.push(
            <div key={exp.id} style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: 0, minHeight: "24px" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--on-surface)" }}>{exp.role}</span>
                  {exp.role && exp.company && <span style={{ margin: "0 8px", color: "var(--on-surface-variant)" }}>|</span>}
                  <span style={{ fontWeight: 500, color: accent }}>{exp.company}</span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--on-surface-variant)" }}>{exp.duration}</div>
              </div>
              <ul style={{ listStyleType: "square", paddingLeft: "1.2rem", color: "var(--on-surface-variant)", fontSize: "0.9375rem" }}>
                {exp.enhancedBullets && exp.enhancedBullets.length > 0 ? (
                  exp.enhancedBullets.map((bullet, i) => (
                    <li key={i} style={{ marginBottom: "6px", lineHeight: 1.5, paddingLeft: "4px" }}>{bullet}</li>
                  ))
                ) : (
                  <li style={{ fontStyle: "italic", opacity: 0.5 }}>Write raw text and click &apos;Enhance with Groq AI&apos; to generate bullet points...</li>
                )}
              </ul>
            </div>
          );
        });
        return <div style={{ marginBottom: "2.5rem" }}>{rendered}</div>;
      })()}

      {/* Skills */}
      {skills && (
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--on-surface)", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Core Competencies
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {skills.split(",").map((s, i) => s.trim() ? (
              <span key={i} className="chip" style={{ 
                background: textColor ? `color-mix(in srgb, ${textColor} 8%, transparent)` : "rgba(255, 255, 255, 0.08)", 
                color: "var(--on-surface)", 
                border: `1px solid ${textColor ? `color-mix(in srgb, ${textColor} 15%, transparent)` : "rgba(255, 255, 255, 0.15)"}`, 
                fontWeight: 500 
              }}>
                {s.trim()}
              </span>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}
