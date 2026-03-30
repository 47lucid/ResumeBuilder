"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  userEmail: string | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Parse a valid, non-expired JWT stored in localStorage — or return null. */
function readStoredAuth(): { token: string; email: string } | null {
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
  // Lazy initializers run once on mount — no useEffect needed for hydration
  const [token, setToken] = useState<string | null>(() => readStoredAuth()?.token ?? null);
  const [userEmail, setUserEmail] = useState<string | null>(() => readStoredAuth()?.email ?? null);

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
    <AuthContext.Provider value={{ userEmail, token, login, logout, isLoading: false }}>
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
