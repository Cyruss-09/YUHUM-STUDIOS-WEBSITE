import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx"; // adjust path if this hook lives somewhere else

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000"; // matches AuthContext's convention

const CANONICAL_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled", "No-show"];

// DB/API status casing isn't guaranteed to match the UI's canonical casing
// (e.g. "pending" vs "Pending"). Normalize so STATUS_STYLES lookups, the
// stats counters, the filter dropdown, and the status === "Pending" checks
// in BookingsPanel all keep working regardless of how it was stored.
function normalizeStatus(raw) {
  if (!raw) return "Pending";
  const match = CANONICAL_STATUSES.find(
    (s) => s.toLowerCase() === String(raw).toLowerCase()
  );
  return match || raw;
}

export function useAdminBookings() {
  const { adminToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!adminToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
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
        status: normalizeStatus(row.status),
        total: row.base_price,
      }));

      setBookings(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

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
          Authorization: `Bearer ${adminToken}`,
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