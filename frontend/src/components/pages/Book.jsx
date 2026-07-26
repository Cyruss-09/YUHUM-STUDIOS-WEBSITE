import React, { useEffect, useState } from "react";
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
  onProceedToForm,
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

  const handleProceed = () => {
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
      image: image,
      description: description,
    };

    if (onProceedToForm) {
      onProceedToForm(bookingSummary);
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
    <div className="w-full flex flex-col mb-8">
      {/* Main Card */}
      <div className="w-full bg-white border border-stone-200/80 rounded-2xl flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Left Side: Image with Overlay Tag */}
        <div className="w-full md:w-[260px] min-h-[280px] md:min-h-full shrink-0 relative overflow-hidden group">
          <img
            src={image}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:hidden" />
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                  {title}
                </h3>
                <span className="text-lg font-medium text-amber-800 block mt-1">
                  {price}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveBookingId(isBookingOpen ? null : id);
                }}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-sm ${
                  isBookingOpen
                    ? "bg-stone-900 text-white shadow-stone-900/20"
                    : "bg-stone-100 hover:bg-stone-900 text-stone-900 hover:text-white"
                }`}
              >
                {isBookingOpen ? "Close Booking" : "Reserve Now"}
              </button>
            </div>

            <p className="font-normal text-stone-600 text-[15px] leading-relaxed mb-4">
              {description}
            </p>

            {isExpanded && (
              <div className="mt-4 text-stone-800 text-[15px] leading-relaxed space-y-5 border-t border-stone-100 pt-5 animate-in fade-in duration-300">
                <div className="font-normal">
                  <span className="block mb-2 font-bold text-stone-900 uppercase text-xs tracking-wider">
                    Package Inclusions:
                  </span>
                  <ul className="list-none space-y-1.5">
                    {inclusions.map((item, idx) => (
                      <li
                        key={idx}
                        className={item.indent ? "pl-4 text-stone-500 text-sm" : "text-stone-700"}
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold uppercase tracking-widest text-stone-900 hover:text-amber-800 transition-colors flex items-center gap-1.5"
            >
              <span>{isExpanded ? "Hide Details" : "View Inclusions"}</span>
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- STUDIO SELECTION PANEL --- */}
      {isBookingOpen && (
        <div className="w-full mt-4 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {/* Base Studio Box */}
          <div className="w-full bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-stone-50/80 px-6 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
                Step 1: Choose Your Studio Space
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              <div className="flex items-center justify-between p-6 hover:bg-stone-50/50 transition-colors">
                <div>
                  <span className="font-bold text-lg text-stone-900 block capitalize">
                    Studio A
                  </span>
                  <span className="text-xs text-stone-500">Wheat, Scarlet Red, Marine Blue</span>
                </div>
                <button
                  onClick={() => handleStudioSelect("Studio A")}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                    selectedStudio === "Studio A"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                  }`}
                >
                  {selectedStudio === "Studio A" ? "Selected" : "Select"}
                </button>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-stone-50/50 transition-colors">
                <div>
                  <span className="font-bold text-lg text-stone-900 block capitalize">
                    Studio B
                  </span>
                  <span className="text-xs text-stone-500">White, Blush Pink, Amber Brown</span>
                </div>
                <button
                  onClick={() => handleStudioSelect("Studio B")}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                    selectedStudio === "Studio B"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                  }`}
                >
                  {selectedStudio === "Studio B" ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>

          {/* --- NESTED ADD-ONS AND SCHEDULER SECTION --- */}
          {selectedStudio && (
            <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
              {/* 1. ADD TO APPOINTMENT BLOCK */}
              <div className="w-full bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-stone-900 uppercase mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                  Step 2: Customise with Add-ons (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {addOns.map((addon) => (
                    <label
                      key={addon.key}
                      className="flex items-start gap-3.5 cursor-pointer select-none group p-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedAddons[addon.label]}
                        onChange={() => handleAddonChange(addon.label)}
                        className="w-4 h-4 mt-0.5 accent-stone-900 rounded border-stone-300 cursor-pointer"
                      />
                      <div className="text-sm flex-1 flex justify-between items-center">
                        <span className="font-medium text-stone-700 group-hover:text-stone-900">
                          {addon.label}
                        </span>
                        <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                          {addon.price === "Free" ? "Free" : `+ ${addon.price}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. CALENDAR & TIME SLOTS WRAPPER CONTAINER */}
              <div className="w-full bg-white border border-stone-200 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-12 shadow-sm">
                {/* Left Side: Calendar */}
                <div className="w-full lg:w-5/12">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold tracking-widest text-stone-900 uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                      Step 3: Pick Date & Time
                    </span>
                  </div>

                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <div className="flex items-center justify-between mb-6">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <span className="text-sm font-bold text-stone-900 tracking-wide">
                        July 2026
                      </span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-stone-400 mb-3">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm font-medium">
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
                                ? "text-stone-300 cursor-not-allowed bg-transparent"
                                : isSelected
                                ? "bg-stone-900 text-white shadow-md font-bold scale-105"
                                : "text-stone-700 hover:bg-stone-200/70"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Time Slots */}
                <div className="w-full lg:w-7/12 flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-serif font-bold text-stone-900 capitalize">
                        {getWeekdayName(selectedDate)}, July {selectedDate}
                      </h4>
                      <p className="text-[11px] font-bold tracking-wider text-stone-400 uppercase mt-0.5">
                        Time Zone: <span className="text-stone-700 underline">Manila (GMT+08:00)</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 px-2 border rounded-xl text-xs font-bold tracking-wide transition-all ${
                            selectedTime === time
                              ? "bg-amber-800 text-white border-amber-800 shadow-sm"
                              : "bg-stone-50/50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTime && (
                    <div className="mt-6 pt-4 border-t border-stone-100 animate-in fade-in duration-300">
                      <button
                        onClick={handleProceed}
                        className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition shadow-lg shadow-stone-900/10"
                      >
                        Confirm Slot — {selectedTime}
                      </button>
                    </div>
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
  const [pendingBooking, setPendingBooking] = useState(null);

  // Form input states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: userEmail || "",
    termsAccepted: false,
    backdrop: "",
    paymentMode: "",
    couponCode: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isSuccess: false,
  });

  const closeModal = () => {
    const wasSuccess = modal.isSuccess;
    setModal((prev) => ({ ...prev, isOpen: false }));

    if (wasSuccess) {
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) setActiveLink("home");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setActiveLink]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      packageId: pendingBooking.packageId,
      packageTitle: pendingBooking.packageTitle,
      basePrice: pendingBooking.basePrice,
      studio: pendingBooking.studio,
      date: pendingBooking.date,
      dayOfWeek: pendingBooking.dayOfWeek,
      time: pendingBooking.time,
      addOns: pendingBooking.addOns || [],
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || userEmail || "customer@example.com",
      backdrop: formData.backdrop,
      paymentMode: formData.paymentMode,
      couponCode: formData.couponCode,
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
          message: `Thank you, ${formData.firstName}! Your booking for ${pendingBooking.packageTitle} on ${pendingBooking.date} at ${pendingBooking.time} is confirmed!`,
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
    { name: "White", bg: "bg-white", text: "text-[#5c5c5c]", border: "border border-stone-200" },
    { name: "Blush pink", bg: "bg-[#F4C2C2]", text: "text-[#4a4540]" },
    { name: "Amber brown", bg: "bg-[#A6674C]", text: "text-white" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col font-sans text-stone-600 select-none relative">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 md:px-16 md:py-20 flex flex-col gap-16 flex-grow">
        
        {/* ================= IF PENDING BOOKING: SHOW YOUR INFORMATION FORM ================= */}
        {pendingBooking ? (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <button 
                onClick={() => setPendingBooking(null)} 
                className="text-xs tracking-widest text-stone-400 hover:underline uppercase font-bold"
              >
                &lt; Date &amp; Time
              </button>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Your Information</h2>
            </div>

            {/* Appointment Summary Card */}
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4 relative">
              <div className="flex gap-4 items-start">
                <img 
                  src={pendingBooking.image} 
                  alt={pendingBooking.packageTitle} 
                  className="w-28 h-28 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-stone-900 capitalize text-lg">{pendingBooking.packageTitle} with {pendingBooking.studio}</h3>
                  <p className="text-amber-800 font-bold text-sm mt-0.5">{pendingBooking.basePrice}</p>
                  <p className="text-xs text-stone-500 mt-1">{pendingBooking.dayOfWeek}, {pendingBooking.date} at {pendingBooking.time}</p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{pendingBooking.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setPendingBooking(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Information Form */}
            <form onSubmit={handleFinalSubmit} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Left Column: Personal Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">First name *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Last name *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Phone *</label>
                    <div className="flex border border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:border-stone-900">
                      <span className="flex items-center px-3 bg-stone-100 text-sm border-r border-stone-200">🇵🇭 +63</span>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="9123456789"
                        className="w-full bg-transparent p-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Add..."
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Use a comma or press enter/return to add additional email addresses</span>
                  </div>
                </div>

                {/* Right Column: Coupon & Extras */}
                <div>
                  <div className="border-b border-stone-200 pb-2 flex justify-between items-center cursor-pointer">
                    <span className="text-sm font-bold text-stone-800">Package, gift, or coupon code</span>
                    <span className="text-lg font-light">+</span>
                  </div>
                  <input 
                    type="text" 
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    placeholder="Enter code (optional)"
                    className="w-full mt-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>

              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-3 mt-6 mb-8">
                <input 
                  type="checkbox" 
                  name="termsAccepted"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-stone-500 leading-relaxed">
                  By checking, you accept Terms of Service, acknowledge that you have read and understood our Privacy Policy and consent to receive SMS communications about your appointments and/or waitlist availability from this scheduling business. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt-out.
                </label>
              </div>

              {/* Additional Information Section */}
              <div className="border-t border-stone-200 pt-6 mt-6">
                <h3 className="text-base font-serif font-bold text-stone-900 mb-4">Additional Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">How did you hear about us? *</label>
                    <select 
                      name="backdrop"
                      value={formData.backdrop}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                    >
                      <option value="">Select an option</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Tiktok">Tiktok</option>
                      <option value="Friends/Family">Friends/Family</option>
                      <option value="Google">Google</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mode of Payment *</label>
                    <select 
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
                    >
                      <option value="">Select an option</option>
                      <option value="GCash">GCash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash on-site</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition shadow-lg shadow-stone-900/10"
                >
                  Complete Booking
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* ================= SECTION 1: STUDIO BACKDROP GUIDE ================= */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 bg-white border border-stone-200/80 p-8 md:p-12 rounded-3xl shadow-sm">
              <div className="w-full md:w-1/3 text-center md:text-left">
                <span className="tracking-[0.25em] text-[11px] uppercase font-bold text-amber-800 block mb-3">
                  Atmosphere & Aesthetic
                </span>
                <h2 className="text-3xl md:text-4xl text-stone-900 font-serif lowercase italic">
                  a quick studio backdrop guide
                </h2>
                <p className="text-stone-500 text-sm mt-3 leading-relaxed">
                  Explore our curated palette of backdrops available across our two dedicated studio environments.
                </p>
              </div>

              <div className="w-full md:w-2/3 flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-8">
                {/* Studio A Guide */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-2.5">
                    {studioAColors.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center p-3 text-center text-xs font-medium tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}
                      >
                        {color.name}
                      </div>
                    ))}
                  </div>
                  <span className="mt-3 font-bold text-xs tracking-wider text-stone-900 uppercase">
                    Studio A
                  </span>
                </div>

                {/* Studio B Guide */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-2.5">
                    {studioBColors.map((color, idx) => (
                      <div
                        key={idx}
                        className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center p-3 text-center text-xs font-medium tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}
                      >
                        {color.name}
                      </div>
                    ))}
                  </div>
                  <span className="mt-3 font-bold text-xs tracking-wider text-stone-900 uppercase">
                    Studio B
                  </span>
                </div>
              </div>
            </div>

            {/* ================= APPOINTMENT SELECTION ================= */}
            <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-800 font-bold text-xs uppercase tracking-widest">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Seamless Online Reservation</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide">
                Self-Portraits & Packages
              </h2>

              <div className="space-y-4 mb-8">
                <PackageCard
                  id="kadlaw"
                  title="Kadlaw"
                  price="₱649.00"
                  image={Pic25}
                  altText="Couple Photo"
                  description="A timeless studio session featuring elegant printed keepsakes and an intimate self-shoot environment."
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                  inclusions={[
                    { text: "• Good for up to 4 persons" },
                    { text: "• 15 minute self-shoot session" },
                    { text: "• 1 colored backdrop of choice" },
                    { text: "• 2 4R Prints and 2 Photo Grids Strips" },
                    { text: "• Soft copies of Select Photos (5)" },
                    { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
                    { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
                  ]}
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide mt-12">
                Groups & Families
              </h2>

              <div className="space-y-4">
                <PackageCard
                  id="gugma"
                  title="Gugma"
                  price="₱1,499.00"
                  image={Pic8}
                  altText="Group Photo"
                  description="A session designed for families, friends, or medium-sized groups who want comprehensive coverage and gorgeous keepsakes."
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                  inclusions={[
                    { text: "• For up to 5 pax" },
                    { text: "• 20 minute self-shoot session" },
                    { text: "• 15 minute photo selection window" },
                    { text: "• 1 colored backdrop of choice" },
                    { text: "• 5 4R Prints and 6 Photo Grids Strips" },
                    { text: "• Soft copies of Select Photos (10)" },
                    { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
                    { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= TAILWIND CUSTOM MODAL ================= */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden p-8 text-center space-y-4">
            <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${modal.isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {modal.isSuccess ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-serif font-bold text-stone-900 tracking-wide">
              {modal.title}
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              {modal.message}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-md"
              >
                {modal.isSuccess ? "Awesome" : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Book;