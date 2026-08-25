// client/src/components/admin/SubscribersPanel.jsx
import { useState, useMemo } from "react";
import { useAdminSubscribers } from "../../hooks/useAdminSubscribers";
import {
  Mail,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
  Calendar,
  X,
  RefreshCw,
} from "lucide-react";

export default function SubscribersPanel() {
  const {
    subscribers,
    loading,
    error,
    refetch,
    addSubscriber,
    updateStatus,
    deleteSubscriber,
  } = useAdminSubscribers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);
  const [allCopied, setAllCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Add subscriber modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.status === "active").length;
    const unsubscribed = total - active;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = subscribers.filter((s) => {
      if (!s.created_at) return false;
      return new Date(s.created_at) >= thirtyDaysAgo;
    }).length;

    return { total, active, unsubscribed, recent };
  }, [subscribers]);

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (s.email && s.email.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    showToast(`Copied ${email} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllActive = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === "active")
      .map((s) => s.email)
      .filter(Boolean);

    if (activeEmails.length === 0) {
      showToast("No active subscribers to copy");
      return;
    }

    navigator.clipboard.writeText(activeEmails.join(", "));
    setAllCopied(true);
    showToast(`Copied ${activeEmails.length} active emails to clipboard`);
    setTimeout(() => setAllCopied(false), 2500);
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setAddError("Please enter a valid email address");
      return;
    }

    setIsSubmittingAdd(true);
    setAddError("");
    const res = await addSubscriber(newEmail.trim());
    setIsSubmittingAdd(false);

    if (res.success) {
      setNewEmail("");
      setIsAddModalOpen(false);
      showToast("Subscriber added successfully");
    } else {
      setAddError(res.error || "Failed to add subscriber");
    }
  };

  const handleToggleStatus = async (s) => {
    const nextStatus = s.status === "active" ? "unsubscribed" : "active";
    const res = await updateStatus(s.id, nextStatus);
    if (res.success) {
      showToast(`Subscriber marked as ${nextStatus}`);
    } else {
      showToast(res.error || "Failed to update subscriber status");
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    const res = await deleteSubscriber(id);
    setIsDeleting(false);
    setConfirmDeleteId(null);
    if (res.success) {
      showToast("Subscriber removed successfully");
    } else {
      showToast(res.error || "Failed to delete subscriber");
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ["ID", "Email", "Status", "Date Subscribed"];
    const rows = subscribers.map((s) => [
      s.id,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      s.status || "active",
      s.created_at ? new Date(s.created_at).toISOString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `yuhum_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Subscribers exported to CSV");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading subscriber list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        Failed to load subscribers: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 text-sm font-medium shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Subscribers
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            {stats.total}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Total newsletter audience
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Active Subscribers
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.active}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Receiving emails & promotions
          </p>
        </div>

        {/* Unsubscribed */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Unsubscribed
            </span>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
              <UserX size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-700 dark:text-gray-300 mt-2">
            {stats.unsubscribed}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Opted out of email lists
          </p>
        </div>

        {/* Recent (30 Days) */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              New (Last 30 Days)
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
            +{stats.recent}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Recent organic growth
          </p>
        </div>
      </div>

      {/* Toolbar & Action Header */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by subscriber email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyAllActive}
            disabled={stats.active === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50"
            title="Copy all active subscriber emails separated by comma"
          >
            {allCopied ? (
              <>
                <Check size={15} className="text-emerald-500" />
                <span>Copied All!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy Active ({stats.active})</span>
              </>
            )}
          </button>

          <button
            onClick={exportToCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setNewEmail("");
              setAddError("");
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Subscriber Email</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Subscribed Date</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filteredSubscribers.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {/* Email with copy button */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-semibold text-xs shrink-0">
                      <Mail size={14} />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {s.email}
                      </span>
                      <button
                        onClick={() => handleCopyEmail(s.email, s.id)}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        title="Copy email"
                      >
                        {copiedId === s.id ? (
                          <Check size={13} className="text-emerald-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      s.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.status === "active" ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    ></span>
                    {s.status === "active" ? "Active" : "Unsubscribed"}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 text-xs">
                  {s.created_at
                    ? new Date(s.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                        s.status === "active"
                          ? "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      }`}
                    >
                      {s.status === "active" ? "Mark Inactive" : "Mark Active"}
                    </button>

                    {confirmDeleteId === s.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isDeleting}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                        title="Delete subscriber"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredSubscribers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  No subscribers match your search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Add Newsletter Subscriber
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@example.com"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (addError) setAddError("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
                {addError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                    {addError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="flex-1 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                >
                  {isSubmittingAdd ? "Adding..." : "Add Subscriber"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
