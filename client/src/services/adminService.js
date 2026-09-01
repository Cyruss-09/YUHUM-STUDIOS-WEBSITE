const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

const getAdminHeaders = () => {
  const token = localStorage.getItem("yuhum_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch all user accounts
 */
export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    headers: getAdminHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }
  return data.users || [];
};

/**
 * Create a new user or admin account directly
 */
export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to create user");
  }
  return data;
};

/**
 * Update user role (admin / user / guest)
 */
export const updateUserRole = async (userId, role) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: getAdminHeaders(),
    body: JSON.stringify({ role }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to update user role");
  }
  return data;
};

/**
 * Delete a user account
 */
export const deleteUser = async (userId) => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }
  return data;
};

/**
 * Fetch all bookings
 */
export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE}/api/admin/bookings`, {
    headers: getAdminHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch bookings");
  }
  return data.bookings || [];
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status) => {
  const response = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: getAdminHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to update booking status");
  }
  return data;
};
