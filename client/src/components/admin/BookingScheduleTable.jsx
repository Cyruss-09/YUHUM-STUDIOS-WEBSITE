import { useState, useMemo } from "react";

export default function BookingScheduleTable({ bookings, isLoading, error }) {
  const [packageFilter, setPackageFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const packageOptions = useMemo(() => {
    const titles = new Set(bookings.map((b) => b.package_title).filter(Boolean));
    return ["All", ...titles];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (b) => packageFilter === "All" || b.package_title === packageFilter,
    );
  }, [bookings, packageFilter]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Failed to load bookings: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className=" flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Booking Schedule
        </h3>
        <select
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {packageOptions.map((pkg) => (
            <option key={pkg} value={pkg}>
              {pkg}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Customer</th>
              <th className="text-left px-4 py-3 font-semibold">Package</th>
              <th className="text-left px-4 py-3 font-semibold">Studio</th>
              <th className="text-left px-4 py-3 font-semibold">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredBookings.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(b)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {b.firstName || b.lastName
                      ? `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim()
                      : b.email || "—"}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{b.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {b.package_title || "—"}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.studio || "—"}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  <div>{b.booking_date || "—"}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {b.day_of_week ? `${b.day_of_week}, ` : ""}
                    {b.booking_time || ""}
                  </div>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-sm"
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {selectedBooking.firstName || selectedBooking.lastName
                ? `${selectedBooking.firstName ?? ""} ${selectedBooking.lastName ?? ""}`.trim()
                : selectedBooking.email}
            </h3>
            <div className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300 mb-6">
              <DetailRow label="Email" value={selectedBooking.email} />
              <DetailRow
                label="Package"
                value={selectedBooking.package_title}
              />
              <DetailRow label="Studio" value={selectedBooking.studio} />
              <DetailRow label="Date" value={selectedBooking.booking_date} />
              <DetailRow label="Day" value={selectedBooking.day_of_week} />
              <DetailRow label="Time" value={selectedBooking.booking_time} />
              <DetailRow
                label="Base Price"
                value={selectedBooking.base_price}
              />
              <DetailRow
                label="Add-ons"
                value={
                  Array.isArray(selectedBooking.add_ons) &&
                    selectedBooking.add_ons.length
                    ? selectedBooking.add_ons.join(", ")
                    : "None"
                }
              />
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-50 dark:border-gray-700 pb-2">
      <span className="text-gray-400 dark:text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100 text-right">
        {value || "—"}
      </span>
    </div>
  );
}