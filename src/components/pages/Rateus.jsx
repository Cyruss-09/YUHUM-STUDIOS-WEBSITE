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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col antialiased text-amber-950 font-sans">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        {submitted ? (
          /* Success / Thank You Card */
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-amber-100 p-8 text-center space-y-4 transform transition-all duration-500 scale-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-900 mb-2">
              <CheckCircle className="w-8 h-8 text-amber-800" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-light tracking-tight text-amber-900">
              Thank You for Shuttering!
            </h2>
            <p className="text-amber-900/90 text-sm leading-relaxed font-light">
              Your feedback helps us perfect the lighting, props, and privacy for
              your next session. We appreciate you taking the time to share.
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
                Tell us about your time behind the remote. Your insight shapes our
                studio environment.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
                    setFormData((prev) => ({ ...prev, comments: e.target.value }))
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
                className="w-full bg-[#2D1B18] hover:bg-[#3E2723] text-amber-50 font-light py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider transition-colors duration-200 shadow-sm mt-4 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}
      </main>

      {/* --- BRANDED MINIMALIST FOOTER --- */}
      <footer className="w-full bg-amber-950 border-t border-amber-900/40 py-12 px-6 md:px-12 text-stone-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand details */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
              Yuhum.Studios
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Crafting premium experiences with meticulous attention to detail
              and timeless aesthetics.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/yuhum.studios/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/yuhum.studiosph"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@yuhumstudios"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.95 1.2 2.27 2.05 3.75 2.4v3.91c-1.63-.04-3.23-.55-4.63-1.38-.41-.25-.8-.54-1.15-.87v7.24c0 1.2-.23 2.39-.7 3.5-1.07 2.53-3.44 4.31-6.18 4.61-3.15.34-6.32-1.21-7.72-4.08C.1 17.06-.23 14 1.01 11.23c1.07-2.38 3.33-4.08 5.92-4.43 1.15-.15 2.33-.06 3.45.24v4c-.81-.29-1.69-.36-2.54-.2-1.32.25-2.52 1.07-3.17 2.24-.77 1.38-.85 3.09-.23 4.54.62 1.45 1.96 2.53 3.52 2.76 1.48.22 3.03-.26 3.99-1.39.75-.89.98-2.09.98-3.24V.02z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Journal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Appointments */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Appointments
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Mon — Fri: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 5:00 PM</li>
              <li>Sunday: Closed</li>
              <li className="pt-2">
                <a
                  href="#book"
                  className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-400/50 transition-colors"
                >
                  Book Online &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Sign-up */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Stay Connected
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-amber-900/30 text-stone-200 border border-amber-800/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
              />
              <button
                type="submit"
                className="bg-white hover:bg-stone-100 text-amber-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="max-w-7xl mx-auto border-t border-amber-900/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Yuhum.Studios. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
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