import { ImageOff } from "lucide-react";
import { notFoundContent } from "../../data/notFoundContent.js";

const NotFound = ({ setActiveLink }) => {
  const { code, heading, message, buttonLabel } = notFoundContent;

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-sans text-gray-600 px-6 select-none relative overflow-hidden">
      {/* Soft ambient background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-stone-200/40 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative">
        {/* Illustrated Icon Frame */}
        <div className="flex justify-center">
          <div
            className="relative w-28 h-28 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <div className="absolute inset-0 rounded-full border border-amber-800/10" />
            <ImageOff
              className="w-11 h-11 text-stone-400"
              strokeWidth={1.25}
            />
            {/* Little "torn corner" accent */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-50 border border-stone-200 flex items-center justify-center">
              <span className="text-[10px] font-serif italic text-amber-800">?</span>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-3">
          <p
            className="text-7xl text-stone-800 tracking-widest font-serif italic leading-none"
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

        {/* Home Redirect Trigger */}
        <div className="pt-2">
          <button
            onClick={() => setActiveLink("home")}
            className="inline-block bg-[#1a1919] hover:bg-black active:scale-95 text-white font-sans text-sm font-normal tracking-wide px-8 py-4 rounded-full transition-all duration-200 shadow-sm lowercase"
          >
            {buttonLabel}
          </button>
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