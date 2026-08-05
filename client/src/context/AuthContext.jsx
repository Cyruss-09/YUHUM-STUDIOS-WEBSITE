import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Vite project (main.jsx entry) -> use import.meta.env, not process.env.
// Set VITE_API_BASE in a .env at the frontend root if your API isn't
// proxied/same-origin, e.g. VITE_API_BASE=http://localhost:5000
const API_BASE = import.meta.env?.VITE_API_BASE || "";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("yuhum_token"));
  const [loading, setLoading] = useState(true);

  // On first load, if we have a stored token, verify it's still valid and
  // fetch the current user so refreshing the page doesn't log you out.
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        setUser(data.user);
      } catch {
        localStorage.removeItem("yuhum_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed.");

    localStorage.setItem("yuhum_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ firstName, lastName, email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed.");

    localStorage.setItem("yuhum_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("yuhum_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
