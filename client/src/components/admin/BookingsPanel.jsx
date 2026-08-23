import { useState, useMemo } from "react";
import { useAdminBookings } from "../../hooks/useAdminBookings.js"; // fix typo: "usedAdminBookings" -> "useAdminBookings"

const STATUS_STYLES = {
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50",
  Confirmed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50",
  Completed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50",
  Cancelled:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
  "No-show":
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
};

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No-show",
];

export default function BookingsPanel() {
  const { bookings, loading, error, updateBookingStatus } = useAdminBookings();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [studioFilter, setStudioFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    return { total: bookings.length, pending, confirmed, completed };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        (b.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.id).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesStudio = studioFilter === "All" || b.studio === studioFilter;
      return matchesSearch && matchesStatus && matchesStudio;
    });
  }, [bookings, searchQuery, statusFilter, studioFilter]);

  const updateStatus = (id, newStatus) => {
    updateBookingStatus(id, newStatus);
    if (selectedBooking?.id === id) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  if (loading)
    return (
      <div className="p-6 text-sm text-gray-400 dark:text-gray-500">
        Loading bookings…
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-sm text-red-500 dark:text-red-400">
        Failed to load bookings: {error}
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard
          label="Pending"
          value={stats.pending}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          accent="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by customer name or booking ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-gray-400 dark:focus:border-gray-500"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={studioFilter}
            onChange={(e) => setStudioFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            <option value="All">All Studios</option>
            <option value="Studio A">Studio A</option>
            <option value="Studio B">Studio B</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Customer</th>
              <th className="text-left px-4 py-3 font-semibold">Package</th>
              <th className="text-left px-4 py-3 font-semibold">Studio</th>
              <th className="text-left px-4 py-3 font-semibold">Date & Time</th>
              <th className="text-left px-4 py-3 font-semibold">Total</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(b)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {b.customerName}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{b.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.packageTitle}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.studio}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  <div>{b.date}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{b.time}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                  {b.total}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  {b.status === "Pending" && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => updateStatus(b.id, "Confirmed")}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "Cancelled")}
                        className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  No bookings match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-transparent dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {selectedBooking.customerName}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{selectedBooking.id}</p>
              </div>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[selectedBooking.status]}`}
              >
                {selectedBooking.status}
              </span>
            </div>

            <div className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300 mb-6">
              <DetailRow label="Email" value={selectedBooking.customerEmail} />
              <DetailRow label="Package" value={selectedBooking.packageTitle} />
              <DetailRow label="Studio" value={selectedBooking.studio} />
              <DetailRow label="Date" value={selectedBooking.date} />
              <DetailRow label="Time" value={selectedBooking.time} />
              <DetailRow
                label="Add-ons"
                value={
                  selectedBooking.addOns.length
                    ? selectedBooking.addOns.join(", ")
                    : "None"
                }
              />
              <DetailRow label="Total" value={selectedBooking.total} />
            </div>

            <div className="flex gap-2">
              {selectedBooking.status === "Pending" && (
                <>
                  <button
                    onClick={() =>
                      updateStatus(selectedBooking.id, "Confirmed")
                    }
                    className="flex-1 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold py-2.5 hover:bg-gray-800 dark:hover:bg-gray-100"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(selectedBooking.id, "Cancelled")
                    }
                    className="flex-1 rounded-xl border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = "text-gray-900 dark:text-gray-100" }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
      <span className="text-gray-400 dark:text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}