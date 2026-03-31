"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../lib/api";


function CallbackUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [stage, setStage] = useState<"blooming" | "ready">("blooming");

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    
    if (!email || !token) {
      router.push("/");
      return;
    }

    const verify = async () => {
      try {
        const [res] = await Promise.all([
          fetch(getApiUrl("/api/auth/verify-link"), {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
          }),
          // Simulate token verification and bloom animation time
          new Promise(r => setTimeout(r, 2800))
        ]);

        const data = await res.json();
        if (res.ok && data.success && data.token) {
          login(data.token);
          setStage("ready");
        } else {
          alert("Link expired or invalid.");
          router.push("/");
        }
      } catch {
        alert("Verification failed.");
        router.push("/");
      }
    };

    verify();
  }, [searchParams, login, router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "var(--background)" }}>
      
      {/* Flower Bloom Entrance Animation Overlay */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          pointerEvents: "none",
          opacity: stage === "blooming" ? 1 : 0,
          transition: "opacity 1s ease-in-out",
        }}
      >
        <div className="flower-container">
          {/* 8 Petals for a lotus/flower effect */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div key={angle} className="petal" style={{ "--angle": `${angle}deg`, "--delay": `${(i % 4) * 0.15}s` } as React.CSSProperties} />
          ))}
          <div className="flower-center" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .flower-container {
          position: relative;
          width: 0;
          height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .petal {
          position: absolute;
          bottom: 50%;
          left: 50%;
          width: 80px;
          height: 220px;
          margin-left: -40px;
          background: linear-gradient(to top, rgba(161,253,96,0.9), rgba(0,238,252,0.6));
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          transform-origin: bottom center;
          opacity: 0;
          transform: rotate(var(--angle)) scaleY(0.1) rotateX(90deg);
          animation: bloom 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: var(--delay);
          box-shadow: 0 0 30px rgba(0,238,252,0.3);
          mix-blend-mode: screen;
        }
        .flower-center {
          position: absolute;
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 50px #fff, 0 0 100px var(--primary);
          opacity: 0;
          transform: scale(0);
          animation: center-glow 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        
        @keyframes bloom {
          0% {
            opacity: 0;
            transform: rotate(var(--angle)) scaleY(0.1) rotateX(90deg);
          }
          20% {
            opacity: 0.9;
          }
          60% {
            opacity: 1;
            transform: rotate(var(--angle)) scaleY(1.2) rotateX(20deg);
          }
          100% {
            opacity: 0;
            transform: rotate(var(--angle)) scaleY(1.6) rotateX(0deg) translateY(-20px);
          }
        }
        
        @keyframes center-glow {
          0% { opacity: 0; transform: scale(0); }
          40% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(3); }
        }
      `}} />

      {/* Main Content (Dashboard/Welcome) */}
      <div 
        style={{
          opacity: stage === "ready" ? 1 : 0,
          transform: stage === "ready" ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          transition: "all 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transitionDelay: "0.2s",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "var(--gradient-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          margin: "0 auto 1.5rem",
          boxShadow: "0 0 30px rgba(161,253,96,0.4)",
          color: "var(--on-primary)",
        }}>
          ✓
        </div>
        <h1 style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 700,
          color: "var(--on-surface)",
          letterSpacing: "-0.04em",
          marginBottom: "1rem"
        }}>
          Authentication Successful
        </h1>
        <p style={{
          color: "var(--on-surface-variant)",
          fontSize: "1.125rem",
          marginBottom: "2.5rem"
        }}>
          Welcome officially to the AuraIn. platform.
        </p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="btn-primary"
          style={{ padding: "14px 32px", fontSize: "1.0625rem" }}
        >
          Go to Dashboard →
        </button>  
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--background)" }} />}>
      <CallbackUI />
    </Suspense>
  );
}
