"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export const FloatingNav = ({ navItems }: { navItems: Array<{ name: string; link: string; icon?: React.ReactNode }> }) => {
  const [visible, setVisible] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastY && currentScrollY > 50) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      lastY = currentScrollY;

      // Active Pill Logic based on scroll position
      if (currentScrollY < 300) {
        setActiveIdx(0); // Home
      } else {
        let maxTop = -Infinity;
        let newIdx = -1;
        navItems.forEach((item, idx) => {
          if (item.link.startsWith("#")) {
            const el = document.getElementById(item.link.substring(1));
            if (el) {
              const rect = el.getBoundingClientRect();
              // If top of section crosses upper half of screen
              if (rect.top <= window.innerHeight * 0.4 && rect.top > maxTop) {
                maxTop = rect.top;
                newIdx = idx;
              }
            }
          }
        });
        if (newIdx !== -1) {
          setActiveIdx(newIdx);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  return (
    <div
      className={`sm:hidden fixed bottom-6 left-0 right-0 z-[5000] px-4 mx-auto w-full transition-transform duration-300 flex justify-center ${
        visible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <div
        style={{
          background: "rgba(14,14,15,0.6)",
          backdropFilter: "blur(12px)",
          padding: "8px 12px",
          borderRadius: "100px",
          border: "1px solid rgba(161,253,96,0.2)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          width: "100%",
          maxWidth: "340px",
          justifyContent: "space-between"
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "16px", paddingLeft: "8px" }}>
          {/* Glassmorphism Sliding Active Pill */}
          <div
            style={{
              position: "absolute",
              left: `${8 + activeIdx * 48}px`, // 8px left padding + (32px width + 16px gap) per index
              width: "32px",
              height: "32px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "100px",
              transition: "left 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
              zIndex: 0,
              boxShadow: "0 0 10px rgba(161,253,96,0.1)"
            }}
          />
          {navItems.map((navItem: { name: string; link: string; icon?: React.ReactNode }, idx: number) => (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              onClick={() => setActiveIdx(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                width: "32px",
                height: "32px",
                color: activeIdx === idx ? "var(--primary)" : "var(--on-surface-variant)",
                transition: "color 0.4s ease",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span style={{ display: "block" }}>{navItem.icon}</span>
            </Link>
          ))}
        </div>
        <a
          href="#login"
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: "8px 20px",
            borderRadius: "100px",
            color: "var(--background)",
            background: "var(--primary)",
            textDecoration: "none",
            boxShadow: "0 0 15px rgba(161,253,96,0.3)",
            transition: "transform 0.2s ease"
          }}
        >
          <span>Login</span>
        </a>
      </div>
    </div>
  );
};
