"use client";

import React, { useEffect, useRef } from "react";
import { IconFolder } from "@tabler/icons-react";
import styles from "./LiquidArchiveButton.module.css";

interface LiquidArchiveButtonProps {
  onClick: () => void;
}

export default function LiquidArchiveButton({ onClick }: LiquidArchiveButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const introRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    // Intro Animation Setup
    let i = 4;
    btn.style.setProperty("--a", "100%");
    introRef.current = setInterval(() => {
      btn.style.setProperty("--x", (((Math.cos(i) + 2) / 3.6) * 100).toString());
      btn.style.setProperty("--y", (((Math.sin(i) + 2) / 3.6) * 100).toString());
      i += 0.03;
      if (i > 11.5) {
        if (introRef.current) clearInterval(introRef.current);
        btn.style.setProperty("--a", "");
        btn.style.setProperty("--x", "50");
        btn.style.setProperty("--y", "50");
      }
    }, 16);

    return () => {
      if (introRef.current) clearInterval(introRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {    
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", (((e.clientX - rect.x) / rect.width) * 100).toString());
    e.currentTarget.style.setProperty("--y", (((e.clientY - rect.y) / rect.height) * 100).toString());
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {   
    const target = e.currentTarget;
    setTimeout(() => {
      target.style.setProperty("--x", "50");
      target.style.setProperty("--y", "50");
    }, 20);
  };

  const handlePointerOver = (e: React.PointerEvent<HTMLButtonElement>) => {    
    if (introRef.current) clearInterval(introRef.current);
    e.currentTarget.style.setProperty("--a", "");
  };

  return (
    <>
      <svg style={{ visibility: "hidden", position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
          </filter>
        </defs>
      </svg>

      <button
        ref={btnRef}
        className={styles.liquidButton}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerOver={handlePointerOver}
        onClick={onClick}
      >
        <div className={styles.gooLayer}>
          <div className={styles.gooBase}></div>
          <div className={styles.gooBlob}></div>
        </div>
        <div className={styles.glassOverlay}></div>
        <div className={styles.icon}>
          <IconFolder size={26} stroke={1.5} color="rgba(255,255,255,0.85)" />
        </div>
      </button>
    </>
  );
}
