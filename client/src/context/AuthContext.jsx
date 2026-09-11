import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

const CLIENT_TOKEN_KEY = "yuhum_token";
const CLIENT_USER_KEY = "yuhum_user";
const ADMIN_TOKEN_KEY = "yuhum_admin_token";
const ADMIN_USER_KEY = "yuhum_admin_user";

const buildUrl = (path) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(CLIENT_TOKEN_KEY));
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(CLIENT_TOKEN_KEY)));
  const [adminLoading, setAdminLoading] = useState(() => Boolean(localStorage.getItem(ADMIN_TOKEN_KEY)));

  // Helper fetcher
  const fetchProfile = async (authToken, endpoint) => {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || "Failed to fetch profile");
      error.status = response.status;
      throw error;
    }

    return data;
  };

  // Rehydrate Client User Session on Reload
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(CLIENT_TOKEN_KEY);

    if (!currentToken || currentToken === "null" || currentToken === "undefined") {
      localStorage.removeItem(CLIENT_TOKEN_KEY);
      localStorage.removeItem(CLIENT_USER_KEY);
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const data = await fetchProfile(currentToken, "/api/auth/me");

      // Ensure backend payload returns user object
      const fetchedUser = data.user || data;
      setUser(fetchedUser);
      localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(fetchedUser));
      return fetchedUser;
    } catch (err) {
      console.error("Client session hydration error:", err);
      // ONLY clear storage if token was explicitly rejected by backend (401/403)
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem(CLIENT_TOKEN_KEY);
        localStorage.removeItem(CLIENT_USER_KEY);
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rehydrate Admin Session on Reload
  const refreshAdmin = useCallback(async () => {
    const currentAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!currentAdminToken || currentAdminToken === "null" || currentAdminToken === "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setAdminUser(null);
      setAdminToken(null);
      setAdminLoading(false);
      return null;
    }

    try {
      setAdminLoading(true);
      const data = await fetchProfile(currentAdminToken, "/api/admin/me");
      const fetchedAdmin = data.admin || data.user || data;
      setAdminUser(fetchedAdmin);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(fetchedAdmin));
      return fetchedAdmin;
    } catch (err) {
      console.error("Admin session hydration error:", err);
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminToken(null);
        setAdminUser(null);
      }
      return null;
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // Initial Load Trigger
  useEffect(() => {
    refreshUser();
    refreshAdmin();
  }, [refreshUser, refreshAdmin]);

  // Sync Logouts Across Tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CLIENT_TOKEN_KEY && !e.newValue) {
        localStorage.removeItem(CLIENT_USER_KEY);
        setToken(null);
        setUser(null);
      }
      if (e.key === ADMIN_TOKEN_KEY && !e.newValue) {
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminToken(null);
        setAdminUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    const response = await fetch(buildUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Login failed");

    localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // User Registration
  const register = async ({ username, email, password }) => {
    const response = await fetch(buildUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Registration failed");

    if (data.token) {
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
      localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  // Google OAuth Login
  const loginWithGoogle = async (payload) => {
    const response = await fetch(buildUrl("/api/auth/google"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Google authentication failed");

    if (data.token) {
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
      localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  // Facebook OAuth Login
  const loginWithFacebook = async (payload) => {
    const response = await fetch(buildUrl("/api/auth/facebook"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Facebook authentication failed");

    if (data.token) {
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
      localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data.user;
  };

  // Client Forgot Password Request
  const forgotPassword = async (email) => {
    const response = await fetch(buildUrl("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Failed to process forgot password request.");
    return data;
  };

  // Reset Password
  const resetPassword = async (resetToken, newPassword) => {
    const response = await fetch(buildUrl(`/api/auth/reset-password/${encodeURIComponent(resetToken)}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Failed to reset password.");
    return data;
  };

  // Admin Forgot Password Request
  const adminForgotPassword = async (email) => {
    const response = await fetch(buildUrl("/api/auth/admin/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Failed to process admin forgot password request.");
    return data;
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    const response = await fetch(buildUrl("/api/auth/admin/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Admin login failed");

    const token = data.token || data.adminToken;
    const admin = data.admin || data.user;

    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    setAdminToken(token);
    setAdminUser(admin);
    return admin;
  };

  // Logout Client handler
  const logout = () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem(CLIENT_USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Admin logout handler
  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdminToken(null);
    setAdminUser(null);
  };

  const value = {
    // Client State
    token,
    user,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithFacebook,
    forgotPassword,
    resetPassword,
    refreshUser,

    // Admin State
    adminUser,
    adminToken,
    adminLoading,
    isAdmin: Boolean(adminUser && adminToken && adminUser?.role === "admin"),
    loginAdmin,
    logoutAdmin,
    adminForgotPassword,
    refreshAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};