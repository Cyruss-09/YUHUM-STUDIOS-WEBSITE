// client/src/components/admin/UsersPanel.jsx
import { useState, useMemo } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Shield,
  ShieldAlert,
  User,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  X,
  RefreshCw,
  UserCheck,
  UserPlus,
} from "lucide-react";

export default function UsersPanel() {
  const { users, loading, error, refetch, updateUserRole, deleteUser, createUser } = useAdminUsers();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Role update state
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const guests = total - admins;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = users.filter((u) => {
      if (!u.created_at) return false;
      return new Date(u.created_at) >= thirtyDaysAgo;
    }).length;

    return { total, admins, guests, recent };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "guest" : "admin";
    setUpdatingRoleId(targetUser.id);
    const res = await updateUserRole(targetUser.id, nextRole);
    setUpdatingRoleId(null);

    if (res?.success) {
      showToast(
        `User "${targetUser.username}" ${nextRole === "admin" ? "promoted to Admin" : "demoted to Guest"}.`
      );
    } else {
      showToast(res?.error || "Failed to update user role.", "error");
    }
  };

  const handleOpenDeleteModal = (targetUser) => {
    // Prevent admin from deleting their own current session
    if (
      (currentUser?.id && currentUser.id === targetUser.id) ||
      (currentUser?.email && currentUser.email.toLowerCase() === targetUser.email.toLowerCase())
    ) {
      showToast("You cannot delete your own active administrator account.", "error");
      return;
    }
    setDeleteError("");
    setUserToDelete(targetUser);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError("");

    const res = await deleteUser(userToDelete.id);
    setIsDeleting(false);

    if (res?.success) {
      showToast(`User "${userToDelete.username || userToDelete.email}" deleted successfully.`);
      setUserToDelete(null);
    } else {
      setDeleteError(res?.error || "Failed to delete user.");
      showToast(res?.error || "Failed to delete user.", "error");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);
    const res = await createUser(createForm);
    setIsCreating(false);
    if (res?.success) {
      showToast(`Account "${createForm.username}" created successfully as ${createForm.role}.`);
      setCreateForm({ username: "", email: "", password: "", role: "user" });
      setShowCreateModal(false);
    } else {
      setCreateError(res?.error || "Failed to create user account.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading user accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold">Failed to load user accounts</h4>
          <p className="mt-1 text-xs">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-semibold hover:bg-red-200"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl transition-all ${
            toastType === "error"
              ? "bg-red-900 text-red-100 border border-red-700"
              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-gray-800 dark:border-gray-200"
          }`}
        >
          {toastType === "error" ? (
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            {stats.total}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Registered user accounts
          </p>
        </div>

        {/* Admins */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Administrators
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Shield size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
            {stats.admins}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Full admin dashboard access
          </p>
        </div>

        {/* Guests / Clients */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Clients / Guests
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <User size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.guests}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Registered client users
          </p>
        </div>

        {/* Recent Registrations */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              New (Last 30 Days)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            +{stats.recent}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            New user registrations
          </p>
        </div>
      </div>

      {/* Search, Filter & Refresh Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            <option value="All">All Roles</option>
            <option value="guest">Guests / Clients</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreateError("");
              setCreateForm({ username: "", email: "", password: "", role: "user" });
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5 text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            title="Refresh user list"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">User</th>
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">Joined Date</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filteredUsers.map((u) => {
              const isCurrentAdmin =
                (currentUser?.id && currentUser.id === u.id) ||
                (currentUser?.email && currentUser.email.toLowerCase() === u.email.toLowerCase());

              return (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* User name with avatar */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {u.username}
                          {isCurrentAdmin && (
                            <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-1.5 py-0.5 rounded-md">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">ID #{u.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                    {u.email}
                  </td>

                  {/* Role Badge */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800"
                          : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {u.role === "admin" ? (
                        <Shield size={12} className="text-purple-600 dark:text-purple-400" />
                      ) : (
                        <User size={12} className="text-gray-500" />
                      )}
                      {u.role === "admin" ? "Administrator" : "Guest / Client"}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 text-xs">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Promote / Demote Role Button */}
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={updatingRoleId === u.id || isCurrentAdmin}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                          u.role === "admin"
                            ? "border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            : "border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        }`}
                        title={
                          isCurrentAdmin
                            ? "Cannot modify own role"
                            : u.role === "admin"
                            ? "Demote to guest"
                            : "Promote to admin"
                        }
                      >
                        {updatingRoleId === u.id ? (
                          "Updating..."
                        ) : u.role === "admin" ? (
                          "Demote to Guest"
                        ) : (
                          "Promote to Admin"
                        )}
                      </button>

                      {/* Delete User Action Button */}
                      <button
                        onClick={() => handleOpenDeleteModal(u)}
                        disabled={isCurrentAdmin}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title={
                          isCurrentAdmin
                            ? "Cannot delete your own active account"
                            : `Delete user ${u.username}`
                        }
                        aria-label={`Delete user ${u.username}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  No user accounts found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setUserToDelete(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Delete User Account
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Confirm deletion of user data
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isDeleting && setUserToDelete(null)}
                disabled={isDeleting}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 mb-4 border border-gray-100 dark:border-gray-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Username:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {userToDelete.username}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {userToDelete.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Role:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {userToDelete.role || "guest"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  #{userToDelete.id}
                </span>
              </div>
            </div>

            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-5">
              ⚠️ Warning: This will permanently delete this user account and revoke all login and administrator access. This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User / Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <UserPlus size={18} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  Create User Account
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Account Role *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="user">User / Client (Standard)</option>
                  <option value="admin">Administrator (Full Dashboard Access)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}