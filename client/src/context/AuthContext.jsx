import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const CLIENT_TOKEN_KEY = "yuhum_token";
const ADMIN_TOKEN_KEY = "yuhum_admin_token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(CLIENT_TOKEN_KEY));
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));

  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  // Helper fetcher
  const fetchProfile = async (authToken, endpoint) => {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Failed to fetch profile");
      error.status = response.status;
      throw error;
    }

    return data;
  };

  // Rehydrate Client User Session on Reload
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(CLIENT_TOKEN_KEY);

    if (!currentToken || currentToken === "null" || currentToken === "undefined") {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const data = await fetchProfile(currentToken, "/api/auth/me");

      // Ensure backend payload returns user object
      const fetchedUser = data.user || data;
      setUser(fetchedUser);
      return fetchedUser;
    } catch (err) {
      console.error("Client session hydration error:", err);
      // ONLY clear storage if token was explicitly rejected by backend (401/403)
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem(CLIENT_TOKEN_KEY);
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
      setAdminUser(null);
      setAdminLoading(false);
      return null;
    }

    try {
      setAdminLoading(true);
      const data = await fetchProfile(currentAdminToken, "/api/admin/me");
      const fetchedAdmin = data.admin || data.user || data;
      setAdminUser(fetchedAdmin);
      return fetchedAdmin;
    } catch (err) {
      console.error("Admin session hydration error:", err);
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
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
        setToken(null);
        setUser(null);
      }
      if (e.key === ADMIN_TOKEN_KEY && !e.newValue) {
        setAdminToken(null);
        setAdminUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    isAdmin: !!adminUser,
    adminUser,
    adminToken,
    adminLoading,
    login,
    logout,
    refreshUser,
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