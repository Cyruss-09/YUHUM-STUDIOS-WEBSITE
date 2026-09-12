import React, { useState, useEffect, useRef, useMemo } from "react";
import { useMyBookings } from "../hooks/useMyBookings";

/* ─── Status badge colours ───────────────────────────────────── */
const STATUS_STYLES = {
  Pending: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  Confirmed: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Completed: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  Cancelled: { dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  "No-show": { dot: "bg-stone-400", text: "text-stone-600", bg: "bg-stone-100", border: "border-stone-200" },
};

const CANCELLABLE = ["Pending", "Confirmed"];

const CANCELLATION_REASONS = [
  "Schedule Conflict",
  "Change of Plans",
  "Booked Wrong Date/Time",
  "Other / Personal Reason",
];

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

/* ─── Eye / EyeOff icon (shared by password fields) ───────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

/* ─── Cancel confirmation dialog ────────────────────────────── */
function CancelDialog({ booking, onConfirm, onDismiss, loading }) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-100 p-6 text-center space-y-4 animate-[fadeInUp_0.2s_ease]">
        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Cancel Booking?</h3>
          <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
            Are you sure you want to cancel your{" "}
            <span className="font-semibold text-stone-700">{booking.packageTitle}</span> session
            on <span className="font-semibold text-stone-700">{formatDate(booking.date)}</span>?
          </p>
        </div>

        {/* Reason Selector */}
        <div className="text-left space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
            Reason for cancellation
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={loading}
            className="w-full text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A3704C]/20 focus:border-[#A3704C]"
          >
            {CANCELLATION_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Email notification hint */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2 text-left">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-[11px] text-amber-800 leading-tight">
            A cancellation confirmation email will be sent to your registered address upon cancelling.
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
            onClick={() => onConfirm(selectedReason)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
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

/* ─── Change password dialog ─────────────────────────────────── */
function ChangePasswordDialog({ onSubmit, onDismiss, loading, serverError }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setValidationError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setValidationError("New password must be different from your current password.");
      return;
    }

    onSubmit(currentPassword, newPassword);
  };

  const displayedError = validationError || serverError;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-100 p-6 space-y-4 animate-[fadeInUp_0.2s_ease]">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#A3704C]/10 flex items-center justify-center mb-1">
            <svg className="w-7 h-7 text-[#A3704C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Change Password</h3>
          <p className="mt-1 text-xs text-stone-500">Update the password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#A3704C]/20 focus:border-[#A3704C]"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#A3704C]/20 focus:border-[#A3704C]"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
            <p className="text-[10px] text-stone-400">Minimum 8 characters.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
              Confirm New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A3704C]/20 focus:border-[#A3704C]"
            />
          </div>

          {displayedError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-600">
              {displayedError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onDismiss}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A3704C] hover:bg-[#8C5A35] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Single booking card ────────────────────────────────────── */
function BookingCard({ booking, onCancelRequest, cancellingId, onBookAgain }) {
  const isCancellable = CANCELLABLE.includes(booking.status);
  const isCancelled = booking.status === "Cancelled";
  const isCancelling = cancellingId === booking.id;

  const addOnsList = Array.isArray(booking.addOns) && booking.addOns.length > 0
    ? booking.addOns.join(", ")
    : null;

  return (
    <div className={`border rounded-2xl p-5 space-y-4 transition-all ${isCancelled
      ? "bg-[#FCFAFA] border-red-100/80 opacity-90"
      : "bg-white border-stone-200 shadow-sm hover:shadow-md"
      }`}>
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
          <p className={`font-medium ${isCancelled ? "text-stone-500 line-through decoration-stone-300" : "text-stone-700"}`}>
            {booking.dayOfWeek ? `${booking.dayOfWeek}, ` : ""}{formatDate(booking.date)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-0.5">Time</p>
          <p className={`font-medium ${isCancelled ? "text-stone-500 line-through decoration-stone-300" : "text-stone-700"}`}>
            {booking.time || "—"}
          </p>
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

      {/* Cancel button for active bookings */}
      {isCancellable && (
        <div className="pt-1 border-t border-stone-100">
          <button
            onClick={() => onCancelRequest(booking)}
            disabled={isCancelling}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 bg-rose-50/80 hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
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

      {/* Cancelled Booking Bottom Banner & Action */}
      {isCancelled && (
        <div className="pt-3 border-t border-red-100 flex items-center justify-between text-xs">
          <span className="text-stone-500 flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Slot released • Cancelled
          </span>
          <button
            onClick={() => onBookAgain(booking)}
            className="font-semibold text-[#A3704C] hover:text-[#8C5A35] transition-colors inline-flex items-center gap-1"
          >
            Book Again →
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
  const { bookings, loading, error, cancellingId, cancelBooking, refetch } = useMyBookings();
  const [confirmTarget, setConfirmTarget] = useState(null); // booking object to confirm cancel
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [selectedTab, setSelectedTab] = useState("All"); // All | Active | Cancelled | Completed
  const panelRef = useRef(null);

  // ── Change password state ──
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Refetch fresh booking data every time the panel is opened
  useEffect(() => {
    if (isOpen) {
      refetch();
      setCancelError(null);
      setCancelSuccess(null);
    }
  }, [isOpen, refetch]);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !confirmTarget && !showPasswordDialog) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, confirmTarget, showPasswordDialog]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Auto-dismiss success message after 7 seconds
  useEffect(() => {
    if (!cancelSuccess) return;
    const timer = setTimeout(() => {
      setCancelSuccess(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [cancelSuccess]);

  // Auto-dismiss password success message after 7 seconds
  useEffect(() => {
    if (!passwordSuccess) return;
    const timer = setTimeout(() => {
      setPasswordSuccess(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [passwordSuccess]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const active = bookings.filter((b) => CANCELLABLE.includes(b.status)).length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const completed = bookings.filter((b) => ["Completed", "No-show"].includes(b.status)).length;
    return {
      All: bookings.length,
      Active: active,
      Cancelled: cancelled,
      Completed: completed,
    };
  }, [bookings]);

  // Filtered bookings based on selected tab
  const filteredBookings = useMemo(() => {
    if (selectedTab === "Active") {
      return bookings.filter((b) => CANCELLABLE.includes(b.status));
    }
    if (selectedTab === "Cancelled") {
      return bookings.filter((b) => b.status === "Cancelled");
    }
    if (selectedTab === "Completed") {
      return bookings.filter((b) => ["Completed", "No-show"].includes(b.status));
    }
    return bookings;
  }, [bookings, selectedTab]);

  const handleCancelConfirm = async (reason) => {
    if (!confirmTarget) return;
    setCancelError(null);
    try {
      const result = await cancelBooking(confirmTarget.id, reason);
      setConfirmTarget(null);
      setCancelSuccess(
        result?.message ||
        "Booking successfully cancelled. A confirmation email has been sent to your email address."
      );
    } catch (err) {
      setCancelError(err.message || "Failed to cancel booking.");
      setConfirmTarget(null);
    }
  };

  // ── Change password submit handler ──
  // Matches the pattern used by services/bookingApi.js: reads the JWT from
  // localStorage under "yuhum_token" and calls the API via VITE_API_BASE.
  const handleChangePassword = async (currentPassword, newPassword) => {
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";
      const token = localStorage.getItem("yuhum_token");
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password. Please try again.");
      }

      setShowPasswordDialog(false);
      setPasswordSuccess(
        data?.message || "Your password has been updated successfully."
      );
    } catch (err) {
      setPasswordError(err.message || "Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const navigateToBooking = () => {
    onClose();
    window.history.pushState({}, "", "/book");
    window.dispatchEvent(new PopStateEvent("popstate"));
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
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
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
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8DFD1] bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C221E] tracking-wide">My Bookings</h2>
              <p className="text-xs text-[#7A6B63] mt-0.5">Your sessions and booking status</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPasswordError(null);
                  setShowPasswordDialog(true);
                }}
                aria-label="Change Password"
                title="Change Password"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
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
          </div>

          {/* Filter Tabs */}
          <div className="px-5 pt-3 pb-2 bg-white/70 border-b border-stone-200/60 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["All", "Active", "Cancelled", "Completed"].map((tab) => {
                const isCurrent = selectedTab === tab;
                const count = tabCounts[tab] || 0;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${isCurrent
                      ? "bg-[#A3704C] text-white shadow-xs font-semibold"
                      : "bg-stone-100/90 hover:bg-stone-200/80 text-stone-600"
                      }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isCurrent
                        ? "bg-white/25 text-white"
                        : "bg-stone-200 text-stone-600"
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success toast / notification */}
          {cancelSuccess && (
            <div className="mx-5 mt-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl shadow-xs animate-[fadeInUp_0.2s_ease]">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">Cancellation Confirmed</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">{cancelSuccess}</p>
              </div>
              <button
                onClick={() => setCancelSuccess(null)}
                className="ml-auto text-emerald-400 hover:text-emerald-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Password change success toast */}
          {passwordSuccess && (
            <div className="mx-5 mt-4 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl shadow-xs animate-[fadeInUp_0.2s_ease]">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">Password Updated</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">{passwordSuccess}</p>
              </div>
              <button
                onClick={() => setPasswordSuccess(null)}
                className="ml-auto text-emerald-400 hover:text-emerald-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Error toast */}
          {cancelError && (
            <div className="mx-5 mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl animate-[fadeInUp_0.2s_ease]">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Error</p>
                <p className="text-rose-700 mt-0.5">{cancelError}</p>
              </div>
              <button onClick={() => setCancelError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                <button
                  onClick={refetch}
                  className="px-4 py-2 text-xs font-semibold text-[#A3704C] bg-[#A3704C]/10 rounded-xl hover:bg-[#A3704C]/20 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredBookings.length === 0 ? (
              /* Tab-specific empty states */
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center">
                  {selectedTab === "Cancelled" ? (
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-[#A3704C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-serif font-semibold text-stone-800 text-base">
                    {selectedTab === "Cancelled"
                      ? "No cancelled bookings"
                      : selectedTab === "Active"
                        ? "No active sessions"
                        : selectedTab === "Completed"
                          ? "No past sessions yet"
                          : "No bookings yet"}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-xs">
                    {selectedTab === "Cancelled"
                      ? "You don't have any cancelled bookings. All your scheduled shoots are preserved."
                      : selectedTab === "Active"
                        ? "Ready for a new creative experience? Book your self-shoot studio lounge session."
                        : "When you book a studio session, it will appear here."}
                  </p>
                </div>
                {selectedTab !== "Cancelled" && (
                  <button
                    onClick={navigateToBooking}
                    className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#A3704C] hover:bg-[#8C5A35] transition-colors shadow-sm"
                  >
                    Book a Session
                  </button>
                )}
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancelRequest={setConfirmTarget}
                  cancellingId={cancellingId}
                  onBookAgain={navigateToBooking}
                />
              ))
            )}
          </div>

          {/* Footer note */}
          {!loading && bookings.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E8DFD1] bg-white/70 backdrop-blur-sm">
              <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                Only <span className="font-semibold text-amber-600">Pending</span> and{" "}
                <span className="font-semibold text-emerald-600">Confirmed</span> bookings can be cancelled.
                For special assistance, contact studio support.
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

      {/* Change password dialog (rendered on top of panel) */}
      {showPasswordDialog && (
        <ChangePasswordDialog
          onSubmit={handleChangePassword}
          onDismiss={() => {
            setShowPasswordDialog(false);
            setPasswordError(null);
          }}
          loading={passwordLoading}
          serverError={passwordError}
        />
      )}
    </>
  );
}

export default MyBookingsModal;