import { useState, useMemo } from "react";

// Mock data — shaped to match the bookingSummary object from usePackageBooking.
// Swap this out for a real fetch() once the backend exists.
const MOCK_BOOKINGS = [
  {
    id: "BK-1001",
    customerName: "Maria Santos",
    customerEmail: "maria.santos@email.com",
    packageTitle: "Duo Package",
    studio: "Studio A",
    date: "August 16, 2026",
    time: "2:00 PM",
    addOns: ["Extra 15 mins", "Printed Photos"],
    status: "Confirmed",
    total: "₱1,800",
  },
  {
    id: "BK-1002",
    customerName: "Jake Reyes",
    customerEmail: "jake.reyes@email.com",
    packageTitle: "Solo Package",
    studio: "Studio B",
    date: "August 16, 2026",
    time: "4:30 PM",
    addOns: [],
    status: "Pending",
    total: "₱950",
  },
  {
    id: "BK-1003",
    customerName: "Anna Cruz",
    customerEmail: "anna.cruz@email.com",
    packageTitle: "Group Package",
    studio: "Studio A",
    date: "August 18, 2026",
    time: "10:00 AM",
    addOns: ["Digital Copies", "Props Set"],
    status: "Confirmed",
    total: "₱2,500",
  },
  {
    id: "BK-1004",
    customerName: "Liza Dela Cruz",
    customerEmail: "liza.delacruz@email.com",
    packageTitle: "Solo Package",
    studio: "Studio B",
    date: "August 12, 2026",
    time: "1:00 PM",
    addOns: ["Printed Photos"],
    status: "Completed",
    total: "₱1,150",
  },
  {
    id: "BK-1005",
    customerName: "Paolo Garcia",
    customerEmail: "paolo.garcia@email.com",
    packageTitle: "Duo Package",
    studio: "Studio A",
    date: "August 14, 2026",
    time: "5:00 PM",
    addOns: [],
    status: "Cancelled",
    total: "₱1,600",
  },
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-50 text-blue-700 border-blue-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  "No-show": "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled", "No-show"];

export default function BookingsPanel() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
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
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesStudio = studioFilter === "All" || b.studio === studioFilter;
      return matchesSearch && matchesStatus && matchesStudio;
    });
  }, [bookings, searchQuery, statusFilter, studioFilter]);

  const updateStatus = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking?.id === id) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
        <StatCard label="Confirmed" value={stats.confirmed} accent="text-emerald-600" />
        <StatCard label="Completed" value={stats.completed} accent="text-blue-600" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by customer name or booking ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={studioFilter}
            onChange={(e) => setStudioFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="All">All Studios</option>
            <option value="Studio A">Studio A</option>
            <option value="Studio B">Studio B</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
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
          <tbody className="divide-y divide-gray-100">
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(b)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.customerName}</div>
                  <div className="text-xs text-gray-400">{b.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{b.packageTitle}</td>
                <td className="px-4 py-3 text-gray-700">{b.studio}</td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{b.date}</div>
                  <div className="text-xs text-gray-400">{b.time}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 font-medium">{b.total}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {b.status === "Pending" && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => updateStatus(b.id, "Confirmed")}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "Cancelled")}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
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
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
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
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedBooking.customerName}</h3>
                <p className="text-xs text-gray-400">{selectedBooking.id}</p>
              </div>
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[selectedBooking.status]}`}
              >
                {selectedBooking.status}
              </span>
            </div>

            <div className="space-y-2.5 text-sm text-gray-700 mb-6">
              <DetailRow label="Email" value={selectedBooking.customerEmail} />
              <DetailRow label="Package" value={selectedBooking.packageTitle} />
              <DetailRow label="Studio" value={selectedBooking.studio} />
              <DetailRow label="Date" value={selectedBooking.date} />
              <DetailRow label="Time" value={selectedBooking.time} />
              <DetailRow
                label="Add-ons"
                value={selectedBooking.addOns.length ? selectedBooking.addOns.join(", ") : "None"}
              />
              <DetailRow label="Total" value={selectedBooking.total} />
            </div>

            <div className="flex gap-2">
              {selectedBooking.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, "Confirmed")}
                    className="flex-1 rounded-xl bg-black text-white text-sm font-semibold py-2.5 hover:bg-gray-800"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => updateStatus(selectedBooking.id, "Cancelled")}
                    className="flex-1 rounded-xl border border-red-200 text-red-600 text-sm font-semibold py-2.5 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 hover:bg-gray-50"
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

function StatCard({ label, value, accent = "text-gray-900" }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}