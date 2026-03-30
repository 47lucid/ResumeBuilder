"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ModernTemplate, MinimalTemplate, CreativeTemplate, TemplateSelector } from "../components/templates";
import LiquidArchiveButton from "../components/LiquidArchiveButton";

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  rawText: string;
  enhancedBullets: string[];
}

export default function Dashboard() {
  const { userEmail, token, isLoading, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("Alex Developer");
  const [title, setTitle] = useState("Senior Next.js Engineer");
  const [summary, setSummary] = useState("A passionate software engineer specializing in building high-performance, robust web applications using React, Rust, and modern cloud infrastructure.");
  const [skills, setSkills] = useState("React, Typescript, Rust, Tailwind CSS, System Design");
  const [templateId, setTemplateId] = useState("modern");
  
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "TechCorp Inc.",
      role: "Frontend Lead",
      duration: "2022 - Present",
      rawText: "I worked on the main website using react. Made things faster and managed 3 juniors.",
      enhancedBullets: [
        "Architected scalable frontend solutions using React, improving overall rendering performance by 40%.",
        "Mentored and managed a team of 3 junior engineers, streamlining continuous integration workflows.",
        "Delivered critical feature updates resulting in a 15% increase in user retention."
      ]
    }
  ]);

  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [lastSyncedResume, setLastSyncedResume] = useState<{ name?: string; title?: string; templateId?: string; lastUpdate?: string } | null>(null);

  // Protected Route Check & Inactivity Timer
  useEffect(() => {
    if (!isLoading && !userEmail) {
      router.push("/");
    }

    let inactivityTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 15 minutes = 15 * 60 * 1000
      inactivityTimer = setTimeout(() => {
        logout();
        router.push("/");
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [userEmail, isLoading, router, logout]);

  // Fetch resume on mount
  useEffect(() => {
    if (!token) return;
    const fetchResume = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/resume`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.name) setName(data.name);
            if (data.title) setTitle(data.title);
            if (data.summary) setSummary(data.summary);
            if (data.skills) setSkills(data.skills);
            if (data.experiences) setExperiences(data.experiences);
            if (data.templateId) setTemplateId(data.templateId);
            setLastSyncedResume(data);
          }
        }
      } catch (_e) {
        console.error("Fetch failed", _e);
      }
    };
    fetchResume();
  }, [token]);

  if (isLoading || !userEmail) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>Loading Secure Workspace...</div>;
  }

  // AI Groq Call (Bulk Mode)
  const enhanceAll = async () => {
    setIsEnhancing("all");
    try {
      const payload = {
        summary,
        skills,
        experiences: experiences.map(e => ({
          id: e.id,
          company: e.company,
          role: e.role,
          duration: e.duration,
          rawText: e.rawText
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/ai/enhance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      
      const enhancedState = JSON.parse(data.enhanced_text);
      
      if (enhancedState.summary) setSummary(enhancedState.summary);
      if (enhancedState.skills) setSkills(enhancedState.skills);
      if (enhancedState.experiences && Array.isArray(enhancedState.experiences)) {
        const mergedExperiences = enhancedState.experiences.map((newExp: Experience) => {
          const oldExp = experiences.find(e => e.id === newExp.id);
          const bullets = newExp.enhancedBullets || [];
          return {
            ...newExp,
            enhancedBullets: bullets,
            rawText: bullets.length > 0 ? bullets.join("\n") : (oldExp ? oldExp.rawText : "")
          };
        });
        setExperiences(mergedExperiences);
      }

    } catch (err: unknown) {
      console.error(err);
      alert("AI Enhancement Failed! Please check the console output or verify the format.");
    } finally {
      setIsEnhancing(null);
    }
  };

  // Update Experience Field
  const updateExp = (id: string, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map(e => {
      if (e.id === id) {
        const nextExp = { ...e, [field]: value };
        if (field === "rawText") {
          nextExp.enhancedBullets = value.split("\n").filter((el: string) => el.trim().length > 0);
        }
        return nextExp;
      }
      return e;
    }));
  };

  // Add new experience
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      role: "",
      duration: "",
      rawText: "",
      enhancedBullets: []
    };
    setExperiences([...experiences, newExp]);
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/resume`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          resume_data: { name, title, summary, skills, experiences, templateId }
        })
      });
      if (res.ok) {
        setLastSyncedResume({ name, title, templateId, lastUpdate: new Date().toLocaleTimeString() });
        alert("Resume securely synced to Supabase Cloud.");
      } else {
        alert("Failed to sync to cloud.");
      }
    } catch {
      alert("Network error while saving.");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      
      {/* ─── PRINT ONLY CSS LOGIC ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: auto; margin: 0mm; }
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2cm !important;
            /* Do not force background overrides so template colors persist */
          }
          .chip {
            border: 1px solid #333 !important;
          }
          /* Hide UI elements from print */
          .no-print, .no-print * {
            display: none !important;
          }
        }
      `}} />

      {/* ─── LEFT PANEL: EDITOR ─── */}
      <div className="no-print" style={{ width: "450px", borderRight: "1px solid rgba(72,72,73,0.2)", height: "100vh", overflowY: "auto", background: "var(--surface-container-low)", padding: "2rem", zIndex: 10, position: "relative" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div style={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: "1.2rem", color: "var(--primary)" }}>
            ⬡ Builder Workspace
          </div>
          <button onClick={() => { logout(); router.push("/"); }} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", fontSize: "0.85rem" }}>
            Logout
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />

          {/* Basics */}
          <section>
            <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Basics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input className="input-neon" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={{ width: "100%", padding: "12px" }} />
              <input className="input-neon" value={title} onChange={e => setTitle(e.target.value)} placeholder="Professional Title" style={{ width: "100%", padding: "12px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <textarea className="input-neon" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" style={{ width: "100%", padding: "12px", minHeight: "80px", resize: "vertical" }} />
              </div>
            </div>
          </section>

          {/* Experience */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience</h3>
              <button className="btn-secondary" onClick={addExperience} style={{ padding: "4px 8px", fontSize: "0.75rem" }}>+ Add</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ background: "var(--surface-container)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(72,72,73,0.2)" }}>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input className="input-neon" value={exp.company} onChange={e => updateExp(exp.id, "company", e.target.value)} placeholder="Company" style={{ flex: 1, padding: "10px", fontSize: "0.875rem" }} />
                    {experiences.length > 1 && (
                      <button onClick={() => removeExperience(exp.id)} title="Remove Experience" style={{ background: "transparent", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                        &times;
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <input className="input-neon" value={exp.role} onChange={e => updateExp(exp.id, "role", e.target.value)} placeholder="Role" style={{ flex: 1, padding: "10px", fontSize: "0.875rem" }} />
                    <input className="input-neon" value={exp.duration} onChange={e => updateExp(exp.id, "duration", e.target.value)} placeholder="Duration" style={{ width: "120px", padding: "10px", fontSize: "0.875rem" }} />
                  </div>
                  
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginBottom: "4px", display: "block" }}>Experience Description (Bullet Points)</label>
                    <textarea 
                      className="input-neon" 
                      value={exp.rawText} 
                      onChange={e => updateExp(exp.id, "rawText", e.target.value)} 
                      placeholder="e.g. built a web app using nextjs..." 
                      style={{ width: "100%", padding: "10px", minHeight: "100px", fontSize: "0.875rem", resize: "vertical", fontFamily: "var(--font-mono, monospace)" }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Skills (CSV)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <textarea className="input-neon" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node, etc..." style={{ width: "100%", padding: "12px", minHeight: "60px", resize: "none" }} />
            </div>
          </section>

          {/* Master AI Button at Bottom */}
          <section style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
            <button 
              onClick={enhanceAll} 
              disabled={isEnhancing !== null} 
              className="btn-primary" 
              style={{ padding: "16px", width: "100%", fontSize: "1.0625rem", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", boxShadow: "0 0 20px rgba(161,253,96,0.2)" }}
            >
              <span style={{ fontSize: "1.2rem" }}>✦</span> {isEnhancing === "all" ? "Groq AI Optimizing Entire Resume..." : "Enhance Entire Resume with AI"}
            </button>
          </section>

        </div>
      </div>

      {/* ─── RIGHT PANEL: LIVE PREVIEW & ACTIONS ─── */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto", position: "relative" }}>
        
        {/* Floating Action Bar */}
        <div className="no-print" style={{ position: "sticky", top: "2rem", display: "flex", justifyContent: "flex-end", padding: "0 2rem", zIndex: 50, pointerEvents: "none" }}>
          <div style={{ background: "rgba(14,14,15,0.6)", backdropFilter: "blur(12px)", padding: "8px 12px", borderRadius: "100px", border: "1px solid rgba(161,253,96,0.2)", display: "flex", gap: "10px", pointerEvents: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <button onClick={handleSave} className="btn-secondary" disabled={isSaving} style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "0.875rem", border: "none" }}>
              {isSaving ? "Syncing..." : "☁️ Save to Cloud"}
            </button>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: "8px 20px", borderRadius: "100px", fontSize: "0.875rem" }}>
              ↓ Export PDF
            </button>
          </div>
        </div>

        {/* The Live Resume Paper */}
        <div style={{ padding: "4rem 2rem", display: "flex", justifyContent: "center" }}>
          {templateId === "modern" && <ModernTemplate data={{ name, title, summary, skills, experiences }} />}
          {templateId === "minimal" && <MinimalTemplate data={{ name, title, summary, skills, experiences }} />}
          {templateId === "creative" && <CreativeTemplate data={{ name, title, summary, skills, experiences }} />}
        </div>

        {/* Floating Liquid Button */}
        <div className="no-print" style={{ position: "fixed", bottom: "3rem", right: "3rem", zIndex: 100 }}>
          <LiquidArchiveButton onClick={() => setIsArchiveOpen(true)} />
        </div>

        {/* Saved Resumes Expand Modal */}
        <div className="no-print" style={{ 
          position: "fixed", 
          inset: 0, 
          zIndex: 200, 
          pointerEvents: isArchiveOpen ? "auto" : "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {/* Backdrop */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,14,15,0.7)",
            backdropFilter: "blur(8px)",
            opacity: isArchiveOpen ? 1 : 0,
            transition: "opacity 0.5s ease"
          }} onClick={() => setIsArchiveOpen(false)} />
          
          {/* Modal Content container expanding from bottom right */}
          <div style={{
            position: "relative",
            width: "50%",
            height: "60vh",
            background: "rgba(30, 30, 32, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(161, 253, 96, 0.3)",
            borderRadius: "24px",
            padding: "3rem",
            boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            transform: isArchiveOpen ? "translateY(0)" : "translateY(50px)",
            opacity: isArchiveOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
            willChange: "transform, opacity",
            display: "flex",
            flexDirection: "column"
          }}>
            <button onClick={() => setIsArchiveOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "transparent", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "1.5rem" }}>
              &times;
            </button>
            <h2 style={{ fontSize: "1.8rem", color: "var(--primary)", marginBottom: "1rem", fontFamily: "var(--font-space-grotesk)" }}>
              Saved Resumes
            </h2>
            <p style={{ color: "var(--on-surface-variant)" }}>Your securely synced cloud resumes across all devices.</p>
            
            <div style={{ flex: 1, marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lastSyncedResume ? (
                <div style={{
                  background: "var(--surface-container-low)",
                  border: "1px solid rgba(161, 253, 96, 0.2)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--on-surface)", marginBottom: "0.25rem" }}>
                      Main Resume Profile
                    </h3>
                    <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", margin: 0 }}>
                      {lastSyncedResume.name || "Unknown"} • {lastSyncedResume.title || "No Title"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--primary)", background: "rgba(161, 253, 96, 0.1)", padding: "4px 8px", borderRadius: "8px" }}>
                      {lastSyncedResume.lastUpdate ? `Synced ${lastSyncedResume.lastUpdate}` : "Synced to Cloud"}
                    </span>
                    <button onClick={() => setIsArchiveOpen(false)} className="btn-secondary" style={{ padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--on-surface)" }}>
                      Load
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                  <span style={{ color: "var(--on-surface-variant)", fontStyle: "italic" }}>No Cloud Resumes Found. Save to Cloud to begin.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
