import React from "react";
import { TemplateProps } from "./types";

export default function CreativeTemplate({ data }: TemplateProps) {
  const {
    name, title, summary, experiences, skills,
    accentColor, resumeBg, sidebarColor, sidebarTextColor, textColor
  } = data;

  const accent      = accentColor      || "var(--primary)";
  const mainBg      = resumeBg         || "var(--surface)";
  const sidebar     = sidebarColor     || "var(--surface-container-high)";
  const sidebarText = sidebarTextColor || "var(--on-surface)";

  const rootStyle = {
    "--on-surface": textColor || "#ffffff",
    "--on-surface-variant": textColor ? `${textColor}cc` : "#adaaab",
    width: "100%", maxWidth: "210mm",
    background: mainBg,
    display: "flex", minHeight: "297mm",
    color: "var(--on-surface)",
    fontFamily: "var(--font-space-grotesk), sans-serif",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "8px", overflow: "hidden",
  } as React.CSSProperties;

  return (
    <div
      id="print-area"
      className="glass-card"
      style={rootStyle}
    >
      {/* ── Sidebar ── */}
      <div style={{ width: "32%", background: sidebar, color: sidebarText, padding: "3rem 2rem", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: "0 0 0.5rem 0", lineHeight: 1.1, textTransform: "uppercase", color: sidebarText }}>
            {name || "Your Name"}
          </h1>
          <div style={{ fontSize: "1rem", color: accent, fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
            {title || "Your Title"}
          </div>
        </div>

        {skills && (
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom: `2px solid ${accent}`, paddingBottom: "0.5rem", marginBottom: "1rem", color: sidebarText }}>
              Skills
            </h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: sidebarText, opacity: 0.85 }}>
              {skills.split(",").map((s, i) =>
                s.trim() ? (
                  <li key={i} style={{ marginBottom: "8px" }}>
                    <span style={{ color: accent }}>✓</span> {s.trim()}
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ width: "68%", padding: "3rem", background: "transparent" }}>

        {summary && (
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "1rem", lineHeight: 1.6, margin: 0, color: "var(--on-surface-variant)", fontStyle: "italic" }}>
              {`"${summary}"`}
            </p>
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
                <h2 key={`h-${idx}`} style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--on-surface)", borderBottom: `2px solid ${accent}`, paddingBottom: "0.5rem", marginTop: idx === 0 ? 0 : "2.5rem", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                  {secTitle}
                </h2>
              );
            }
            rendered.push(
              <div key={exp.id} style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem", minHeight: "24px" }}>
                  <span style={{ fontWeight: "900", fontSize: "1.1rem", color: "var(--on-surface)" }}>{exp.company}</span>
                  {exp.duration && (
                    <span style={{ fontSize: "0.9rem", color: mainBg, fontWeight: "bold", background: accent, padding: "4px 8px", borderRadius: "4px" }}>
                      {exp.duration}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "1rem", color: accent, fontWeight: "bold", marginBottom: "0.75rem", minHeight: "18px" }}>{exp.role}</div>
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
            );
          });
          return <div>{rendered}</div>;
        })()}
      </div>
    </div>
  );
}
