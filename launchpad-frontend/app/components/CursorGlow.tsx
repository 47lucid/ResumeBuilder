"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        // High-performance hardware accelerated tracking
        glowRef.current.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "600px", // Size of the glow
          height: "600px",
          borderRadius: "50%",
          pointerEvents: "none",
          background: "radial-gradient(circle at center, rgba(161,253,96,0.06) 0%, rgba(0,238,252,0.02) 40%, transparent 70%)",
          zIndex: 0,             // Render deeply below UI but above pure background
          mixBlendMode: "screen",
          willChange: "transform",
          transform: "translate3d(-50%, -50%, 0)", // Off-screen center init
          transition: "opacity 0.6s ease-in", // Only transition opacity dynamically
          opacity: 1,
        }}
      />
      {/* Background Dimmer layer logic if you want the glow to pop more can go here, 
          but LaunchPad's dark mode already stands out. */}
    </>
  );
}
