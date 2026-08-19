import React, { useState } from "react";
import {
  Star,
  Camera,
  Shield,
  Wand2,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Sparkles,
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

  // State to track which sections are open (all open by default for scanning)
  const [activeSection, setActiveSection] = useState("all");

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col antialiased text-stone-700 font-sans">
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        {submitted ? (
          <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-stone-200/60 p-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 text-amber-800 shadow-inner">
              <CheckCircle className="w-10 h-10 text-amber-700" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full">
                Feedback Received
              </span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                Thank You for Shuttering!
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Your voice helps us design a warmer, more private, and seamless self-photo experience.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-4 px-6 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs uppercase tracking-widest font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 group"
            >
              Submit another review
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/70 overflow-hidden">

            {/* Immersive Banner Header */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 px-8 py-10 text-stone-50 relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-15px] text-stone-800 opacity-30 pointer-events-none">
                <Camera className="w-44 h-44" strokeWidth={1} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
                  Studio Feedback
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
                How was your session?
              </h1>
              <p className="text-stone-400 text-xs font-light mt-2 max-w-md leading-relaxed">
                Every detail counts—from lighting precision to shutter response time. Tell us how we did today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-medium animate-shake">
                  {errorMessage}
                </div>
              )}

              {/* SECTION 1: Overall Experience */}
              <div className="bg-stone-50/70 border border-stone-200/60 rounded-2xl p-6 space-y-4 transition-all hover:border-stone-300">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">1</span>
                    Overall Experience
                  </label>
                  <span className="text-xs text-amber-800 font-semibold">
                    {formData.overallRating ? `${formData.overallRating}/5 Stars` : "Required"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange("overallRating", star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-2 rounded-2xl bg-white border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-700/40 transition-all duration-200 hover:scale-110 hover:border-amber-600 active:scale-95"
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-150 ${star <= (hoveredRating || formData.overallRating)
                            ? "fill-amber-600 text-amber-600 drop-shadow"
                            : "text-stone-300"
                          }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Studio Metrics (Card Rows) */}
              <div className="bg-stone-50/70 border border-stone-200/60 rounded-2xl p-6 space-y-5 transition-all hover:border-stone-300">
                <label className="text-xs uppercase tracking-wider font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">2</span>
                  Studio Performance
                </label>

                <div className="space-y-4">
                  <MetricCard
                    label="Remote & lighting ease"
                    icon={<Camera className="w-4 h-4 text-amber-800" />}
                    category="equipmentEase"
                    currentValue={formData.equipmentEase}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricCard
                    label="Room privacy & comfort"
                    icon={<Shield className="w-4 h-4 text-amber-800" />}
                    category="roomPrivacy"
                    currentValue={formData.roomPrivacy}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricCard
                    label="Props & accessories variety"
                    icon={<Wand2 className="w-4 h-4 text-amber-800" />}
                    category="propsSelection"
                    currentValue={formData.propsSelection}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              </div>

              {/* SECTION 3: Backdrop & Email Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Backdrop Select */}
                <div className="bg-stone-50/70 border border-stone-200/60 rounded-2xl p-5 space-y-2">
                  <label htmlFor="backdrop" className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                    Backdrop Used
                  </label>
                  <select
                    id="backdrop"
                    value={formData.favoriteBackdrop}
                    onChange={(e) => updateField("favoriteBackdrop", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:border-stone-900 transition-all"
                  >
                    <option value="" disabled>Select backdrop</option>
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

                {/* Email Input */}
                <div className="bg-stone-50/70 border border-stone-200/60 rounded-2xl p-5 space-y-2">
                  <label htmlFor="userEmail" className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                    Email <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    placeholder="name@example.com"
                    value={formData.userEmail}
                    onChange={(e) => updateField("userEmail", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-all"
                  />
                </div>
              </div>

              {/* SECTION 4: Recommendation & Comments */}
              <div className="bg-stone-50/70 border border-stone-200/60 rounded-2xl p-6 space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                    Would you recommend us to a friend?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateField("recommend", true)}
                      className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all duration-200 ${formData.recommend === true
                          ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                        }`}
                    >
                      Yes, absolutely
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("recommend", false)}
                      className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all duration-200 ${formData.recommend === false
                          ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                        }`}
                    >
                      Maybe next time
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="comments" className="block text-xs uppercase tracking-wider font-bold text-stone-900">
                    Special shoutouts or thoughts?
                  </label>
                  <textarea
                    id="comments"
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => updateField("comments", e.target.value)}
                    placeholder="Tell us what you loved..."
                    className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 hover:shadow-lg active:scale-[0.98] disabled:bg-stone-300 text-white font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? "Submitting Review..." : "Complete & Submit Review"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricCard = ({ label, icon, category, currentValue, onRatingChange }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-amber-50 rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex gap-1 justify-end">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onRatingChange(category, val)}
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-700/40 active:scale-90 ${currentValue === val
                ? "bg-stone-900 text-white shadow-sm scale-105"
                : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
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