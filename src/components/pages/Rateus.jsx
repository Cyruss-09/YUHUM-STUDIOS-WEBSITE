import React, { useState } from "react";
import {
  Star,
  Camera,
  Shield,
  Wand2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const Rateus = () => {
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    overallRating: 0,
    equipmentEase: 0,
    roomPrivacy: 0,
    propsSelection: 0,
    favoriteBackdrop: "",
    comments: "",
    recommend: null,
  });

  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({ ...prev, [category]: value }));
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMessage("");
    setFormData({
      overallRating: 0,
      equipmentEase: 0,
      roomPrivacy: 0,
      propsSelection: 0,
      favoriteBackdrop: "",
      comments: "",
      recommend: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Sanitize data before sending to backend
    const sanitizedData = {
      overallRating: Number(formData.overallRating) || 0,
      equipmentEase: Number(formData.equipmentEase) || 0,
      roomPrivacy: Number(formData.roomPrivacy) || 0,
      propsSelection: Number(formData.propsSelection) || 0,
      favoriteBackdrop: formData.favoriteBackdrop || null, // convert "" to null
      comments: formData.comments || null,
      recommend: formData.recommend, // keeps true, false, or null
    };

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("Something went wrong on the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col antialiased text-amber-950 font-sans">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        {submitted ? (
          /* Success / Thank You Card */
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-amber-100 p-8 text-center space-y-4 transform transition-all duration-500 scale-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-900 mb-2">
              <CheckCircle
                className="w-8 h-8 text-amber-800"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-amber-900">
              Thank You for Shuttering!
            </h2>
            <p className="text-amber-900/90 text-sm leading-relaxed font-light">
              Your feedback helps us perfect the lighting, props, and privacy
              for your next session. We appreciate you taking the time to share.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-600/60 hover:text-amber-950 transition-colors focus:outline-none"
            >
              Submit another response <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* Feedback Form Card */
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            {/* Header Visual - Rich Espresso Brown */}
            <div className="bg-[#3E2723] px-8 py-10 text-amber-50 relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] text-[#2D1B18] opacity-40 pointer-events-none">
                <Camera className="w-48 h-48" strokeWidth={1} />
              </div>
              <span className="text-[10px] uppercase tracking-widest bg-[#2D1B18] text-amber-200 px-2.5 py-1 rounded-full border border-amber-900/30">
                Session Review
              </span>
              <h1 className="text-3xl font-light tracking-tight mt-3 text-amber-50">
                How was your self-photo experience?
              </h1>
              <p className="text-amber-200/60 text-xs font-light mt-2 max-w-sm leading-relaxed">
                Tell us about your time behind the remote. Your insight shapes
                our studio environment.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                  {errorMessage}
                </div>
              )}

              {/* 1. Overall Rating */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-medium text-amber-800/70">
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
                      className="p-1 focus:outline-none transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors duration-150 ${
                          star <= (hoveredRating || formData.overallRating)
                            ? "fill-amber-600 text-amber-600"
                            : "text-amber-200/60"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-amber-100/70" />

              {/* 2. Specific Metrics */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider font-medium text-amber-800/70">
                  2. Studio Details
                </label>

                <div className="space-y-4 bg-amber-50/30 rounded-xl p-4 border border-amber-100/50">
                  <MetricRow
                    label="Remote & lighting ease of use"
                    icon={<Camera className="w-4 text-amber-700/60" />}
                    category="equipmentEase"
                    currentValue={formData.equipmentEase}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricRow
                    label="Room privacy & comfort"
                    icon={<Shield className="w-4 text-amber-700/60" />}
                    category="roomPrivacy"
                    currentValue={formData.roomPrivacy}
                    onRatingChange={handleRatingChange}
                  />
                  <MetricRow
                    label="Props & accessories variety"
                    icon={<Wand2 className="w-4 text-amber-700/60" />}
                    category="propsSelection"
                    currentValue={formData.propsSelection}
                    onRatingChange={handleRatingChange}
                  />
                </div>
              </div>

              <hr className="border-amber-100/70" />

              {/* 3. Dropdown Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="backdrop"
                  className="block text-xs uppercase tracking-wider font-medium text-amber-800/70"
                >
                  3. Which backdrop did you use?
                </label>
                <select
                  id="backdrop"
                  value={formData.favoriteBackdrop}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      favoriteBackdrop: e.target.value,
                    }))
                  }
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2.5 text-sm font-light text-amber-900 focus:outline-none focus:border-amber-700 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23b45309%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
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
                  className="block text-xs uppercase tracking-wider font-medium text-amber-800/70"
                >
                  4. Additional thoughts or special shoutouts?
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                  placeholder="Tell us what you loved, or what we can tweak to make your experience smoother next time..."
                  className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm font-light text-amber-900 placeholder-amber-900/40 focus:outline-none focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] transition-colors resize-none"
                />
              </div>

              {/* 5. Recommendation Toggle */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-medium text-amber-800/70">
                  5. Would you recommend us to a friend?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, recommend: true }))
                    }
                    className={`flex-1 py-2.5 text-sm font-light rounded-xl border transition-all focus:outline-none ${
                      formData.recommend === true
                        ? "border-[#5D4037] bg-[#5D4037] text-white font-normal"
                        : "border-amber-200 text-amber-900 hover:border-amber-400"
                    }`}
                  >
                    Yes, absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, recommend: false }))
                    }
                    className={`flex-1 py-2.5 text-sm font-light rounded-xl border transition-all focus:outline-none ${
                      formData.recommend === false
                        ? "border-[#5D4037] bg-[#5D4037] text-white font-normal"
                        : "border-amber-200 text-amber-900 hover:border-amber-400"
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
                className="w-full bg-[#2D1B18] hover:bg-[#3E2723] disabled:bg-stone-400 text-amber-50 font-light py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider transition-colors duration-200 shadow-sm mt-4 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2"
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

/* --- Sub-component for Studio Details score matrix --- */
const MetricRow = ({ label, icon, category, currentValue, onRatingChange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-light text-amber-900">{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onRatingChange(category, val)}
            className={`w-7 h-7 text-xs rounded transition-all focus:outline-none ${
              currentValue === val
                ? "bg-[#5D4037] text-white font-medium"
                : "bg-white text-amber-900 border border-amber-200 hover:border-amber-400"
            }`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
};
