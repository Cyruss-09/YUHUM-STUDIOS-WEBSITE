import { useMemo } from "react";
import { useAdminBookings } from "../../hooks/useAdminBookings";
import { useAdminReviews } from "../../hooks/useAdminReviews";
import { useAdminSubscribers } from "../../hooks/useAdminSubscribers";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import {
  CalendarCheck,
  Clock,
  DollarSign,
  Star,
  Users,
  Mail,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Camera,
  CheckCircle2,
  Calendar,
  Layers,
  Megaphone,
  Sliders,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function OverviewPanel({ onNavigateTab, adminUser }) {
  const { bookings, loading: bookingsLoading } = useAdminBookings();
  const { reviews, loading: reviewsLoading } = useAdminReviews();
  const { subscribers, loading: subscribersLoading } = useAdminSubscribers();
  const { users, loading: usersLoading } = useAdminUsers();
  const { settings } = useAdminSettings();

  // Dynamic greeting based on user's current time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Compute Bookings Metrics
  const bookingMetrics = useMemo(() => {
    const total = bookings?.length || 0;
    const pending = bookings?.filter((b) => b.status === "Pending") || [];
    const confirmed = bookings?.filter((b) => b.status === "Confirmed") || [];
    const completed = bookings?.filter((b) => b.status === "Completed") || [];
    const cancelled = bookings?.filter((b) => b.status === "Cancelled") || [];

    // Studio distribution
    const studioACount = bookings?.filter(
      (b) => String(b.studio).toLowerCase().includes("studio a") || b.studio === "Studio A"
    ).length || 0;
    const studioBCount = bookings?.filter(
      (b) => String(b.studio).toLowerCase().includes("studio b") || b.studio === "Studio B"
    ).length || 0;

    // Gross Revenue estimate (from confirmed & completed shoots)
    const revenue = [...confirmed, ...completed].reduce((sum, b) => {
      const price = Number(b.total) || 0;
      return sum + price;
    }, 0);

    return {
      total,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      studioACount,
      studioBCount,
      revenue,
      pendingList: pending,
    };
  }, [bookings]);

  // Compute Reviews Metrics
  const reviewMetrics = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        count: 0,
        averageRating: "5.0",
        recommendRate: 100,
        latestReview: null,
      };
    }
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.overall_rating) || 5), 0);
    const avg = (sum / count).toFixed(1);

    const recommendCount = reviews.filter((r) => r.recommend === true || r.recommend === "true").length;
    const recommendRate = Math.round((recommendCount / count) * 100);

    // Latest review with a comment if available, or just the first one
    const latestReview = reviews.find((r) => r.comments && r.comments.trim().length > 0) || reviews[0];

    return {
      count,
      averageRating: avg,
      recommendRate,
      latestReview,
    };
  }, [reviews]);

  // Upcoming shoots: sorted by date and time
  const upcomingShoots = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    // Prioritize upcoming pending & confirmed sessions
    const active = bookings.filter(
      (b) => b.status === "Confirmed" || b.status === "Pending"
    );
    // Sort chronologically if date strings exist
    const sorted = [...active].sort((a, b) => {
      const dateA = new Date(a.date || "2099-01-01").getTime();
      const dateB = new Date(b.date || "2099-01-01").getTime();
      return dateA - dateB;
    });
    return sorted.slice(0, 5);
  }, [bookings]);

  const subscribersCount = subscribers?.length || 0;
  const usersCount = users?.length || 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {status || "Scheduled"}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Hero Welcome & Operational Status Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white p-6 sm:p-8 shadow-xl border border-gray-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-32 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-gray-200 backdrop-blur-md border border-white/10">
                <Sparkles size={13} className="text-amber-400" />
                Yuhum Studios • Command Center
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {todayFormatted}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {greeting}, {adminUser?.name || adminUser?.username || "Studio Admin"} 👋
            </h2>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Here is what is happening across your studio reservations, client ratings, and audience growth today.
            </p>
          </div>

          {/* Quick Studio Status Pill on Hero */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-center bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Studio Operations
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {settings?.schedule?.openTime || "10:00 AM"} – {settings?.schedule?.closeTime || "06:00 PM"}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("settings", "studio")}
              className="text-xs font-medium text-gray-300 hover:text-white underline underline-offset-4 ml-auto"
            >
              Config
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Action Required Alert (Pending Bookings) ── */}
      {bookingMetrics.pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 shadow-sm transition-all animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                {bookingMetrics.pendingCount} Booking{bookingMetrics.pendingCount > 1 ? "s" : ""} Awaiting Confirmation
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                New clients have reserved slots. Confirm their booking schedule or follow up on payment.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("bookings")}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all active:scale-[0.98] whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            Review Pending
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── 3. High-Impact Studio KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total Bookings */}
        <div
          onClick={() => onNavigateTab("bookings")}
          className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Bookings
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {bookingsLoading ? "…" : bookingMetrics.total}
              </span>
              {bookingMetrics.pendingCount > 0 && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                  {bookingMetrics.pendingCount} pending
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>{bookingMetrics.confirmedCount} confirmed shoots</span>
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-medium">
                View <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Estimated Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Est. Booking Value
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {bookingsLoading ? "…" : formatCurrency(bookingMetrics.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              <TrendingUp size={14} />
              <span>Confirmed & completed shoots</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Client Satisfaction */}
        <div
          onClick={() => onNavigateTab("reviews")}
          className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Client Satisfaction
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Star size={20} className="fill-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {reviewsLoading ? "…" : `${reviewMetrics.averageRating}`}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                / 5.0 ({reviewMetrics.count} reviews)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {reviewMetrics.recommendRate}% recommend
              </span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-medium">
                Read <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Audience & Reach */}
        <div
          onClick={() => onNavigateTab("subscribers")}
          className="cursor-pointer group p-5 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-500/60 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Audience & Growth
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {subscribersLoading ? "…" : subscribersCount}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Subscribers
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>{usersLoading ? "…" : usersCount} Registered Users</span>
              <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-medium">
                Manage <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Rapid Operations Shortcuts Bar ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Sliders size={14} />
            Quick Admin Shortcuts
          </h3>
          <span className="text-xs text-gray-400">1-Click Fast Actions</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab("bookings")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-all text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            <CalendarCheck size={18} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">Manage Bookings</span>
          </button>

          <button
            onClick={() => onNavigateTab("settings", "packages")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-all text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            <Camera size={18} className="text-amber-500 flex-shrink-0" />
            <span className="truncate">Packages & Add-ons</span>
          </button>

          <button
            onClick={() => onNavigateTab("settings", "cms")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-all text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            <Megaphone size={18} className="text-rose-500 flex-shrink-0" />
            <span className="truncate">Announcement Banner</span>
          </button>

          <button
            onClick={() => onNavigateTab("users")}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-all text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            <Users size={18} className="text-purple-500 flex-shrink-0" />
            <span className="truncate">User Accounts</span>
          </button>
        </div>
      </div>

      {/* ── 5. Main Double Column Layout: Upcoming Shoots + Pipeline & Feedback ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left 2 Columns: Upcoming Shoots & Studio Schedule Feed ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                      Upcoming Client Shoots
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Next scheduled photography and self-shoot appointments
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab("bookings")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              {bookingsLoading ? (
                <div className="space-y-3 py-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                    />
                  ))}
                </div>
              ) : upcomingShoots.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Camera size={32} className="mx-auto text-gray-400 mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    No upcoming sessions found
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    When clients book photo sessions, their reservation schedule will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {upcomingShoots.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => onNavigateTab("bookings")}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 px-2 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-sm flex-shrink-0 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                          {booking.customerName ? booking.customerName[0].toUpperCase() : "C"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                              {booking.customerName}
                            </h4>
                            {booking.studio && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {booking.studio}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {booking.packageTitle || "Self-Shoot Package"} • {booking.customerEmail || "No email"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 self-stretch sm:self-center pt-1 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 sm:justify-end">
                            <Clock size={12} className="text-gray-400" />
                            {booking.date || "Scheduled"}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {booking.time || "Pending Time"}
                          </div>
                        </div>
                        <div>{getStatusBadge(booking.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Pipeline Distribution Bar */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                <span>Booking Pipeline Breakdown</span>
                <span>{bookingMetrics.total} Total Records</span>
              </div>
              {bookingMetrics.total > 0 ? (
                <>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex">
                    <div
                      style={{
                        width: `${(bookingMetrics.confirmedCount / bookingMetrics.total) * 100}%`,
                      }}
                      className="bg-emerald-500 h-full"
                      title={`Confirmed: ${bookingMetrics.confirmedCount}`}
                    />
                    <div
                      style={{
                        width: `${(bookingMetrics.pendingCount / bookingMetrics.total) * 100}%`,
                      }}
                      className="bg-amber-400 h-full"
                      title={`Pending: ${bookingMetrics.pendingCount}`}
                    />
                    <div
                      style={{
                        width: `${(bookingMetrics.completedCount / bookingMetrics.total) * 100}%`,
                      }}
                      className="bg-blue-500 h-full"
                      title={`Completed: ${bookingMetrics.completedCount}`}
                    />
                    <div
                      style={{
                        width: `${(bookingMetrics.cancelledCount / bookingMetrics.total) * 100}%`,
                      }}
                      className="bg-red-400 h-full"
                      title={`Cancelled: ${bookingMetrics.cancelledCount}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Confirmed ({bookingMetrics.confirmedCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                      Pending ({bookingMetrics.pendingCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      Completed ({bookingMetrics.completedCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400"></span>
                      Cancelled ({bookingMetrics.cancelledCount})
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">No bookings recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Studio Config Status + Recent Customer Feedback Spotlight ── */}
        <div className="flex flex-col gap-6">

          {/* Studio Operational Status Widget */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    Studio Configuration
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Room status & announcement state
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab("settings", "studio")}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Settings
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Studio A */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Studio Room A</span>
                {settings?.schedule?.studioAActive !== false ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 size={13} /> Active ({bookingMetrics.studioACount} shoots)
                  </span>
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>

              {/* Studio B */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Studio Room B</span>
                {settings?.schedule?.studioBActive !== false ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 size={13} /> Active ({bookingMetrics.studioBCount} shoots)
                  </span>
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </div>

              {/* Announcement Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Public Banner</span>
                {settings?.cms?.bannerEnabled ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Megaphone size={13} /> Live on Site
                  </span>
                ) : (
                  <span className="text-gray-400">Off / Hidden</span>
                )}
              </div>
            </div>
          </div>

          {/* Customer Reviews & Feedback Spotlight */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Star size={18} className="fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                      Client Review Spotlight
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recent testimonial & feedback
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab("reviews")}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  All Reviews
                </button>
              </div>

              {reviewsLoading ? (
                <div className="h-28 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
              ) : reviewMetrics.latestReview ? (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < (Number(reviewMetrics.latestReview.overall_rating) || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                    </div>
                    {reviewMetrics.latestReview.recommend && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed line-clamp-3">
                    &ldquo;{reviewMetrics.latestReview.comments || "Smooth shoot experience and great studio setup!"}&rdquo;
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-amber-200/40 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="truncate max-w-[140px]">
                      {reviewMetrics.latestReview.user_email || "Verified Client"}
                    </span>
                    {reviewMetrics.latestReview.favorite_backdrop && (
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        🎨 {reviewMetrics.latestReview.favorite_backdrop}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400">
                  No customer reviews yet. Client reviews will be spotlighted here once submitted.
                </div>
              )}
            </div>

            {/* Newsletter Subscriber counter bar */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Mail size={14} className="text-purple-500" />
                Newsletter Audience
              </span>
              <button
                onClick={() => onNavigateTab("subscribers")}
                className="font-bold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400"
              >
                {subscribersCount} subscribers →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
