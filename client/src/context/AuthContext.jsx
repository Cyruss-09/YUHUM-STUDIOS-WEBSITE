import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// CHANGED: was `|| ""`, which made every request a relative URL resolved
// against the frontend's own origin (localhost:5173) instead of the
// backend (localhost:5000) — causing a 404 on an empty body, which then
// broke response.json() with "Unexpected end of JSON input".
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("yuhum_token"));
  const [loading, setLoading] = useState(true);

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

        // Only force logout if explicitly unauthorized
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session expired");
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        // Only clear token on explicit expiration, not random network drops
        if (err.message === "Session expired") {
          localStorage.removeItem("yuhum_token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]); // <-- Add token here so it tracks state properly, or protect the catch block from destroying valid tokens on minor network errors.

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    // CHANGED: routes/auth.js returns errors as { message: ... }, not
    // { error: ... } — this was always reading undefined before.
    if (!res.ok) throw new Error(data.message || "Login failed.");

    localStorage.setItem("yuhum_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // loginAdmin — hits the admin-specific backend route and reads `data.admin`
  // (not `data.user`, since that's the key server.js's /admin/login route returns).
  const loginAdmin = async (email, password) => {
    // Added "/auth" so it matches your backend route mount point
    const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed.");

    localStorage.setItem("yuhum_token", data.token);
    setToken(data.token);
    setUser(data.admin);
    return data.admin;
  };

  // CHANGED: register() now sends { username, email, password } — matching
  // both routes/auth.js (which expects `username`) and LoginRegister.jsx
  // (which collects `username`, not firstName/lastName). The previous
  // { firstName, lastName, email, password } shape matched neither.
  const register = async ({ username, email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    // CHANGED: data.message instead of data.error, same reason as login().
    if (!res.ok) throw new Error(data.message || "Registration failed.");

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
      value={{ user, token, loading, login, loginAdmin, register, logout }}
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
