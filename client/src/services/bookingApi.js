const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

// All backend I/O for the booking flow lives here. Components/hooks never
// call fetch() directly — they call this function and handle the result.
// Swapping the endpoint, adding auth headers, retry logic, etc. only
// touches this file.
export async function submitBooking(payload) {
  // CHANGED: attach the logged-in user's JWT so the backend's verifyToken
  // middleware accepts the request. Without this, /api/bookings now
  // returns 401 for every submission (by design — booking requires login).
  const token = localStorage.getItem("yuhum_token");

  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return { ok: response.ok, result };
}