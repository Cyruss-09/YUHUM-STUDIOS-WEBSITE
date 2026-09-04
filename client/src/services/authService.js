const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

/**
 * Get current token from storage
 */
export const getAuthToken = () => {
  return localStorage.getItem("yuhum_token");
};

/**
 * Log in an existing user with email/username and password
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to log in");
  }

  if (data.token) {
    localStorage.setItem("yuhum_token", data.token);
  }
  return data;
};

/**
 * Authenticate with Google
 */
export const loginWithGoogle = async (payload) => {
  const response = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Google authentication failed");
  }

  if (data.token) {
    localStorage.setItem("yuhum_token", data.token);
  }
  return data;
};

/**
 * Authenticate with Facebook
 */
export const loginWithFacebook = async (payload) => {
  const response = await fetch(`${API_BASE}/api/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Facebook authentication failed");
  }

  if (data.token) {
    localStorage.setItem("yuhum_token", data.token);
  }
  return data;
};

/**
 * Log in an administrator
 */
export const loginAdmin = async (credentials) => {
  const response = await fetch(`${API_BASE}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to log in as administrator");
  }

  if (data.token) {
    localStorage.setItem("yuhum_token", data.token);
  }
  return data;
};

/**
 * Register a new user account
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to create account");
  }

  if (data.token) {
    localStorage.setItem("yuhum_token", data.token);
  }
  return data;
};

/**
 * Fetch current authenticated user session
 */
export const getCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.user || data.admin || null;
  } catch (e) {
    return null;
  }
};

/**
 * Send password reset link
 */
export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to request password reset");
  }
  return data;
};

/**
 * Reset password with token
 */
export const confirmPasswordReset = async (token, newPassword) => {
  const response = await fetch(`${API_BASE}/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to reset password");
  }
  return data;
};

/**
 * Log out user
 */
export const logoutUser = () => {
  localStorage.removeItem("yuhum_token");
};