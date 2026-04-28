"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ModernTemplate, MinimalTemplate, CreativeTemplate } from "../components/templates";
import { getApiUrl } from "../lib/api";

import { IconEye, IconFolder, IconX } from "@tabler/icons-react";
import s from "./page.module.css";

interface Experience {
  id: string;
  sectionTitle: string;
  company: string;
  role: string;
  duration: string;
  rawText: string;
  enhancedBullets: string[];
}

import { EditorPanel } from "../components/EditorPanel";

export default function Dashboard() {
  const { userEmail, token, isLoading, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("Aarav Sharma");
  const [title, setTitle] = useState("Senior Next.js Engineer");
  const [summary, setSummary] = useState("A passionate software engineer specializing in building high-performance, robust web applications using React, Rust, and modern cloud infrastructure.");
  const [skills, setSkills] = useState("React, Typescript, Rust, Tailwind CSS, System Design");
  const [templateId, setTemplateId] = useState("modern");

  /* ── Customise ── */
  const [accentColor, setAccentColor] = useState("#a1fd60");
  const [resumeBg, setResumeBg] = useState("#111113");
  const [textColor, setTextColor] = useState("#ffffff");
  const [sidebarColor, setSidebarColor] = useState("#1e1e22");
  const [sidebarTextColor, setSidebarTextColor] = useState("#f2f2f2");

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      sectionTitle: "Professional Experience",
      company: "TechCorp Inc.",
      role: "Frontend Lead",
      duration: "2022 - Present",
      rawText: "I worked on the main website using react. Made things faster and managed 3 juniors.",
      enhancedBullets: [
        "Architected scalable frontend solutions using React, improving overall rendering performance by 40%.",
        "Mentored and managed a team of 3 junior engineers, streamlining continuous integration workflows.",
        "Delivered critical feature updates resulting in a 15% increase in user retention.",
      ],
    },
  ]);

  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allResumes, setAllResumes] = useState<Record<string, any>>({});
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.42);
  const [userZoom, setUserZoom] = useState(1);

  /* ── Pinch Gesture State ── */
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setInitialPinchDist(dist);
      setInitialPinchZoom(userZoom);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDist !== null) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const ratio = dist / initialPinchDist;
      let newZoom = +(initialPinchZoom * ratio).toFixed(2);
      newZoom = Math.min(Math.max(newZoom, 0.4), 3.5); // Bound the scale between 40% to 350%
      setUserZoom(newZoom);
    }
  };
  const handleTouchEnd = () => setInitialPinchDist(null);

  /* ── Mobile Preview Scaler & Scroll Lock ── */
  useEffect(() => {
    if (!isMobilePreview) {
      document.body.style.overflow = "auto";
      return;
    }

    // Lock background scroll
    document.body.style.overflow = "hidden";

    const handleResize = () => {
      const wScale = (window.innerWidth - 32) / 794;
      const hScale = (window.innerHeight - 120) / 1123;
      setPreviewScale(Math.min(wScale, hScale, 1));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, [isMobilePreview]);

  /* ── Protected route & inactivity timer ── */
  useEffect(() => {
    if (!isLoading && !userEmail) router.push("/");

    let t: NodeJS.Timeout;
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(() => { logout(); router.push("/"); }, 15 * 60 * 1000);
    };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    reset();
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("click", reset);
    };
  }, [userEmail, isLoading, router, logout]);

  /* ── Fetch resume on mount ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(getApiUrl("/api/resume"), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        if (data.isMultiResume) {
          setAllResumes(data.resumes || {});
          const activeName = data.activeResume || Object.keys(data.resumes || {})[0];
          if (activeName && data.resumes[activeName]) applyResumeData(data.resumes[activeName]);
        } else {
          applyResumeData(data);
          setAllResumes({ "Main Resume": data });
        }
      } catch (_e) { console.error("Fetch failed", _e); }
    })();
  }, [token]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyResumeData(d: any) {
    if (d.name) setName(d.name);
    if (d.title) setTitle(d.title);
    if (d.summary) setSummary(d.summary);
    if (d.skills) setSkills(d.skills);
    if (d.experiences) setExperiences(d.experiences);
    if (d.templateId) setTemplateId(d.templateId);
    if (d.accentColor) setAccentColor(d.accentColor);
    if (d.resumeBg) setResumeBg(d.resumeBg);
    if (d.textColor) setTextColor(d.textColor);
    if (d.sidebarColor) setSidebarColor(d.sidebarColor);
    if (d.sidebarTextColor) setSidebarTextColor(d.sidebarTextColor);
  }

  if (isLoading || !userEmail) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>Loading Secure Workspace...</div>;
  }

  /* ── AI enhance ── */
  const enhanceAll = async () => {
    setIsEnhancing("all");
    try {
      const res = await fetch(getApiUrl("/api/ai/enhance"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          summary, skills,
          experiences: experiences.map(e => ({ id: e.id, sectionTitle: e.sectionTitle, company: e.company, role: e.role, duration: e.duration, rawText: e.rawText })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      const parsed = JSON.parse(data.enhanced_text);
      if (parsed.summary) setSummary(parsed.summary);
      if (parsed.skills) setSkills(parsed.skills);
      if (parsed.experiences && Array.isArray(parsed.experiences)) {
        setExperiences(parsed.experiences.map((newExp: Experience) => {
          const old = experiences.find(e => e.id === newExp.id);
          const bullets = newExp.enhancedBullets || [];
          return { ...newExp, sectionTitle: newExp.sectionTitle || old?.sectionTitle || "Professional Experience", enhancedBullets: bullets, rawText: bullets.length > 0 ? bullets.join("\n") : (old?.rawText || "") };
        }));
      }
    } catch (err) {
      console.error(err);
      alert("AI Enhancement Failed! Please check the console.");
    } finally {
      setIsEnhancing(null);
    }
  };

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

  const handlePrint = () => window.print();
  const handleSave = () => setIsSaveModalOpen(true);

  const confirmSaveToCloud = async () => {
    if (!saveName.trim()) { alert("Please enter a resume name."); return; }
    if (allResumes[saveName] && !window.confirm(`"${saveName}" already exists. Overwrite?`)) return;
    setIsSaving(true);
    try {
      const current = { name, title, summary, skills, experiences, templateId, accentColor, resumeBg, textColor, sidebarColor, sidebarTextColor, lastUpdate: new Date().toLocaleTimeString() };
      const newAll = { ...allResumes, [saveName]: current };
      const res = await fetch(getApiUrl("/api/resume"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resume_data: { isMultiResume: true, activeResume: saveName, resumes: newAll } }),
      });
      if (res.ok) { setAllResumes(newAll); setIsSaveModalOpen(false); setSaveName(""); alert("Resume securely synced to Supabase Cloud."); }
      else alert("Failed to sync to cloud.");
    } catch { alert("Network error while saving."); }
    setIsSaving(false);
  };

  const loadResume = (resumeName: string) => {
    const active = allResumes[resumeName];
    if (active) { applyResumeData(active); setIsArchiveOpen(false); }
  };

  const resumeData = { name, title, summary, skills, experiences, accentColor, resumeBg, textColor, sidebarColor, sidebarTextColor };

  return (
    <div className={s.outer}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @page { size: auto; margin: 0mm; }
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 2cm !important; }
          .chip { border: 1px solid #333 !important; }
          .no-print, .no-print * { display: none !important; }
        }
      `}} />

      {/* LEFT PANEL */}
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
        onAIButtonClick={enhanceAll}
        isEnhancing={isEnhancing}
        showLogout={true}
        onLogout={() => { logout(); router.push("/"); }}
      />

      {/* RIGHT PANEL (Hidden when preview is active) */}
      <div className={s.right} style={{ display: isMobilePreview ? 'none' : '' }}>
        <div className={`no-print ${s.actionBar}`}>
          <div className={s.actionPill}>
            <button onClick={handleSave} className="btn-secondary" disabled={isSaving} style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "0.875rem", border: "none" }}>
              {isSaving ? "Syncing..." : " Save to Cloud"}
            </button>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: "8px 20px", borderRadius: "100px", fontSize: "0.875rem" }}>
              Export PDF
            </button>
          </div>
        </div>

        <div className={s.resumeWrapper}>
          {templateId === "modern" && <ModernTemplate data={resumeData} />}
          {templateId === "minimal" && <MinimalTemplate data={resumeData} />}
          {templateId === "creative" && <CreativeTemplate data={resumeData} />}
        </div>

        {/* PREMIUM MAC-STYLE GLASS DOCK */}
        <div className={`no-print ${s.glassDock}`}>
          {/* Print View Item (Hidden on Desktop) */}
          <div className={s.mobileOnlyDockItem}>
            <button 
              className={s.dockIconBtn} 
              onClick={() => { setIsMobilePreview(true); window.scrollTo(0, 0); }}
              title="Print View"
            >
              <IconEye size={20} stroke={1.5} />
              <span>Preview</span>
            </button>
            <div className={s.dockDivider} />
          </div>

          {/* Saved Resumes Item (Always Visible) */}
          <button 
            className={s.dockIconBtn} 
            onClick={() => setIsArchiveOpen(true)}
            title="Saved Resumes"
          >
            <IconFolder size={20} stroke={1.5} />
            <span>Saved</span>
          </button>
        </div>
      </div>

      {/* FLOATING TRUE PRINT PREVIEW MODAL */}
      {isMobilePreview && (() => {
        const finalScale = previewScale * userZoom;
        return (
          <div className={`no-print ${s.previewModalOverlay}`}>
            <div className={s.previewModalBackdrop} onClick={() => setIsMobilePreview(false)} />

            <button className={s.floatingCloseBtn} onClick={() => { setIsMobilePreview(false); setUserZoom(1); }}>
              <IconX size={24} stroke={1.5} />
            </button>

            <div
              className={s.previewModalContent}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* The scaled viewport bounding box */}
              <div style={{ display: 'inline-block', position: 'relative', width: 794 * finalScale, height: 1123 * finalScale, textAlign: 'left', margin: 'auto' }}>
                <div className={s.previewPhysicalA4} style={{ transform: `scale(${finalScale})` }}>
                  {templateId === "modern" && <ModernTemplate data={resumeData} />}
                  {templateId === "minimal" && <MinimalTemplate data={resumeData} />}
                  {templateId === "creative" && <CreativeTemplate data={resumeData} />}
                </div>
              </div>
            </div>

            {/* Floating Zoom Controls */}
            <div className={s.floatingZoomControls}>
              <button
                onClick={() => setUserZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                className={s.zoomBtn}
              >
                &minus;
              </button>
              <span className={s.zoomText}>{Math.round(userZoom * 100)}%</span>
              <button
                onClick={() => setUserZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
                className={s.zoomBtn}
              >
                &#43;
              </button>
            </div>
          </div>
        );
      })()}

      {/* ARCHIVE MODAL */}
      <div className={`no-print ${s.archiveOverlay}`} style={{ pointerEvents: isArchiveOpen ? "auto" : "none" }}>
        <div className={s.archiveBackdrop} style={{ opacity: isArchiveOpen ? 1 : 0 }} onClick={() => setIsArchiveOpen(false)} />
        <div className={s.archiveBox} style={{ transform: isArchiveOpen ? "translateY(0)" : "translateY(50px)", opacity: isArchiveOpen ? 1 : 0 }}>
          <button className={s.modalClose} onClick={() => setIsArchiveOpen(false)}>&times;</button>
          <h2 className={s.archiveTitle}>Saved Resumes</h2>
          <p className={s.archiveDesc}>Your securely synced cloud resumes across all devices.</p>
          <div className={s.archiveList}>
            {Object.keys(allResumes).length > 0 ? (
              Object.entries(allResumes).map(([resName, resData]) => (
                <div key={resName} className={s.resumeCard}>
                  <div className={s.resumeCardInfo}>
                    <h3>{resName}</h3>
                    <p>{resData.name || "Unknown"}  {resData.title || "No Title"}</p>
                  </div>
                  <div className={s.resumeCardActions}>
                    <span className={s.syncBadge}>{resData.lastUpdate ? `Synced ${resData.lastUpdate}` : "Synced"}</span>
                    <button onClick={() => loadResume(resName)} className="btn-secondary" style={{ padding: "6px 12px" }}>Load</button>
                  </div>
                </div>
              ))
            ) : (
              <div className={s.emptyState}>No Cloud Resumes Found. Save to Cloud to begin.</div>
            )}
          </div>
        </div>
      </div>

      {/* SAVE MODAL */}
      <div className={`no-print ${s.saveOverlay}`} style={{ pointerEvents: isSaveModalOpen ? "auto" : "none" }}>
        <div className={s.saveBackdrop} style={{ opacity: isSaveModalOpen ? 1 : 0 }} onClick={() => setIsSaveModalOpen(false)} />
        <div className={s.saveBox} style={{ transform: isSaveModalOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)", opacity: isSaveModalOpen ? 1 : 0 }}>
          <button className={s.modalClose} onClick={() => setIsSaveModalOpen(false)}>&times;</button>
          <h2 className={s.saveTitle}>Save to Cloud</h2>
          <p className={s.saveDesc}>Enter a name for this resume version. If the name already exists, it will ask to override.</p>
          <div className={s.saveForm}>
            <div>
              <label className={s.saveLabel}>Resume Name</label>
              <input type="text" autoFocus className="input-neon" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="e.g. Frontend Engineer..." style={{ width: "100%", padding: "12px" }} onKeyDown={e => { if (e.key === "Enter") confirmSaveToCloud(); }} />
            </div>
            <button onClick={confirmSaveToCloud} disabled={isSaving || !saveName.trim()} className={s.saveBtn} style={{ cursor: isSaving || !saveName.trim() ? "not-allowed" : "pointer", opacity: isSaving || !saveName.trim() ? 0.7 : 1 }}>
              {isSaving ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
