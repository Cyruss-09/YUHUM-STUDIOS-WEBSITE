import React from "react";
import {
  Star,
  Camera,
  Shield,
  Wand2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useReviewForm } from "../../hooks/useReviewForm.js";

export const Rateus = () => {
  const {
    submitted,
    hoveredRating,
    setHoveredRating,
    loading,
    errorMessage,
    formData,
    updateField,
    handleRatingChange,
    handleReset,
    handleSubmit,
  } = useReviewForm();

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col antialiased text-stone-700 font-sans">
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        {submitted ? (
          <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-stone-200/80 p-8 text-center space-y-4 transform transition-all duration-500 scale-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-800 mb-2">
              <CheckCircle
                className="w-8 h-8 text-amber-800"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Thank You for Shuttering!
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Your feedback helps us perfect the lighting, props, and privacy
              for your next session. We appreciate you taking the time to share.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 hover:gap-3 active:scale-95 transition-all duration-200 focus:outline-none font-bold group"
            >
              Submit another response
              <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-stone-900 px-8 py-10 text-stone-50 relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] text-stone-800 opacity-40 pointer-events-none">
                <Camera className="w-48 h-48" strokeWidth={1} />
              </div>
              <span className="text-[10px] uppercase tracking-widest bg-stone-800 text-amber-200 px-3 py-1 rounded-full border border-stone-700 font-semibold">
                Session Review
              </span>
              <h1 className="text-3xl font-serif font-bold tracking-tight mt-3 text-white">
                How was your self-photo experience?
              </h1>
              <p className="text-stone-400 text-xs font-light mt-2 max-w-sm leading-relaxed">
                Tell us about your time behind the remote. Your insight shapes
                our studio environment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 animate-[fadeIn_0.2s_ease-in]">
                  {errorMessage}
                </div>
              )}

              {/* Email Input Field */}
              <div className="space-y-2">
                <label
                  htmlFor="userEmail"
                  className="block text-xs uppercase tracking-wider font-bold text-stone-900"
                >
                  Your Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="userEmail"
                    placeholder="name@example.com"
                    value={formData.userEmail}
                    onChange={(e) => updateField("userEmail", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 placeholder-stone-400 hover:border-stone-300 focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all duration-200"
                  />
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 1. Overall Rating */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                  1. Overall Experience
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange("overallRating", star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 transition-transform duration-150 hover:scale-110 active:scale-90"
                    >
                      <Star
                        className={`w-7 h-7 transition-all duration-150 ${
                          star <= (hoveredRating || formData.overallRating)
                            ? "fill-amber-700 text-amber-700 drop-shadow-sm"
                            : "text-stone-200 hover:text-stone-300"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 2. Specific Metrics */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                  2. Studio Details
                </label>

                <div className="space-y-4 bg-stone-50/60 rounded-2xl p-5 border border-stone-100">
                  <MetricRow
                    label="Remote & lighting ease of use"
                    icon={<Camera className="w-4 text-amber-800" />}
                    category="equipmentEase"
                    currentValue={formData.equipmentEase}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricRow
                    label="Room privacy & comfort"
                    icon={<Shield className="w-4 text-amber-800" />}
                    category="roomPrivacy"
                    currentValue={formData.roomPrivacy}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricRow
                    label="Props & accessories variety"
                    icon={<Wand2 className="w-4 text-amber-800" />}
                    category="propsSelection"
                    currentValue={formData.propsSelection}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 3. Dropdown Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="backdrop"
                  className="block text-xs uppercase tracking-wider font-bold text-stone-900"
                >
                  3. Which backdrop did you use?
                </label>
                <select
                  id="backdrop"
                  value={formData.favoriteBackdrop}
                  onChange={(e) => updateField("favoriteBackdrop", e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 hover:border-stone-300 focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23292524%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat"
                >
                  <option value="" disabled>
                    Select a color backdrop
                  </option>
                  <optgroup label="Studio A">
                    <option value="Wheat">Wheat</option>
                    <option value="Scarlet Red">Scarlet Red</option>
                    <option value="Marine Blue">Marine Blue</option>
                  </optgroup>
                  <optgroup label="Studio B">
                    <option value="White">White</option>
                    <option value="Blush pink">Blush pink</option>
                    <option value="Amber brown">Amber brown</option>
                  </optgroup>
                </select>
              </div>

              {/* 4. Text Comments */}
              <div className="space-y-2">
                <label
                  htmlFor="comments"
                  className="block text-xs uppercase tracking-wider font-bold text-stone-900"
                >
                  4. Additional thoughts or special shoutouts?
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={formData.comments}
                  onChange={(e) => updateField("comments", e.target.value)}
                  placeholder="Tell us what you loved, or what we can tweak to make your experience smoother next time..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 placeholder-stone-400 hover:border-stone-300 focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all duration-200 resize-none"
                />
              </div>

              {/* 5. Recommendation Toggle */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                  5. Would you recommend us to a friend?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateField("recommend", true)}
                    className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all duration-200 focus:outline-none active:scale-[0.97] ${
                      formData.recommend === true
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100 hover:shadow-sm bg-stone-50/50"
                    }`}
                  >
                    Yes, absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("recommend", false)}
                    className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all duration-200 focus:outline-none active:scale-[0.97] ${
                      formData.recommend === false
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100 hover:shadow-sm bg-stone-50/50"
                    }`}
                  >
                    Maybe next time
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 hover:shadow-md active:scale-[0.98] disabled:bg-stone-300 disabled:active:scale-100 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-200 shadow-sm mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/30 focus-visible:ring-offset-2"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricRow = ({ label, icon, category, currentValue, onRatingChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium text-stone-800">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onRatingChange(category, val)}
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 active:scale-90 ${
              currentValue === val
                ? "bg-stone-900 text-white shadow-sm scale-105"
                : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400 hover:bg-stone-50 hover:scale-105"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Rateus;