import React from "react";
import { usePackageBooking } from "../../hooks/usePackageBooking";
import {
  getWeekdayName,
  MONTH_NAMES,
  getMonthGrid,
  isPastDate,
} from "../../utils/dateUtils";
import { ADD_ONS, TIME_SLOTS } from "../../data/bookingOptions";

// Pure UI: renders a package + its booking wizard, but owns no booking
// rules itself — everything comes from usePackageBooking().
export const PackageCard = ({
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
  const isBookingOpen = activeBookingId === id;

  const {
    isExpanded,
    setIsExpanded,
    selectedStudio,
    handleStudioSelect,
    selectedAddons,
    handleAddonChange,
    viewYear,
    viewMonth,
    goPrevMonth,
    goNextMonth,
    selectedDate,
    selectedMonth,
    selectedYear,
    handleDateSelect,
    selectedTime,
    setSelectedTime,
    handleProceed,
  } = usePackageBooking({
    id,
    packageMeta: { title, price, image, description },
    isBookingOpen,
    onProceedToForm,
  });

  const monthGrid = getMonthGrid(viewYear, viewMonth);

  return (
    <div className="w-full flex flex-col mb-8">
      {/* Main Card */}
      <div className="w-full bg-white border border-stone-200/80 rounded-2xl flex flex-col md:flex-row items-stretch overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="w-full md:w-[260px] min-h-[280px] md:min-h-full shrink-0 relative overflow-hidden group">
          <img
            src={image}
            alt={altText}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:hidden" />
        </div>

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
                onClick={() => setActiveBookingId(isBookingOpen ? null : id)}
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
                        className={
                          item.indent
                            ? "pl-4 text-stone-500 text-sm"
                            : "text-stone-700"
                        }
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Booking wizard */}
      {isBookingOpen && (
        <div className="w-full mt-4 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {/* Step 1: Studio */}
          <div className="w-full bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-stone-50/80 px-6 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
                Step 1: Choose Your Studio Space
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              {["Studio A", "Studio B"].map((studioName) => (
                <div
                  key={studioName}
                  className="flex items-center justify-between p-6 hover:bg-stone-50/50 transition-colors"
                >
                  <div>
                    <span className="font-bold text-lg text-stone-900 block capitalize">
                      {studioName}
                    </span>
                    <span className="text-xs text-stone-500">
                      {studioName === "Studio A"
                        ? "Wheat, Scarlet Red, Marine Blue"
                        : "White, Blush Pink, Amber Brown"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStudioSelect(studioName)}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                      selectedStudio === studioName
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                    }`}
                  >
                    {selectedStudio === studioName ? "Selected" : "Select"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedStudio && (
            <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Step 2: Add-ons */}
              <div className="w-full bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-stone-900 uppercase mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                  Step 2: Customize with Add-ons (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {ADD_ONS.map((addon) => (
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

              {/* Step 3: Calendar & time */}
              <div className="w-full bg-white border border-stone-200 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-12 shadow-sm">
                <div className="w-full lg:w-5/12">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold tracking-widest text-stone-900 uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                      Step 3: Pick Date & Time
                    </span>
                  </div>

                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={goPrevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                      >
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
                      <span className="text-sm font-bold text-stone-900 tracking-wide">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                      </span>
                      <button
                        onClick={goNextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                      >
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

                    <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-stone-400 mb-3">
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                      <span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm font-medium">
                      {monthGrid.map((day, idx) => {
                        if (day === null) {
                          return (
                            <span
                              key={`pad-${idx}`}
                              className="text-transparent"
                            >
                              .
                            </span>
                          );
                        }

                        const past = isPastDate(viewYear, viewMonth, day);
                        const isSelected =
                          selectedDate === day &&
                          selectedMonth === viewMonth &&
                          selectedYear === viewYear;

                        return (
                          <button
                            key={`${viewYear}-${viewMonth}-${day}`}
                            disabled={past}
                            onClick={() => handleDateSelect(day)}
                            className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all text-xs font-semibold ${
                              past
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

                <div className="w-full lg:w-7/12 flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-serif font-bold text-stone-900 capitalize">
                        {selectedDate
                          ? `${getWeekdayName(selectedDate, selectedYear, selectedMonth)}, ${MONTH_NAMES[selectedMonth]} ${selectedDate}`
                          : "Select a date"}
                      </h4>
                      <p className="text-[11px] font-bold tracking-wider text-stone-400 uppercase mt-0.5">
                        Time Zone:{" "}
                        <span className="text-stone-700 underline">
                          Manila (GMT+08:00)
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {TIME_SLOTS.map((time) => (
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

export default PackageCard;
