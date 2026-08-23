// client/src/components/admin/UsersPanel.jsx
import { useState, useMemo } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";

export default function UsersPanel() {
    const { users, loading, error, updateUserRole } = useAdminUsers();
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "All" || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    if (loading) return <div className="p-6 text-sm text-gray-400 dark:text-gray-500">Loading users…</div>;
    if (error) return <div className="p-6 text-sm text-red-500 dark:text-red-400">Failed to load users: {error}</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-80 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                >
                    <option value="All">All Roles</option>
                    <option value="guest">Guest / User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">User</th>
                            <th className="text-left px-4 py-3 font-semibold">Email</th>
                            <th className="text-left px-4 py-3 font-semibold">Role</th>
                            <th className="text-left px-4 py-3 font-semibold">Joined</th>
                            <th className="text-right px-4 py-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{u.username}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${u.role === "admin"
                                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
                                        : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                        }`}>
                                        {u.role || "guest"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => updateUserRole(u.id, u.role === "admin" ? "guest" : "admin")}
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                        {u.role === "admin" ? "Demote to Guest" : "Promote to Admin"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}