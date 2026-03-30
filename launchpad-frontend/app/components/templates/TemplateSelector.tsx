import React from "react";

interface Props {
  selectedId: string;
  onSelect: (tempId: string) => void;
}

export function TemplateSelector({ selectedId, onSelect }: Props) {
  const templates = [
    { id: "modern", name: "Modern", icon: "⬡", desc: "Sleek & Neo-Brutalist" },
    { id: "minimal", name: "Minimal", icon: "📄", desc: "ATS-optimized Serif" },
    { id: "creative", name: "Creative", icon: "🎨", desc: "Bold 2-Column Focus" },
  ];

  return (
    <section>
      <h3 style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
        Choose Template
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {templates.map(t => {
          const isActive = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "12px",
                background: isActive ? "rgba(161,253,96,0.1)" : "var(--surface-container)",
                border: `1px solid ${isActive ? "var(--primary)" : "rgba(255,255,255,0.05)"}`,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
            >
              <div style={{ fontSize: "1.2rem" }}>
                {isActive ? "✨" : t.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: isActive ? "var(--primary)" : "var(--on-surface)", fontSize: "0.95rem" }}>
                  {t.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                  {t.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
