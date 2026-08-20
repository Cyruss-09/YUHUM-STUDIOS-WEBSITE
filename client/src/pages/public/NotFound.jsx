import React, { useState, useEffect } from "react";
import { ImageOff, Home, Compass, ArrowRight, LifeBuoy } from "lucide-react";

const notFoundContent = {
  code: "404",
  heading: "Page not found",
  message: "The page you're looking for doesn't exist or has been moved.",
  buttonLabel: "back to home",
  suggestions: [
    { label: "explore dashboard", path: "dashboard" },
    { label: "contact support", path: "contact" },
  ]
};

const NotFound = ({ setActiveLink }) => {
  const { code, heading, message, buttonLabel, suggestions } = notFoundContent;
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Keyboard shortcut: Press 'Esc' to go back home
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && typeof setActiveLink === "function") {
        setIsRedirecting(true);
        setTimeout(() => setActiveLink("home"), 200);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveLink]);

  const handleHomeClick = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      setActiveLink("home");
    }, 250);
  };

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-sans text-gray-600 px-6 select-none relative overflow-hidden">
      {/* Soft ambient background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-amber-100/50 blur-3xl pointer-events-none transition-all duration-700 hover:bg-amber-200/50" />
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-stone-200/40 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">

        {/* Illustrated Icon Frame with subtle click reactivity */}
        <div className="flex justify-center">
          <div
            className="relative w-28 h-28 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center transition-transform duration-300 hover:scale-105 cursor-pointer group"
            style={{ animation: "float 4s ease-in-out infinite" }}
            title="Lost? Let's get you back"
          >
            <div className="absolute inset-0 rounded-full border border-amber-800/10 transition-colors group-hover:border-amber-800/30" />
            <ImageOff className="w-11 h-11 text-stone-400 transition-colors group-hover:text-amber-800" strokeWidth={1.25} />

            {/* Little "torn corner" accent */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-50 border border-stone-200 flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-serif italic text-amber-800">
                ?
              </span>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-3">
          <p
            className="text-7xl text-stone-800 tracking-widest font-serif italic leading-none transition-transform duration-300 hover:scale-105 cursor-default"
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
          >
            {code}
          </p>

          {/* Separator Accent */}
          <div className="w-12 h-[1px] bg-amber-950/30 mx-auto" />
        </div>

        {/* Informational Text */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">
            {heading}
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-light tracking-wide max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Action & Quick Recovery Suggestions */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleHomeClick}
            disabled={isRedirecting}
            className="inline-flex items-center justify-center gap-2 bg-[#1a1919] hover:bg-black active:scale-95 text-white font-sans text-sm font-normal tracking-wide px-8 py-4 rounded-full transition-all duration-200 shadow-sm lowercase cursor-pointer disabled:opacity-70"
          >
            <Home className="w-4 h-4 opacity-70" />
            {isRedirecting ? "taking you home..." : buttonLabel}
          </button>

          {/* Alternative Quick Paths Tray */}
          {suggestions && suggestions.length > 0 && (
            <div className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-stone-400 w-full mb-1">or try heading to:</span>
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveLink(item.path)}
                  className="text-xs text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-2xs lowercase cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;