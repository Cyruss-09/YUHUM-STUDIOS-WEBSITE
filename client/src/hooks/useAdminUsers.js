// client/src/hooks/useAdminUsers.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

export function useAdminUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUserRole = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error("Failed to update role");
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return { users, loading, error, refetch: fetchUsers, updateUserRole };
}
