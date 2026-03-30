"use client";

import { createContext, useContext, useEffect, useState, startTransition, ReactNode } from "react";

interface AuthContextType {
  userEmail: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Parse a valid, non-expired JWT from localStorage.
 * Returns null on the server (SSR), on missing token, or on invalid/expired token.
 * The typeof window guard prevents ReferenceError during Next.js build prerendering.
 */
function readStoredAuth(): { token: string; email: string } | null {
  if (typeof window === "undefined") return null; // SSR guard — no localStorage on server
  try {
    const stored = localStorage.getItem("launchpad_token");
    if (!stored) return null;
    const payload = JSON.parse(atob(stored.split(".")[1]));
    if (payload.exp * 1000 > Date.now()) {
      return { token: stored, email: payload.sub as string };
    }
    localStorage.removeItem("launchpad_token");
  } catch {
    localStorage.removeItem("launchpad_token");
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // isLoading stays true until the client hydrates so protected routes don't
  // flash before the stored token is read.
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Read localStorage only on the client after hydration.
  // Using useEffect (runs only in the browser) avoids the SSR
  // ReferenceError that the lazy initializer approach caused.
  useEffect(() => {
    const auth = readStoredAuth();
    startTransition(() => {
      if (auth) {
        setToken(auth.token);
        setUserEmail(auth.email);
      }
      setIsLoading(false);
    });
  }, []);

  const login = (newToken: string) => {
    try {
      const payload = JSON.parse(atob(newToken.split(".")[1]));
      setToken(newToken);
      setUserEmail(payload.sub as string);
      localStorage.setItem("launchpad_token", newToken);
    } catch {
      console.error("Invalid token format");
    }
  };

  const logout = () => {
    setUserEmail(null);
    setToken(null);
    localStorage.removeItem("launchpad_token");
  };

  return (
    <AuthContext.Provider value={{ userEmail, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
