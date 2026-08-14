import { useEffect, useState } from "react";
import { getWeekdayName, MONTH_NAMES } from "../utils/dateUtils";

// All the state + rules for one package card's booking flow:
// expand/collapse, studio choice, add-ons, date/time, and building the
// booking summary that gets handed off to the info form. The PackageCard
// component only renders what this hook gives it.
export function usePackageBooking({
  id,
  packageMeta,
  isBookingOpen,
  onProceedToForm,
}) {
  const today = new Date();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});

  // Which month/year the calendar grid is currently showing
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // The actual chosen date — no longer hardcoded to 14/July
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const [selectedTime, setSelectedTime] = useState(null);

  // Reset sub-selections whenever this card's booking panel closes.
  useEffect(() => {
    if (!isBookingOpen) {
      setSelectedStudio(null);
      setSelectedTime(null);
      setSelectedAddons({});
      setSelectedDate(null);
      setSelectedMonth(null);
      setSelectedYear(null);
      // snap the visible calendar back to the real current month too
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingOpen]);

  const handleStudioSelect = (studioName) => setSelectedStudio(studioName);

  const handleAddonChange = (addonLabel) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonLabel]: !prev[addonLabel],
    }));
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day);
    setSelectedMonth(viewMonth);
    setSelectedYear(viewYear);
    setSelectedTime(null);
  };

  const handleProceed = () => {
    const chosenAddOns = Object.keys(selectedAddons).filter(
      (key) => selectedAddons[key],
    );

    const bookingSummary = {
      packageId: id,
      packageTitle: packageMeta.title,
      basePrice: packageMeta.price,
      studio: selectedStudio,
      date: `${MONTH_NAMES[selectedMonth]} ${selectedDate}, ${selectedYear}`,
      dayOfWeek: getWeekdayName(selectedDate, selectedYear, selectedMonth),
      time: selectedTime,
      addOns: chosenAddOns,
      image: packageMeta.image,
      description: packageMeta.description,
    };

    onProceedToForm?.(bookingSummary);
  };

  return {
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
  };
}
