import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const SESSION_INACTIVITY_TIMEOUT_MS = 12 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tabor_token");
    localStorage.removeItem("user");
    localStorage.removeItem("tabor_user");
    localStorage.removeItem("session_last_activity");
    setUser(null);
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }, []);

  const loginUser = async (username, password) => {
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (res.token) {
      const now = Date.now();
      lastActivityRef.current = now;
      const normalizedUser = {
        ...res.user,
        name: res.user.full_name || res.user.username,
      };
      localStorage.setItem("token", res.token);
      localStorage.setItem("tabor_token", res.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("tabor_user", JSON.stringify(normalizedUser));
      localStorage.setItem("session_last_activity", now.toString());
      setUser(normalizedUser);
      return normalizedUser;
    }
    throw new Error(res.message || "Login failed");
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("tabor_token");
      const savedUser = localStorage.getItem("user") || localStorage.getItem("tabor_user");
      const lastActivity = Number(localStorage.getItem("session_last_activity") || 0);

      if (token && savedUser) {
        if (lastActivity && Date.now() - lastActivity >= SESSION_INACTIVITY_TIMEOUT_MS) {
          logout();
        } else {
          setUser(JSON.parse(savedUser));
          const now = Date.now();
          lastActivityRef.current = now;
          localStorage.setItem("session_last_activity", now.toString());
        }
      }
    } catch (err) {
      console.error("Auth restore error:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
