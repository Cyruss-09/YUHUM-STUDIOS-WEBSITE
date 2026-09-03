import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export function useMyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.bookings ?? []);
      setBookings(
        rows.map((row) => ({
          id: row.id,
          packageTitle: row.package_title,
          studio: row.studio,
          date: row.booking_date,
          dayOfWeek: row.day_of_week,
          time: row.booking_time,
          addOns: row.add_ons ?? [],
          status: row.status ?? "Pending",
          total: row.base_price,
          paymentMode: row.paymentMode,
          couponCode: row.couponCode,
          createdAt: row.created_at,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  /**
   * Cancel a booking by id. Uses optimistic UI — reverts on failure.
   */
  const cancelBooking = async (id) => {
    setCancellingId(id);
    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel booking.");
      }
    } catch (err) {
      // Revert on failure
      setError(err.message);
      fetchMyBookings();
      throw err; // re-throw so the UI can show the error
    } finally {
      setCancellingId(null);
    }
  };

  return {
    bookings,
    loading,
    error,
    cancellingId,
    refetch: fetchMyBookings,
    cancelBooking,
  };
}
