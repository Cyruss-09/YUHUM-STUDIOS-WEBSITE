// client/src/hooks/useAdminSubscribers.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export function useAdminSubscribers() {
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscribers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscribers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch subscribers: ${res.statusText}`);
      }
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error("Error loading subscribers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const addSubscriber = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to add subscriber: ${res.statusText}`);
      }

      setSubscribers((prev) => {
        const exists = prev.some((s) => s.id === data.subscriber.id);
        if (exists) {
          return prev.map((s) => (s.id === data.subscriber.id ? data.subscriber : s));
        }
        return [data.subscriber, ...prev];
      });
      return { success: true, subscriber: data.subscriber };
    } catch (err) {
      console.error("Error adding subscriber:", err);
      return { success: false, error: err.message };
    }
  };

  const updateStatus = async (subscriberId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscribers/${subscriberId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to update status: ${res.statusText}`);
      }

      setSubscribers((prev) =>
        prev.map((s) => (s.id === subscriberId ? { ...s, status: newStatus } : s))
      );
      return { success: true, subscriber: data.subscriber };
    } catch (err) {
      console.error("Error updating subscriber status:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteSubscriber = async (subscriberId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscribers/${subscriberId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to delete subscriber: ${res.statusText}`);
      }

      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    subscribers,
    loading,
    error,
    refetch: fetchSubscribers,
    addSubscriber,
    updateStatus,
    deleteSubscriber,
  };
}
