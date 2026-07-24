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
  onConfirm,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);

  // State for Add-ons checklist
  const [selectedAddons, setSelectedAddons] = useState({});
  // State for Calendar & Time Selection
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedTime, setSelectedTime] = useState(null);

  const isBookingOpen = activeBookingId === id;

  // Automatically clear sub-selections if this specific card closes
  useEffect(() => {
    if (!isBookingOpen) {
      setSelectedStudio(null);
      setSelectedTime(null);
      setSelectedAddons({});
    }
  }, [isBookingOpen]);

  const handleStudioSelect = (studioName) => {
    setSelectedStudio(studioName);
  };

  const handleAddonChange = (addonLabel) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonLabel]: !prev[addonLabel],
    }));
  };

  const getWeekdayName = (dayNumber) => {
    const dateObj = new Date(2026, 6, dayNumber); // July 2026
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleConfirmSchedule = () => {
    const chosenAddOns = Object.keys(selectedAddons).filter(
      (key) => selectedAddons[key]
    );

    const bookingSummary = {
      packageId: id,
      packageTitle: title,
      basePrice: price,
      studio: selectedStudio,
      date: `July ${selectedDate}, 2026`,
      dayOfWeek: getWeekdayName(selectedDate),
      time: selectedTime,
      addOns: chosenAddOns,
    };

    if (onConfirm) {
      onConfirm(bookingSummary);
    }
  };

  const addOns = [
    { key: "add_head", label: "+1 adult", price: "₱250.00" },
    { key: "add_pet", label: "+1 pet", price: "₱100.00" },
    { key: "add_4r_print", label: "+1 4R Print", price: "₱50.00" },
    { key: "add_grid_strips", label: "+1 2x Photo Grid Strips", price: "₱50.00" },
    { key: "raw_photos", label: "All Raw Photos", price: "₱400.00" },
    { key: "hair_makeup", label: "Hair & Makeup Service", price: "₱2,500.00" },
    { key: "studio_rental", label: "Rental Studio (Rate is per hour)", price: "₱1,000.00" },
  ];

  const timeSlots = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "4:00 PM", "4:30 PM", "5:00 PM",
    "5:30 PM", "6:00 PM",
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
        <div className="w-full mt-4 flex flex-col gap-6 dynamic-panel">
          {/* Base Studio Box */}
          <div className="w-full bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
              <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">
                With
              </span>
            </div>

            <div className="flex flex-col divide-y divide-neutral-100">
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

          {/* --- NESTED ADD-ONS AND SCHEDULER SECTION --- */}
          {selectedStudio && (
            <div className="w-full flex flex-col gap-6 dynamic-panel">
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
                        checked={!!selectedAddons[addon.label]}
                        onChange={() => handleAddonChange(addon.label)}
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
                {/* Left Side: Calendar */}
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

                  <div className="grid grid-cols-7 gap-y-4 text-center text-xs font-bold text-neutral-900 mb-4">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>

                  <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
                    <span key="pad-1" className="text-transparent"></span>
                    <span key="pad-2" className="text-transparent"></span>

                    {daysInJuly.map((day) => {
                      const isPast = day < 13;
                      const isSelected = selectedDate === day;
                      return (
                        <button
                          key={day}
                          disabled={isPast}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedTime(null);
                          }}
                          className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all text-xs font-semibold ${
                            isPast
                              ? "text-neutral-300 cursor-not-allowed"
                              : isSelected
                              ? "bg-black text-white shadow-sm font-bold"
                              : "text-neutral-800 hover:bg-neutral-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Time Slots */}
                <div className="w-full lg:w-7/12 flex flex-col">
                  <div className="mb-2">
                    <h4 className="text-base font-semibold text-neutral-900 capitalize">
                      {getWeekdayName(selectedDate)}, July {selectedDate}
                    </h4>
                    <p className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase mt-1">
                      Time Zone:{" "}
                      <span className="underline cursor-pointer hover:text-neutral-800">
                        Manila (GMT+08:00)
                      </span>
                    </p>
                  </div>

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

                  {selectedTime && (
                    <button
                      onClick={handleConfirmSchedule}
                      className="w-full mt-6 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition shadow-md dynamic-panel"
                    >
                      Confirm Schedule ({selectedTime})
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
export const Book = ({ setActiveLink, userEmail }) => {
  const [activeBookingId, setActiveBookingId] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isSuccess: false,
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) setActiveLink("home");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setActiveLink]);

  const handleBookingConfirmation = async (summaryData) => {
    const payload = {
      packageId: summaryData.packageId,
      packageTitle: summaryData.packageTitle,
      basePrice: summaryData.basePrice,
      studio: summaryData.studio,
      date: summaryData.date,
      dayOfWeek: summaryData.dayOfWeek,
      time: summaryData.time,
      addOns: summaryData.addOns || [],
      userEmail: userEmail || "customer@example.com", // Safe fallback
    };

    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setModal({
          isOpen: true,
          title: "Booking Confirmed!",
          message: `Thank you! Your booking for ${summaryData.packageTitle} on ${summaryData.date} at ${summaryData.time} is confirmed!`,
          isSuccess: true,
        });
      } else {
        setModal({
          isOpen: true,
          title: "Booking Error",
          message: result.error || "Failed to process booking.",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Network Error:", error);
      setModal({
        isOpen: true,
        title: "Connection Error",
        message: "Could not connect to the backend server.",
        isSuccess: false,
      });
    }
  };

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
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-gray-600 select-none relative">
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
            onConfirm={handleBookingConfirmation}
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
            onConfirm={handleBookingConfirmation}
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

      {/* ================= TAILWIND CUSTOM MODAL ================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div
                className={`mx-auto w-14 h-14 flex items-center justify-center rounded-full ${
                  modal.isSuccess
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {modal.isSuccess ? (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-bold font-serif text-neutral-900 tracking-wide">
                {modal.title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {modal.message}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-colors duration-200 shadow-sm ${
                    modal.isSuccess
                      ? "bg-black hover:bg-neutral-800 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {modal.isSuccess ? "Awesome" : "Dismiss"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Book;