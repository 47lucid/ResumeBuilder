"use client";

import React from "react";
import { Experience } from "./templates/types";
import { TemplateSelector } from "./templates/TemplateSelector";
import s from "./EditorPanel.module.css";

/* ── colour picker helper ── */
function ColorPicker({ label, value = "#ffffff", onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className={s.colorRow}>
      <span className={s.colorLabel}>{label}</span>
      <div className={s.colorPickerWrap}>
        <span className={s.colorSwatch} style={{ background: value }} />
        <span className={s.colorHex}>{value.toUpperCase()}</span>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          onTouchStart={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          className={s.colorInput}
        />
      </div>
    </div>
  );
}

const SECTION_PRESETS = [
  "Professional Experience",
  "Education",
  "Projects",
  "Certifications",
  "Volunteer Work",
  "Awards",
];

export interface EditorPanelProps {
  name: string; setName: (v: string) => void;
  title: string; setTitle: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
  skills: string; setSkills: (v: string) => void;
  
  experiences: Experience[];
  updateExp: (id: string, field: keyof Experience, value: string) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  
  templateId: string; setTemplateId: (v: string) => void;
  accentColor: string; setAccentColor: (v: string) => void;
  resumeBg: string; setResumeBg: (v: string) => void;
  textColor: string; setTextColor: (v: string) => void;
  sidebarColor: string; setSidebarColor: (v: string) => void;
  sidebarTextColor: string; setSidebarTextColor: (v: string) => void;
  
  onAIButtonClick: () => void;
  isEnhancing: string | null;
  aiButtonTextOverride?: string;

  showLogout?: boolean;
  onLogout?: () => void;
}

export function EditorPanel(props: EditorPanelProps) {
  const {
    name, setName, title, setTitle, summary, setSummary, skills, setSkills,
    experiences, updateExp, addExperience, removeExperience,
    templateId, setTemplateId,
    accentColor, setAccentColor, resumeBg, setResumeBg,
    textColor, setTextColor,
    sidebarColor, setSidebarColor, sidebarTextColor, setSidebarTextColor,
    onAIButtonClick, isEnhancing, aiButtonTextOverride,
    showLogout, onLogout
  } = props;

  return (
    <div className={`no-print ${s.left}`}>
      <div className={s.header}>
        <div className={s.brand}>⬡ Builder Workspace</div>
        {showLogout && onLogout && (
          <button className={s.logoutBtn} onClick={onLogout}>Logout</button>
        )}
      </div>
      <div className={s.contentStack}>
        <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />

        {/* ── Basics ── */}
        <section>
          <h3 className={s.sectionLabel}>Basics</h3>
          <div className={s.inputGroup}>
            <input className="input-neon" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={{ width: "100%", padding: "12px" }} />
            <input className="input-neon" value={title} onChange={e => setTitle(e.target.value)} placeholder="Professional Title" style={{ width: "100%", padding: "12px" }} />
            <textarea className="input-neon" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" style={{ width: "100%", padding: "12px" }} />
          </div>
        </section>

        {/* ── Experience ── */}
        <section>
          <div className={s.expHeader}>
            <h3 className={s.sectionLabel} style={{ marginBottom: 0 }}>Experience</h3>
            <button className="btn-secondary" onClick={addExperience} style={{ padding: "4px 8px", fontSize: "0.75rem" }}>+ Add</button>
          </div>
          <div className={s.expList}>
            {experiences.map((exp) => (
              <div key={exp.id} className={s.expCard}>
                <div className={s.expRow} style={{ marginBottom: "8px", alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <label className={s.rawLabel} style={{ marginBottom: "3px" }}>Section Title</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        list={`presets-${exp.id}`}
                        className="input-neon"
                        value={exp.sectionTitle}
                        onChange={e => updateExp(exp.id, "sectionTitle", e.target.value)}
                        placeholder="e.g. Professional Experience"
                        style={{ flex: 1, padding: "8px 10px", fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)" }}
                      />
                      <datalist id={`presets-${exp.id}`}>
                        {SECTION_PRESETS.map(p => <option key={p} value={p} />)}
                      </datalist>
                    </div>
                  </div>
                  {experiences.length > 1 && (
                    <button className={s.removeBtn} onClick={() => removeExperience(exp.id)} style={{ marginTop: "18px" }}>&times;</button>
                  )}
                </div>

                <div className={s.expRow}>
                  <input className="input-neon" value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} placeholder="Company / Institution" style={{ flex: "1 1 120px", padding: "10px", fontSize: "0.875rem" }} />
                </div>
                <div className={s.expRow}>
                  <input className="input-neon" value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} placeholder="Role / Degree" style={{ flex: "1 1 120px", minWidth: 0, padding: "10px", fontSize: "0.875rem" }} />
                  <input className="input-neon" value={exp.duration} onChange={e => updateExp(exp.id, "duration", e.target.value)} placeholder="Duration" style={{ flex: "1 1 100px", minWidth: 0, padding: "10px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label className={s.rawLabel}>Description (one bullet per line)</label>
                  <textarea
                    className="input-neon"
                    value={exp.rawText}
                    onChange={e => updateExp(exp.id, "rawText", e.target.value)}
                    placeholder={"• Built a web app using Next.js...\n• Improved performance by 30%…"}
                    style={{ width: "100%", padding: "10px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ── */}
        <section>
          <h3 className={s.sectionLabel}>Skills (CSV)</h3>
          <textarea className="input-neon" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node, etc..." style={{ width: "100%", padding: "12px" }} />
        </section>

        {/* ── Customise ── */}
        <section className={s.colorSection}>
          <h3 className={s.sectionLabel}>Customise Resume</h3>
          <div className={s.colorGrid} style={{ marginBottom: "1rem" }}>
            <ColorPicker label="Accent / Highlight" value={accentColor} onChange={setAccentColor} />
            <ColorPicker label="Resume Background"  value={resumeBg}    onChange={setResumeBg}    />
            <ColorPicker label="Main Text Colour"   value={textColor}   onChange={setTextColor}   />
          </div>
          {templateId === "creative" && (
            <>
              <p className={s.colorLabel} style={{ marginBottom: "6px", letterSpacing: "0.03em" }}>Creative — Sidebar Colours</p>
              <div className={s.colorGrid}>
                <ColorPicker label="Sidebar Background" value={sidebarColor}     onChange={setSidebarColor}     />
                <ColorPicker label="Sidebar Text"        value={sidebarTextColor} onChange={setSidebarTextColor} />
              </div>
            </>
          )}
        </section>

        {/* ── AI ── */}
        <section className={s.aiSection}>
          <button onClick={onAIButtonClick} disabled={isEnhancing !== null} className="btn-primary" style={{ padding: "16px", width: "100%", fontSize: "1.0625rem", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", boxShadow: "0 0 20px rgba(161,253,96,0.2)" }}>
            <span style={{ fontSize: "1.2rem" }}></span> {isEnhancing === "all" ? "Groq AI Optimizing..." : (aiButtonTextOverride || "Enhance Entire Resume with AI")}
          </button>
        </section>
      </div>
    </div>
  );
}
