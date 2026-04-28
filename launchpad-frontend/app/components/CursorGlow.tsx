"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Neon ripple keyframes injected once ────────────────────── */
const RIPPLE_STYLE = `
@keyframes neon-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
.neon-ripple-ring {
  position: fixed;
  pointer-events: none;
  border-radius: 50%;
  z-index: 99998;
  animation: neon-ripple 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
`;

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  // null = not yet detected, true = touch, false = mouse
  const [isTouch, setIsTouch] = useState<boolean | null>(null);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);

    if (touch) {
      /* ── Inject ripple keyframes once ── */
      if (!document.getElementById("neon-ripple-style")) {
        const style = document.createElement("style");
        style.id = "neon-ripple-style";
        style.textContent = RIPPLE_STYLE;
        document.head.appendChild(style);
      }

      const handleTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;

        // Alternate green / cyan
        const colors = [
          "rgba(161,253,96,0.6)",
          "rgba(0,238,252,0.5)",
          "rgba(161,253,96,0.6)",
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 80 + Math.random() * 60; // 80–140 px

        const ring = document.createElement("div");
        ring.className = "neon-ripple-ring";
        ring.style.cssText = `
          left: ${t.clientX}px;
          top: ${t.clientY}px;
          width: ${size}px;
          height: ${size}px;
          border: 2px solid ${color};
          box-shadow: 0 0 14px ${color}, inset 0 0 8px ${color.replace("0.6", "0.15").replace("0.5", "0.12")};
        `;
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 650);
      };

      window.addEventListener("touchstart", handleTouch, { passive: true });
      return () => window.removeEventListener("touchstart", handleTouch);
    }

    /* ── Desktop: cursor glow ── */
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Not mounted yet, or touch device — render nothing (ripples are injected imperatively)
  if (isTouch !== false) return null;

  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle at center, rgba(161,253,96,0.06) 0%, rgba(0,238,252,0.02) 40%, transparent 70%)",
        zIndex: 0,
        mixBlendMode: "screen",
        willChange: "transform",
        transform: "translate3d(-50%, -50%, 0)",
        opacity: 1,
      }}
    />
  );
}
