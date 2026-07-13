import { useEffect, useState } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

// --- SUB-COMPONENT FOR THE INDIVIDUAL PACKAGE CARD ---
const PackageCard = ({
  id,
  title,
  price,
  image,
  description,
  inclusions,
  altText,
  activeBookingId,
  setActiveBookingId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);

  // State for Add-ons checklist
  const [selectedAddons, setSelectedAddons] = useState({});
  // State for Calendar & Time Selection
  const [selectedDate, setSelectedDate] = useState(14); // Default to July 14, 2026 as per screenshot
  const [selectedTime, setSelectedTime] = useState(null);

  const isBookingOpen = activeBookingId === id;

  const handleStudioSelect = (studioName) => {
    setSelectedStudio(studioName);
  };

  const handleAddonChange = (addonKey) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonKey]: !prev[addonKey],
    }));
  };

  const addOns = [
    { key: "Additional Head", label: "+1 adult", price: "₱250.00" },
    { key: "Additional Pet", label: "+1 pet", price: "₱100.00" },
    { key: "Additional 4R Photo Print", label: "+1 4R Print", price: "₱50.00" },
    {
      key: "Addtional 2x Photo Grid Strips",
      label: "+1 2x Photo Grid Strips",
      price: "₱50.00",
    },
    { key: "Raw Photos", label: "All Raw Photos", price: "₱400.00" },
    {
      key: "Hair & Makeup Services",
      label: "Hair & Makeup Service",
      price: "₱2,500.00",
    },
    {
      key: "Studio Rental",
      label: "Rental Studio (Rate is per hour)",
      price: "₱1,000.00",
    },
  ];

  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
  ];

  const daysInJuly = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full flex flex-col mb-6">
      {/* Main Card */}
      <div className="w-full bg-[#F2F2F2] rounded-xl flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Left Side: Image */}
        <div className="w-full md:w-[220px] min-h-[250px] md:min-h-full shrink-0 relative">
          <img
            src={image}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-black">
                  {title}
                </h3>
                <span className="text-base text-neutral-800 block mt-0.5">
                  {price}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveBookingId(isBookingOpen ? null : id);
                  if (isBookingOpen) {
                    setSelectedStudio(null);
                    setSelectedTime(null);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 shrink-0 border ${
                  isBookingOpen
                    ? "bg-black text-white border-black"
                    : "bg-[#e2e2e2] hover:bg-[#d5d5d5] text-black border-transparent"
                }`}
              >
                {isBookingOpen ? "Close" : "Book"}
              </button>
            </div>

            <p className="font-normal text-black text-[15px] leading-relaxed mb-4">
              {description}
            </p>

            {isExpanded && (
              <div className="mt-4 text-neutral-900 text-[15px] leading-relaxed space-y-5 border-t border-neutral-200 pt-4">
                <div className="text-black font-normal">
                  <span className="block mb-1 font-semibold">
                    Package Inclusions:
                  </span>
                  <ul className="list-none space-y-1">
                    {inclusions.map((item, idx) => (
                      <li
                        key={idx}
                        className={item.indent ? "pl-3 text-neutral-800" : ""}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

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

      {/* --- STUDIO SELECTION PANEL --- */}
      {isBookingOpen && (
        <div className="w-full mt-4 flex flex-col gap-6 animate-fadeIn">
          {/* Base Studio Box */}
          <div className="w-full bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
              <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">
                With
              </span>
            </div>

            <div className="flex flex-col divide-y divide-neutral-100">
              {/* Studio A */}
              <div className="flex items-center justify-between p-5 hover:bg-neutral-50/50 transition-colors">
                <span className="font-bold text-base text-black lowercase">
                  studio a
                </span>
                <button
                  onClick={() => handleStudioSelect("Studio A")}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                    selectedStudio === "Studio A"
                      ? "bg-black text-white"
                      : "bg-[#e2e2e2] text-black hover:bg-[#d5d5d5]"
                  }`}
                >
                  {selectedStudio === "Studio A" ? "Selected" : "Select"}
                </button>
              </div>

              {/* Studio B */}
              <div className="flex items-center justify-between p-5 hover:bg-neutral-50/50 transition-colors">
                <span className="font-bold text-base text-black lowercase">
                  studio b
                </span>
                <button
                  onClick={() => handleStudioSelect("Studio B")}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${
                    selectedStudio === "Studio B"
                      ? "bg-black text-white"
                      : "bg-[#e2e2e2] text-black hover:bg-[#d5d5d5]"
                  }`}
                >
                  {selectedStudio === "Studio B" ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>

          {/* --- NESTED ADD-ONS AND SCHEDULER SECTION (Appears only after selecting a studio) --- */}
          {selectedStudio && (
            <div className="w-full flex flex-col gap-6 animate-fadeIn">
              {/* 1. ADD TO APPOINTMENT BLOCK */}
              <div className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-xl p-6 md:p-8">
                <h3 className="text-xs font-bold tracking-widest text-gray-900 uppercase mb-6">
                  Add to Appointment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                  {addOns.map((addon) => (
                    <label
                      key={addon.key}
                      className="flex items-start gap-3 cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedAddons[addon.key]}
                        onChange={() => handleAddonChange(addon.key)}
                        className="w-4 h-4 mt-1 accent-black rounded border-gray-300 focus:ring-0"
                      />
                      <div className="text-sm">
                        <span className="block font-medium text-neutral-800 group-hover:text-black">
                          {addon.label}
                        </span>
                        <span className="text-xs text-neutral-500 font-medium">
                          {addon.price === "Free" ? "Free" : `+ ${addon.price}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. CALENDAR & TIME SLOTS WRAPPER CONTAINER */}
              <div className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row gap-12">
                {/* Left Side: Custom Minimalist Calendar */}
                <div className="w-full lg:w-5/12">
                  <div className="flex items-center justify-between mb-8">
                    <button className="text-neutral-500 hover:text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold text-neutral-800 tracking-wide">
                      July 2026
                    </span>
                    <button className="text-neutral-500 hover:text-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Day Initials */}
                  <div className="grid grid-cols-7 gap-y-4 text-center text-xs font-bold text-neutral-900 mb-4">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>

                  {/* Days Matrix Grid */}
                  <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
                    {/* Empty paddings to make Day 1 start correctly on Wednesday for July 2026 */}
                    <span className="text-transparent"></span>
                    <span className="text-transparent"></span>

                    {daysInJuly.map((day) => {
                      const isPast = day < 13; // Block past dates relative to screenshot context
                      const isSelected = selectedDate === day;
                      return (
                        <button
                          key={day}
                          disabled={isPast}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedTime(null); // Clear time if day changes
                          }}
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all text-xs font-semibold ${
                            isPast
                              ? "text-neutral-300 cursor-not-allowed"
                              : isSelected
                                ? "bg-neutral-300 text-black shadow-sm font-bold"
                                : "text-neutral-800 hover:bg-neutral-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Active Date Info & Time Slots Grid */}
                <div className="w-full lg:w-7/12 flex flex-col">
                  <div className="mb-2">
                    <h4 className="text-base font-semibold text-neutral-900">
                      Tuesday, July {selectedDate}
                    </h4>
                    <p className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase mt-1">
                      Time Zone:{" "}
                      <span className="underline cursor-pointer hover:text-neutral-800">
                        Manila (GMT+08:00)
                      </span>
                    </p>
                  </div>

                  {/* Time Blocks Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-2 border rounded-md text-xs font-bold tracking-wide transition-all ${
                          selectedTime === time
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-black border-neutral-300 hover:border-neutral-800"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Complete Button Trigger */}
                  {selectedTime && (
                    <button className="w-full mt-6 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition shadow-md animate-fadeIn">
                      Confirm Schedule (
                      {timeSlots.find((t) => t === selectedTime)})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN BOOK COMPONENT ---
export const Book = ({ setActiveLink }) => {
  const [activeBookingId, setActiveBookingId] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) setActiveLink("home");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setActiveLink]);

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
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-gray-600 select-none">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-16 flex flex-col gap-16 flex-grow">
        {/* ================= SECTION 1: STUDIO BACKDROP GUIDE ================= */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 pt-12">
          <div className="w-full md:w-1/4 text-center md:text-left tracking-[0.2em] text-xs uppercase leading-relaxed text-gray-900 font-light">
            Let's take things to the next level, shall we?
          </div>

          <div className="w-full md:w-3/4 flex flex-col items-center md:items-end">
            <h2
              className="text-3xl md:text-4xl text-gray-800 mb-10 md:mr-24 italic lowercase font-serif"
              style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
            >
              a quick studio backdrop guide
            </h2>
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="flex gap-4">
                  {studioAColors.map((color, idx) => (
                    <div
                      key={idx}
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
              <div className="flex flex-col items-center">
                <div className="flex gap-4">
                  {studioBColors.map((color, idx) => (
                    <div
                      key={idx}
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

        {/* ================= APPOINTMENT SELECTION ================= */}
        <div className="w-full max-w-2xl mx-auto text-[#1a1a1a] px-4 md:px-0">
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

          <h2 className="text-xl font-bold mb-4 tracking-wide">
            Self-Portraits
          </h2>
          <PackageCard
            id="kadlaw"
            title="Kadlaw"
            price="₱649.00"
            image={Pic25}
            altText="Couple Photo"
            description="A timeless studio session portraits with elegant printed keepsakes. Package Inclusions: • Good for 2 people • 1-hour appointment duration, 15-minute unlimited studio shoot • Can be a mix of headshots ..."
            activeBookingId={activeBookingId}
            setActiveBookingId={setActiveBookingId}
            inclusions={[
              { text: "• Good for up to 4 persons" },
              { text: "• For 2 pax" },
              { text: "• 15 minute self-shoot" },
              { text: "• 1 colored backdrop of choice" },
              { text: "• 2 4R Prints and 2 Photo Grids Strips" },
              { text: "• Soft copies of Select Photos (5)" },
              {
                text: "Studio A – Wheat, Scarlet Red, Marine Blue",
                indent: true,
              },
              {
                text: "Studio B – White, Blush Pink, Amber Brown",
                indent: true,
              },
            ]}
          />

          <h2 className="text-xl font-bold mb-4 tracking-wide mt-8">Groups</h2>
          <PackageCard
            id="gugma"
            title="Gugma"
            price="₱1,499"
            image={Pic8}
            altText="Group Photo"
            description="A session designed for families, friends, or medium-sized groups who want timeless studio portraits."
            activeBookingId={activeBookingId}
            setActiveBookingId={setActiveBookingId}
            inclusions={[
              { text: "• For 5 pax" },
              { text: "• 20 minute self-shoot" },
              { text: "• 15 minute self-shoot" },
              { text: "• 15 minute photo selection" },
              { text: "• 1 colored backdrop of choice" },
              { text: "• 5 4R Prints and 6 Photo Grids Strips" },
              { text: "• Soft copies of Select Photos (10)" },
              {
                text: "Studio A – Wheat, Scarlet Red, Marine Blue",
                indent: true,
              },
              {
                text: "Studio B – White, Blush Pink, Amber Brown",
                indent: true,
              },
            ]}
          />
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-amber-950 border-t border-amber-900/40 mt-auto py-12 px-6 md:px-12 text-stone-300 font-sans">
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
              {/* Instagram */}
              <a
                href="https://www.instagram.com/yuhum.studios/"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/yuhum.studiosph"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@yuhumstudios?is_from_webapp=1&sender_device=pc"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Our Journal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact/Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Appointments
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Mon — Fri: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 5:00 PM</li>
              <li>Sunday: Closed</li>
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
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
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
          <p>
            &copy; {new Date().getFullYear()} Yuhum.Studios All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Book;
