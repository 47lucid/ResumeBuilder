"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernTemplate, MinimalTemplate, CreativeTemplate, Experience } from "../components/templates";
import { EditorPanel } from "../components/EditorPanel";
import s from "./page.module.css";

const dummyExperiences: Experience[] = [
  {
    id: "1", sectionTitle: "Professional Experience", company: "Stripe", role: "Senior Software Engineer", duration: "2021 - Present",
    rawText: "Built payment APIs.",
    enhancedBullets: [
      "Architected high-throughput payment processing APIs handling $10M+ daily volume with 99.99% uptime.",
      "Optimized database indexing strategies reducing latency by 45%.",
      "Mentored junior engineers and led technical design reviews."
    ]
  },
  {
    id: "2", sectionTitle: "Professional Experience", company: "Google", role: "Software Engineer", duration: "2018 - 2021",
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

  const [name, setName] = useState("Aarav Sharma");
  const [title, setTitle] = useState("Senior Next.js Engineer");
  const [summary, setSummary] = useState("High-impact engineering leader with a decade of distributed systems experience.");
  const [skills, setSkills] = useState("Rust, Go, Kubernetes, AWS, System Design");
  const [experiences, setExperiences] = useState<Experience[]>(dummyExperiences);

  const [accentColor, setAccentColor] = useState("#a1fd60");
  const [resumeBg, setResumeBg] = useState("#111113");
  const [sidebarColor, setSidebarColor] = useState("#1e1e22");
  const [sidebarTextColor, setSidebarTextColor] = useState("#f2f2f2");
  const [textColor, setTextColor] = useState("#ffffff");

  const updateExp = (id: string, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map(e => {
      if (e.id !== id) return e;
      const next = { ...e, [field]: value };
      if (field === "rawText") next.enhancedBullets = value.split("\n").filter(l => l.trim().length > 0);
      return next;
    }));
  };

  const addExperience = () => {
    const last = experiences[experiences.length - 1];
    setExperiences([...experiences, {
      id: Date.now().toString(),
      sectionTitle: last?.sectionTitle || "Professional Experience",
      company: "", role: "", duration: "", rawText: "", enhancedBullets: [],
    }]);
  };

  const removeExperience = (id: string) => setExperiences(prev => prev.filter(e => e.id !== id));

  const resumeData = {
    name, title, summary, skills, experiences,
    accentColor, resumeBg, textColor, sidebarColor, sidebarTextColor
  };

  return (
    <div className={s.outer}>

      {/* ─── MODAL ─── */}
      {showLoginModal && (
        <div className={s.modalOverlay} style={{ pointerEvents: "auto" }}>
          <div className={s.modalBackdrop} onClick={() => setShowLoginModal(false)} />
          <div className={s.modalBox}>
            <button className={s.modalClose} onClick={() => setShowLoginModal(false)}>&times;</button>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h2 className={s.modalTitle}>Sign in to Customize AI</h2>
            <p className={s.modalDesc}>
              Create a free account to use the AI enhancer, save your changes, and export directly to PDF!
            </p>
            <div className={s.modalActions}>
              <button className={s.signupBtn} onClick={() => router.push("/#login")}>Sign up free →</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LEFT PANEL ─── */}
      <EditorPanel 
        name={name} setName={setName}
        title={title} setTitle={setTitle}
        summary={summary} setSummary={setSummary}
        skills={skills} setSkills={setSkills}
        experiences={experiences} updateExp={updateExp} addExperience={addExperience} removeExperience={removeExperience}
        templateId={templateId} setTemplateId={setTemplateId}
        accentColor={accentColor} setAccentColor={setAccentColor}
        resumeBg={resumeBg} setResumeBg={setResumeBg}
        textColor={textColor} setTextColor={setTextColor}
        sidebarColor={sidebarColor} setSidebarColor={setSidebarColor}
        sidebarTextColor={sidebarTextColor} setSidebarTextColor={setSidebarTextColor}
        onAIButtonClick={() => setShowLoginModal(true)}
        isEnhancing={null}
        aiButtonTextOverride="Sign in to use AI Enhancer"
        showLogout={false}
      />

      {/* ─── RIGHT PANEL ─── */}
      <div className={s.right}>
        <div className={s.resumeWrapper}>
          {templateId === "modern" && <ModernTemplate data={resumeData} />}
          {templateId === "minimal" && <MinimalTemplate data={resumeData} />}
          {templateId === "creative" && <CreativeTemplate data={resumeData} />}
        </div>
      </div>

    </div>
  );
}
