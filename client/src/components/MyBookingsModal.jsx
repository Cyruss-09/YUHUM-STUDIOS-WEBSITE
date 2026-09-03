import React, { useState, useEffect, useRef } from "react";
import { useMyBookings } from "../hooks/useMyBookings";

/* ─── Status badge colours ───────────────────────────────────── */
const STATUS_STYLES = {
  Pending:   { dot: "bg-amber-400",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  Confirmed: { dot: "bg-emerald-500",text: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200"},
  Completed: { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  Cancelled: { dot: "bg-red-400",    text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
  "No-show": { dot: "bg-stone-400",  text: "text-stone-600",  bg: "bg-stone-100", border: "border-stone-200"  },
};

const CANCELLABLE = ["Pending", "Confirmed"];

/* ─── Helpers ────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ─── Cancel confirmation dialog ────────────────────────────── */
function CancelDialog({ booking, onConfirm, onDismiss, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-100 p-7 text-center space-y-4 animate-[fadeInUp_0.2s_ease]">
        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Cancel Booking?</h3>
          <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
            Are you sure you want to cancel your{" "}
            <span className="font-semibold text-stone-700">{booking.packageTitle}</span> booking
            on <span className="font-semibold text-stone-700">{formatDate(booking.date)}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onDismiss}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : null}
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single booking card ────────────────────────────────────── */
function BookingCard({ booking, onCancelRequest, cancellingId }) {
  const isCancellable = CANCELLABLE.includes(booking.status);
  const isCancelling = cancellingId === booking.id;

  const addOnsList = Array.isArray(booking.addOns) && booking.addOns.length > 0
    ? booking.addOns.join(", ")
    : null;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 text-base leading-snug truncate">
            {booking.packageTitle || "Studio Session"}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">{booking.studio || "—"}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Date</p>
          <p className="text-stone-700 font-medium">
            {booking.dayOfWeek ? `${booking.dayOfWeek}, ` : ""}{formatDate(booking.date)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Time</p>
          <p className="text-stone-700 font-medium">{booking.time || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Package</p>
          <p className="text-stone-700 font-medium">{booking.total || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Payment</p>
          <p className="text-stone-700 font-medium capitalize">{booking.paymentMode || "—"}</p>
        </div>
        {addOnsList && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Add-ons</p>
            <p className="text-stone-700">{addOnsList}</p>
          </div>
        )}
        {booking.couponCode && (
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Promo</p>
            <p className="text-[#A3704C] font-semibold">{booking.couponCode}</p>
          </div>
        )}
      </div>

      {/* Cancel button */}
      {isCancellable && (
        <div className="pt-1 border-t border-stone-100">
          <button
            onClick={() => onCancelRequest(booking)}
            disabled={isCancelling}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                Cancelling…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Booking
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton loader ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-40 bg-stone-200 rounded" />
        <div className="h-6 w-20 bg-stone-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 bg-stone-100 rounded" />
        <div className="h-3 bg-stone-100 rounded" />
        <div className="h-3 bg-stone-100 rounded" />
        <div className="h-3 bg-stone-100 rounded" />
      </div>
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────────── */
export function MyBookingsModal({ isOpen, onClose }) {
  const { bookings, loading, error, cancellingId, cancelBooking } = useMyBookings();
  const [confirmTarget, setConfirmTarget] = useState(null); // booking object to confirm cancel
  const [cancelError, setCancelError] = useState(null);
  const panelRef = useRef(null);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !confirmTarget) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, confirmTarget]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCancelConfirm = async () => {
    if (!confirmTarget) return;
    setCancelError(null);
    try {
      await cancelBooking(confirmTarget.id);
      setConfirmTarget(null);
    } catch (err) {
      setCancelError(err.message);
      setConfirmTarget(null);
    }
  };

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .my-bookings-panel { animation: slideInRight 0.3s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side panel */}
      {isOpen && (
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="My Bookings"
          className="my-bookings-panel fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DFD1] bg-white/80 backdrop-blur-md sticky top-0">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C221E] tracking-wide">My Bookings</h2>
              <p className="text-xs text-[#7A6B63] mt-0.5">Your session history</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error toast */}
          {cancelError && (
            <div className="mx-5 mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{cancelError}</span>
              <button onClick={() => setCancelError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-stone-500">Could not load bookings. Please try again.</p>
              </div>
            ) : bookings.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#A3704C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-serif font-semibold text-stone-800 text-lg">No bookings yet</p>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    When you book a studio session, it will appear here.
                  </p>
                </div>
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancelRequest={setConfirmTarget}
                  cancellingId={cancellingId}
                />
              ))
            )}
          </div>

          {/* Footer note */}
          {!loading && bookings.length > 0 && (
            <div className="px-5 py-4 border-t border-[#E8DFD1] bg-white/60 backdrop-blur-sm">
              <p className="text-xs text-stone-400 text-center leading-relaxed">
                Only <span className="font-semibold text-amber-600">Pending</span> and{" "}
                <span className="font-semibold text-emerald-600">Confirmed</span> bookings can be cancelled.
                For other concerns, contact us directly.
              </p>
            </div>
          )}
        </aside>
      )}

      {/* Cancel confirmation dialog (rendered on top of panel) */}
      {confirmTarget && (
        <CancelDialog
          booking={confirmTarget}
          onConfirm={handleCancelConfirm}
          onDismiss={() => setConfirmTarget(null)}
          loading={cancellingId === confirmTarget.id}
        />
      )}
    </>
  );
}

export default MyBookingsModal;
