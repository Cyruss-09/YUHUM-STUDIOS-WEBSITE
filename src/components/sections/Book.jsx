import { useState, useEffect } from "react";
import Pic25 from "../../assets/Pic25.jpg";

// 1. Accept setActiveLink as a prop from App.jsx
export const Book = ({ setActiveLink }) => {
  // Starts collapsed by default on initial mount
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. Handle refresh behavior explicitly to sync cleanly with App.jsx
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) {
        setActiveLink("home");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [setActiveLink]);

  // Color Swatch Data
  const studioAColors = [
    { name: "Wheat", bg: "bg-[#F5DEB3]", text: "text-[#5c4a3c]" },
    { name: "Scarlet red", bg: "bg-[#ED2100]", text: "text-white" },
    { name: "Marine blue", bg: "bg-[#01386A]", text: "text-white" },
  ];

  const studioBColors = [
    {
      name: "White",
      bg: "bg-white",
      text: "text-[#5c5c5c]",
      border: "border border-gray-200",
    },
    { name: "Blush pink", bg: "bg-[#F4C2C2]", text: "text-[#4a4540]" },
    { name: "Amber brown", bg: "bg-[#A6674C]", text: "text-white" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] p-4 md:p-16 flex flex-col gap-16 font-sans text-gray-600 select-none">
      {/* ================= SECTION 1: STUDIO BACKDROP GUIDE ================= */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 pt-12">
        {/* Left Callout Text */}
        <div className="w-full md:w-1/4 text-center md:text-left tracking-[0.2em] text-xs uppercase leading-relaxed text-gray-900 font-light">
          Let's take things to the next level, shall we?
        </div>

        {/* Right Side: Title and Color Swatches */}
        <div className="w-full md:w-3/4 flex flex-col items-center md:items-end">
          {/* Handwritten Title */}
          <h2
            className="text-3xl md:text-4xl text-gray-800 mb-10 md:mr-24 italic lowercase font-serif"
            style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
          >
            a quick studio backdrop guide
          </h2>

          {/* Swatches Container */}
          <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-4">
            {/* Studio A Group */}
            <div className="flex flex-col items-center">
              <div className="flex gap-4">
                {studioAColors.map((color, index) => (
                  <div
                    key={index}
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center p-4 text-center text-sm font-light tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}
                  >
                    {color.name}
                  </div>
                ))}
              </div>
              <span className="mt-4 font-bold text-sm tracking-wider text-black underline">
                Studio A
              </span>
            </div>

            {/* Studio B Group */}
            <div className="flex flex-col items-center">
              <div className="flex gap-4">
                {studioBColors.map((color, index) => (
                  <div
                    key={index}
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center p-4 text-center text-sm font-light tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}
                  >
                    {color.name}
                  </div>
                ))}
              </div>
              <span className="mt-4 font-bold text-sm tracking-wider text-black underline">
                Studio B
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= APPOINMENT SELECTION ================= */}
      <div className="w-full max-w-2xl mx-auto text-[#1a1a1a] px-4 md:px-0">
        {/* Header Label */}
        <div className="flex items-center justify-center gap-2 mb-8 font-medium text-lg">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span>Select Appointment</span>
        </div>

        {/* Category Section Title */}
        <h2 className="text-xl font-bold mb-4 tracking-wide">Groups</h2>

        {/* Package Card Layout */}
        <div className="w-full bg-[#F2F2F2] rounded-xl flex flex-col md:flex-row items-stretch overflow-hidden">
          {/* Left Side: FIXED SIZE Image Column */}
          <div className="w-full md:w-[220px] min-h-[250px] md:min-h-full shrink-0 relative">
            <img
              src={Pic25}
              alt="Couple Photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right Side: Content details */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Top Row: Title + Price left, Book Button right */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-black">
                    Kadlaw for everyone (lite)
                  </h3>
                  <span className="text-base text-neutral-800 block mt-0.5">
                    ₱649.00
                  </span>
                </div>

                <button className="px-6 py-2.5 bg-[#e2e2e2] hover:bg-[#d5d5d5] rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-colors duration-150 shrink-0">
                  Book
                </button>
              </div>

              {/* General Paragraph Description */}
              <p className="font-normal text-black text-[15px] leading-relaxed mb-4">
                A timeless studio session portraits with elegant printed
                keepsakes. Package Inclusions: • Good for 2 people • 1-hour
                appointment duration, 15-minute unlimited studio shoot • Can be
                a mix of headshots ...
              </p>

              {/* Expandable Content Body */}
              {isExpanded && (
                <div className="mt-4 text-neutral-900 text-[15px] leading-relaxed space-y-5 border-t border-neutral-200 pt-4">
                  {/* Inclusions Unordered List */}
                  <div className="text-black font-normal">
                    <span className="block mb-1 font-semibold">
                      Package Inclusions:
                    </span>
                    <ul className="list-none space-y-1">
                      <li>• Good for up to 4 persons</li>
                      <li>• For 2 pax</li>
                      <li>• 15 minute self-shoot</li>
                      <li>• 1 colored backdrop of choice</li>
                      <li>• 2 4R Prints and 2 Photo Grids Strips</li>
                      <li>• Soft copies of Select Photos (5)</li>
                      <li>• Studio backdrop options:</li>
                      <li className="pl-3 text-neutral-800">
                        Studio A – Wheat, Scarlet Red, Marine Blue
                      </li>
                      <li className="pl-3 text-neutral-800">
                        Studio B – White, Blush Pink, Amber Brown
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Boxed Toggle Button at the bottom */}
            <div className="mt-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-5 py-2 border-2 border-black text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;