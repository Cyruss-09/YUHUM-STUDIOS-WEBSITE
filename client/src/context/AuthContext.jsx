import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

const CLIENT_TOKEN_KEY = "yuhum_token";
const ADMIN_TOKEN_KEY = "yuhum_admin_token";

export const AuthProvider = ({ children }) => {
  // ── Client session ───────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(CLIENT_TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // ── Admin session — completely separate slot. Never shares
  // storage or React state with the client session above, so a
  // login on one side can never overwrite or be overwritten by
  // the other, in this tab or any other tab of the same browser.
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [adminLoading, setAdminLoading] = useState(true);

  const fetchProfile = async (currentToken) => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    if (res.status === 401 || res.status === 403) throw new Error("Session expired");
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  };

  // Bootstrap the CLIENT session from its own token on mount
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await fetchProfile(currentToken);
      setUser(data.user || null);
      return data.user;
    } catch (err) {
      if (err.message === "Session expired") {
        localStorage.removeItem(CLIENT_TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bootstrap the ADMIN session from its own separate token on mount
  const refreshAdmin = useCallback(async () => {
    const currentToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!currentToken) {
      setAdminUser(null);
      setAdminLoading(false);
      return null;
    }
    try {
      const data = await fetchProfile(currentToken);
      const adminProfile = data.admin || data.user || null;
      setAdminUser(adminProfile);
      return adminProfile;
    } catch (err) {
      if (err.message === "Session expired") {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
        setAdminUser(null);
      }
      return null;
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshAdmin();
  }, [refreshUser, refreshAdmin]);

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
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  /**
   * Admin login — writes only to the admin slot (ADMIN_TOKEN_KEY),
   * never touching the client's token or user state.
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

    const adminProfile = data.admin || data.user;
    if (data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setAdminToken(data.token);
      setAdminUser(adminProfile);
    }
    return adminProfile;
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
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
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
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
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
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
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
   * Logout the CLIENT session only. Never touches the admin session.
   */
  const logout = () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  /**
   * Logout the ADMIN session only. Never touches the client session.
   */
  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setAdminUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(adminUser && adminToken && adminUser?.role === "admin");

  return (
    <AuthContext.Provider
      value={{
        // Client session
        user,
        token,
        loading,
        isAuthenticated,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        forgotPassword,
        resetPassword,
        refreshUser,

        // Admin session — fully independent from the client session above
        adminUser,
        adminToken,
        adminLoading,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        adminForgotPassword,
        refreshAdmin,
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