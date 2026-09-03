import React from "react";
import { Star, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col font-sans text-[#2C221E]">
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        {submitted ? (
          <div className="max-w-md w-full text-center space-y-4 py-10">
            <CheckCircle className="w-9 h-9 text-[#A3704C] mx-auto" strokeWidth={1.5} />
            <h2 className="text-2xl font-serif text-[#2C221E]">Thanks for sharing that</h2>
            <p className="text-sm text-[#7A6B63] leading-relaxed">
              Your feedback helps us make each session a little better.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 px-6 py-2.5 bg-[#A3704C] hover:bg-[#8C5A35] text-white rounded-full text-sm font-medium transition-colors"
            >
              Leave another review
            </button>
          </div>
        ) : (
          <div className="max-w-xl w-full">
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-serif text-[#2C221E]">How was your session?</h1>
              <p className="text-sm text-[#7A6B63] mt-1.5">
                A couple of quick questions — takes about a minute.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5">
                  {errorMessage}
                </p>
              )}

              {/* Overall rating */}
              <div className="text-center pb-5 border-b border-[#E8DFD1]">
                <p className="text-sm text-[#5a4a3a] mb-2.5">Overall, how would you rate it?</p>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange("overallRating", star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${star <= (hoveredRating || formData.overallRating)
                          ? "fill-[#A3704C] text-[#A3704C]"
                          : "text-[#E8DFD1]"
                          }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Studio metrics */}
              <div className="space-y-3.5 pb-5 border-b border-[#E8DFD1]">
                <MetricRow
                  label="Remote & lighting ease"
                  category="equipmentEase"
                  currentValue={formData.equipmentEase}
                  onRatingChange={handleRatingChange}
                />
                <MetricRow
                  label="Room privacy & comfort"
                  category="roomPrivacy"
                  currentValue={formData.roomPrivacy}
                  onRatingChange={handleRatingChange}
                />
                <MetricRow
                  label="Props & accessories variety"
                  category="propsSelection"
                  currentValue={formData.propsSelection}
                  onRatingChange={handleRatingChange}
                />
              </div>

              {/* Backdrop + email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#E8DFD1]">
                <div className="space-y-1.5">
                  <label htmlFor="backdrop" className="block text-sm text-[#5a4a3a]">
                    Backdrop used
                  </label>
                  <select
                    id="backdrop"
                    value={formData.favoriteBackdrop}
                    onChange={(e) => updateField("favoriteBackdrop", e.target.value)}
                    className="w-full bg-white border border-[#E8DFD1] rounded-md px-3 py-2 text-sm text-[#2C221E] focus:outline-none focus:border-[#A3704C]"
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

                <div className="space-y-1.5">
                  <label htmlFor="userEmail" className="block text-sm text-[#5a4a3a]">
                    Email <span className="text-[#a89589]">(optional)</span>
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    placeholder="name@example.com"
                    value={formData.userEmail}
                    onChange={(e) => updateField("userEmail", e.target.value)}
                    className="w-full bg-white border border-[#E8DFD1] rounded-md px-3 py-2 text-sm text-[#2C221E] placeholder-[#b3a495] focus:outline-none focus:border-[#A3704C]"
                  />
                </div>
              </div>

              {/* Recommend */}
              <div className="space-y-1.5 pb-5 border-b border-[#E8DFD1]">
                <p className="text-sm text-[#5a4a3a]">Would you recommend us to a friend?</p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateField("recommend", true)}
                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${formData.recommend === true
                      ? "border-[#A3704C] bg-[#A3704C] text-white"
                      : "border-[#E8DFD1] bg-white text-[#5a4a3a] hover:border-[#c9b8a5]"
                      }`}
                  >
                    Yes, absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("recommend", false)}
                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${formData.recommend === false
                      ? "border-[#A3704C] bg-[#A3704C] text-white"
                      : "border-[#E8DFD1] bg-white text-[#5a4a3a] hover:border-[#c9b8a5]"
                      }`}
                  >
                    Maybe next time
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <label htmlFor="comments" className="block text-sm text-[#5a4a3a]">
                  Anything else you'd like to share?
                </label>
                <textarea
                  id="comments"
                  rows={3}
                  value={formData.comments}
                  onChange={(e) => updateField("comments", e.target.value)}
                  placeholder="Tell us what you loved..."
                  className="w-full bg-white border border-[#E8DFD1] rounded-md p-3 text-sm text-[#2C221E] placeholder-[#b3a495] focus:outline-none focus:border-[#A3704C] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A3704C] hover:bg-[#8C5A35] disabled:opacity-50 text-white font-medium py-3 rounded-full text-sm transition-colors"
              >
                {loading ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricRow = ({ label, category, currentValue, onRatingChange }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#5a4a3a]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onRatingChange(category, val)}
            className={`w-7 h-7 text-xs rounded-md border transition-colors ${currentValue === val
              ? "bg-[#A3704C] border-[#A3704C] text-white"
              : "bg-white border-[#E8DFD1] text-[#7A6B63] hover:border-[#c9b8a5]"
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