import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("yuhum_token"));
  const [loading, setLoading] = useState(true);

  // Bootstrap session from token on mount
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem("yuhum_token");
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Session expired");
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data.admin || null);
        return data.user || data.admin;
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (err) {
      if (err.message === "Session expired") {
        localStorage.removeItem("yuhum_token");
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * User login with Email or Username + Password
   */
  const login = async (identifier, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Login failed. Please check your credentials.");
    }

    if (data.token) {
      localStorage.setItem("yuhum_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  /**
   * Admin login
   */
  const loginAdmin = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Admin authentication failed.");
    }

    const adminUser = data.admin || data.user;
    if (data.token) {
      localStorage.setItem("yuhum_token", data.token);
      setToken(data.token);
      setUser(adminUser);
    }
    return adminUser;
  };

  /**
   * User login with Google
   */
  const loginWithGoogle = async (payload) => {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Google authentication failed.");
    }

    if (data.token) {
      localStorage.setItem("yuhum_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  /**
   * User login with Facebook
   */
  const loginWithFacebook = async (payload) => {
    const res = await fetch(`${API_BASE}/api/auth/facebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Facebook authentication failed.");
    }

    if (data.token) {
      localStorage.setItem("yuhum_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  /**
   * User registration
   */
  const register = async ({ username, email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Registration failed. Please try again.");
    }

    if (data.token) {
      localStorage.setItem("yuhum_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  /**
   * Trigger client forgot password email
   */
  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Failed to process forgot password request.");
    }
    return data;
  };

  /**
   * Trigger admin security forgot password email
   */
  const adminForgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/admin/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Failed to process admin forgot password request.");
    }
    return data;
  };

  /**
   * Complete password reset
   */
  const resetPassword = async (resetToken, newPassword) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password/${encodeURIComponent(resetToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to reset password.");
    }
    return data;
  };

  /**
   * Logout current session
   */
  const logout = () => {
    localStorage.removeItem("yuhum_token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user?.role === "admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        loginAdmin,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        forgotPassword,
        adminForgotPassword,
        resetPassword,
        refreshUser,
      }}
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
