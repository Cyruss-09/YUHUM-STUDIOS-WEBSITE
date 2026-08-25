// client/src/components/admin/ReviewsPanel.jsx
import { useState, useMemo } from "react";
import { useAdminReviews } from "../../hooks/useAdminReviews";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Download,
  Search,
  MessageSquareQuote,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  CheckCircle2,
  Calendar,
  Mail,
} from "lucide-react";

export default function ReviewsPanel() {
  const { reviews, loading, error, deleteReview } = useAdminReviews();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [recommendFilter, setRecommendFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate high level metrics
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        total: 0,
        avgOverall: 0,
        avgEquipment: 0,
        avgPrivacy: 0,
        avgProps: 0,
        recommendRate: 0,
        fiveStarCount: 0,
        fiveStarPct: 0,
        topBackdrop: "N/A",
      };
    }

    const total = reviews.length;
    const sumOverall = reviews.reduce((acc, r) => acc + (Number(r.overall_rating) || 0), 0);
    const sumEquipment = reviews.reduce((acc, r) => acc + (Number(r.equipment_ease) || 0), 0);
    const sumPrivacy = reviews.reduce((acc, r) => acc + (Number(r.room_privacy) || 0), 0);
    const sumProps = reviews.reduce((acc, r) => acc + (Number(r.props_selection) || 0), 0);

    const recommendCount = reviews.filter((r) => r.recommend === true).length;
    const fiveStarCount = reviews.filter((r) => Number(r.overall_rating) === 5).length;

    // Count backdrop occurrences
    const backdropCounts = {};
    reviews.forEach((r) => {
      if (r.favorite_backdrop) {
        backdropCounts[r.favorite_backdrop] = (backdropCounts[r.favorite_backdrop] || 0) + 1;
      }
    });
    let topBackdrop = "None";
    let topCount = 0;
    Object.entries(backdropCounts).forEach(([name, count]) => {
      if (count > topCount) {
        topCount = count;
        topBackdrop = name;
      }
    });

    return {
      total,
      avgOverall: (sumOverall / total).toFixed(1),
      avgEquipment: (sumEquipment / total).toFixed(1),
      avgPrivacy: (sumPrivacy / total).toFixed(1),
      avgProps: (sumProps / total).toFixed(1),
      recommendRate: Math.round((recommendCount / total) * 100),
      fiveStarCount,
      fiveStarPct: Math.round((fiveStarCount / total) * 100),
      topBackdrop,
    };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (r.user_email && r.user_email.toLowerCase().includes(q)) ||
        (r.comments && r.comments.toLowerCase().includes(q)) ||
        (r.favorite_backdrop && r.favorite_backdrop.toLowerCase().includes(q));

      const matchesRating =
        ratingFilter === "All" || Number(r.overall_rating) === Number(ratingFilter);

      const matchesRecommend =
        recommendFilter === "All" ||
        (recommendFilter === "Yes" && r.recommend === true) ||
        (recommendFilter === "No" && r.recommend === false);

      return matchesSearch && matchesRating && matchesRecommend;
    });
  }, [reviews, searchQuery, ratingFilter, recommendFilter]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    const res = await deleteReview(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (res.success) {
      showToast("Review deleted successfully");
    } else {
      showToast(res.error || "Failed to delete review");
    }
  };

  const exportToCSV = () => {
    if (reviews.length === 0) return;
    const headers = [
      "ID",
      "Date",
      "User Email",
      "Overall Rating",
      "Equipment Ease",
      "Room Privacy",
      "Props Selection",
      "Favorite Backdrop",
      "Recommends",
      "Comments",
    ];

    const rows = reviews.map((r) => [
      r.id,
      r.created_at ? new Date(r.created_at).toISOString() : "",
      `"${(r.user_email || "").replace(/"/g, '""')}"`,
      r.overall_rating,
      r.equipment_ease,
      r.room_privacy,
      r.props_selection,
      `"${(r.favorite_backdrop || "").replace(/"/g, '""')}"`,
      r.recommend ? "Yes" : "No",
      `"${(r.comments || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yuhum_reviews_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Reviews exported to CSV");
  };

  const renderStars = (rating, max = 5, size = 16) => {
    const num = Number(rating) || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, i) => {
          const filled = i < num;
          return (
            <Star
              key={i}
              size={size}
              className={
                filled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 dark:text-gray-600"
              }
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading customer reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        Failed to load reviews: {error}
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
        {/* Average Rating Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Avg Rating
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {stats.avgOverall}
            </span>
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {renderStars(Math.round(Number(stats.avgOverall)), 5, 14)}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({stats.total} total)
            </span>
          </div>
        </div>

        {/* Recommendation Rate Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Recommend Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ThumbsUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {stats.recommendRate}%
            </span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <TrendingUp size={13} />
            Would recommend to friends
          </p>
        </div>

        {/* 5-Star Reviews Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              5-Star Reviews
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {stats.fiveStarCount}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              ({stats.fiveStarPct}%)
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Perfect scores submitted
          </p>
        </div>

        {/* Top Backdrop Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Top Backdrop
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate block">
              {stats.topBackdrop}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Most popular client favorite
          </p>
        </div>
      </div>

      {/* Sub-Category Ratings Breakdown Banner */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-gray-50/50 to-white dark:from-gray-800/40 dark:via-gray-800/20 dark:to-gray-900 p-4 sm:p-5">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Detailed Experience Scores
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 shadow-xs">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Equipment Ease
            </span>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-sm">
              <span className="text-amber-500">★</span>
              {stats.avgEquipment} / 5
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 shadow-xs">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Room Privacy
            </span>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-sm">
              <span className="text-amber-500">★</span>
              {stats.avgPrivacy} / 5
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/60 shadow-xs">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Props Selection
            </span>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100 text-sm">
              <span className="text-amber-500">★</span>
              {stats.avgProps} / 5
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by comments, email, or backdrop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          />
        </div>

        {/* Filters and Export Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Star Filter */}
          <div className="flex items-center gap-1">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Recommend Filter */}
          <select
            value={recommendFilter}
            onChange={(e) => setRecommendFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          >
            <option value="All">All Recommendations</option>
            <option value="Yes">Recommends (Yes)</option>
            <option value="No">Does Not Recommend (No)</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={reviews.length === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 p-5 transition-all hover:shadow-sm"
          >
            {/* Header: User Email / Timestamp & Delete Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                  {r.user_email ? r.user_email[0].toUpperCase() : "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {r.user_email || "Anonymous Reviewer"}
                    </span>
                    {r.recommend !== null && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.recommend
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                        }`}
                      >
                        {r.recommend ? (
                          <>
                            <ThumbsUp size={11} /> Recommends
                          </>
                        ) : (
                          <>
                            <ThumbsDown size={11} /> Not Recommended
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Star Badge & Delete */}
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-700">
                  {renderStars(r.overall_rating, 5, 15)}
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 ml-1">
                    {r.overall_rating}.0
                  </span>
                </div>

                {confirmDeleteId === r.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      {deletingId === r.id ? "Deleting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Comments Quote */}
            {r.comments ? (
              <div className="relative mb-3 pl-3.5 border-l-2 border-amber-400 dark:border-amber-500 bg-gray-50/70 dark:bg-gray-800/60 rounded-r-xl p-3">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic leading-relaxed">
                  "{r.comments}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-3">
                No written comment provided.
              </p>
            )}

            {/* Sub-ratings & Backdrop details */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {r.favorite_backdrop && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-800/60">
                  <Sparkles size={12} />
                  Backdrop: {r.favorite_backdrop}
                </span>
              )}

              {r.equipment_ease !== null && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                  Equipment: <strong className="text-gray-900 dark:text-gray-100">{r.equipment_ease}/5</strong>
                </span>
              )}

              {r.room_privacy !== null && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                  Privacy: <strong className="text-gray-900 dark:text-gray-100">{r.room_privacy}/5</strong>
                </span>
              )}

              {r.props_selection !== null && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                  Props: <strong className="text-gray-900 dark:text-gray-100">{r.props_selection}/5</strong>
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3">
              <MessageSquareQuote size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              No reviews match your filters
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Try adjusting your search keywords or resetting rating/recommendation filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
