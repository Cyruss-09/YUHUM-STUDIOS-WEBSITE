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
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || `Failed to update role: ${res.statusText}`);
            }
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
            return { success: true, user: data.user };
        } catch (err) {
            console.error("Error updating user role:", err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || `Failed to delete user: ${res.statusText}`);
            }
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            return { success: true, message: data.message };
        } catch (err) {
            console.error("Error deleting user:", err);
            return { success: false, error: err.message };
        }
    };

    const createUser = async (userData) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || `Failed to create user: ${res.statusText}`);
            }
            if (data.user) {
                setUsers((prev) => [data.user, ...prev]);
            }
            return { success: true, user: data.user, message: data.message };
        } catch (err) {
            console.error("Error creating user:", err);
            return { success: false, error: err.message };
        }
    };

    return { users, loading, error, refetch: fetchUsers, updateUserRole, deleteUser, createUser };
}
