import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx"; // adjust path if this hook lives somewhere else

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000"; // matches AuthContext's convention

export function useAdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Backend may return a bare array, or wrap it as { bookings: [...] } / { data: [...] }
      const rows = Array.isArray(data)
        ? data
        : (data.bookings ?? data.data ?? []);

      // Map backend rows -> shape the UI expects
      const mapped = rows.map((row) => ({
        id: row.id,
        customerName:
          [row.firstName, row.lastName].filter(Boolean).join(" ") || "Unknown",
        customerEmail: row.email ?? "",
        packageTitle: row.package_title,
        studio: row.studio,
        date: row.booking_date,
        time: row.booking_time,
        addOns: row.add_ons ?? [],
        status: row.status ?? "Pending",
        total: row.base_price,
      }));

      setBookings(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (id, newStatus) => {
    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );

    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      // Roll back on failure and refetch source of truth
      setError(err.message);
      fetchBookings();
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    updateBookingStatus,
  };
}
