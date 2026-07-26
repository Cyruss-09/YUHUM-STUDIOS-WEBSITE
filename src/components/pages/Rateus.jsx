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
    userEmail: "",
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
      userEmail: "",
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

    const sanitizedData = {
      userEmail: formData.userEmail.trim() || null,
      overallRating: Number(formData.overallRating) || 0,
      equipmentEase: Number(formData.equipmentEase) || 0,
      roomPrivacy: Number(formData.roomPrivacy) || 0,
      propsSelection: Number(formData.propsSelection) || 0,
      favoriteBackdrop: formData.favoriteBackdrop || null,
      comments: formData.comments || null,
      recommend: formData.recommend,
    };

    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Server responded with status ${response.status}`
        );
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
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors focus:outline-none font-bold"
            >
              Submit another response <ArrowRight className="w-3 h-3" />
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        userEmail: e.target.value,
                      }))
                    }
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
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
                      className="p-1 focus:outline-none transition-transform active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors duration-150 ${
                          star <= (hoveredRating || formData.overallRating)
                            ? "fill-amber-700 text-amber-700"
                            : "text-stone-200"
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      favoriteBackdrop: e.target.value,
                    }))
                  }
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 focus:outline-none focus:border-stone-900 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%23292524%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat"
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                  placeholder="Tell us what you loved, or what we can tweak to make your experience smoother next time..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors resize-none"
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
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, recommend: true }))
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all focus:outline-none ${
                      formData.recommend === true
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-200 text-stone-700 hover:border-stone-400 bg-stone-50/50"
                    }`}
                  >
                    Yes, absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, recommend: false }))
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl border transition-all focus:outline-none ${
                      formData.recommend === false
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-200 text-stone-700 hover:border-stone-400 bg-stone-50/50"
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
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-colors duration-200 shadow-sm mt-4 focus:outline-none"
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

const MetricRow = ({
  label,
  icon,
  category,
  currentValue,
  onRatingChange,
}) => {
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
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all focus:outline-none ${
              currentValue === val
                ? "bg-stone-900 text-white shadow-sm"
                : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
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