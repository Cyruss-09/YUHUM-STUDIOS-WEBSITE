const NotFound = ({ setActiveLink }) => {
  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-sans text-gray-600 px-6 select-none">
      <div className="max-w-md text-center space-y-6">
        {/* Error Code */}
        <h1 
          className="text-8xl font-light text-stone-800 tracking-widest font-serif italic"
          style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
        >
          404
        </h1>
        
        {/* Separator Accent */}
        <div className="w-12 h-[1px] bg-amber-950/40 mx-auto"></div>

        {/* Informational Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 text-sm">
            Page Not Found
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed font-light tracking-wide max-w-xs mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Home Redirect Trigger */}
        <div className="pt-4">
          <button
            onClick={() => setActiveLink("home")}
            className="inline-block px-8 py-3 border-2 border-black text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 shadow-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;