"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicLoader() {
  const [phase, setPhase] = useState<"intro" | "reveal" | "done">("intro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only show once per session
    const seen = sessionStorage.getItem("aura_loader_seen");
    if (seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }
    setMounted(true);
    sessionStorage.setItem("aura_loader_seen", "1");

    // Phase timeline
    const t1 = setTimeout(() => setPhase("reveal"), 1600);
    const t2 = setTimeout(() => setPhase("done"), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0e0e0f",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* Scan-line overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(161,253,96,0.015) 2px, rgba(161,253,96,0.015) 4px)",
              pointerEvents: "none",
              animation: "scan-line 8s linear infinite",
            }}
          />

          {/* Ambient glow orbs */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "20%",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(161,253,96,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
              willChange: "transform",
              transform: "translateZ(0)",
              animation: "orb-drift 6s ease-in-out infinite alternate",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              right: "15%",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,238,252,0.1) 0%, transparent 70%)",
              filter: "blur(60px)",
              willChange: "transform",
              transform: "translateZ(0)",
              animation: "orb-drift 8s ease-in-out infinite alternate-reverse",
            }}
          />

          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #a1fd60, #5fb41b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                boxShadow: "0 0 60px rgba(161,253,96,0.4)",
              }}
            >
              ⬡
            </div>
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            style={{
              position: "relative",
              zIndex: 1,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#fff",
            }}
          >
            Aura<span style={{ color: "#a1fd60" }}>In</span>
            <span style={{ color: "#a1fd60" }}>.</span>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "rgba(161,253,96,0.1)",
            }}
          >
            <motion.div
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={{ scaleX: 1, transformOrigin: "left" }}
              transition={{ delay: 0.5, duration: 1.6, ease: "easeInOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #a1fd60, #00eefc)",
                boxShadow: "0 0 10px rgba(161,253,96,0.8)",
              }}
            />
          </motion.div>

          {/* Curtain reveal */}
          <AnimatePresence>
            {phase === "reveal" && (
              <>
                <motion.div
                  key="curtain-top"
                  initial={{ scaleY: 1, transformOrigin: "top" }}
                  animate={{ scaleY: 0, transformOrigin: "top" }}
                  transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: "#0e0e0f",
                    zIndex: 2,
                  }}
                />
                <motion.div
                  key="curtain-bottom"
                  initial={{ scaleY: 1, transformOrigin: "bottom" }}
                  animate={{ scaleY: 0, transformOrigin: "bottom" }}
                  transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: "#0e0e0f",
                    zIndex: 2,
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
