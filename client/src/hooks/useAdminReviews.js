// client/src/hooks/useAdminReviews.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export function useAdminReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.statusText}`);
      }
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const deleteReview = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete review: ${res.statusText}`);
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting review:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    deleteReview,
  };
}
