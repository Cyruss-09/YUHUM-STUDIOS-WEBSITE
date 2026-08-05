import { useEffect, useState } from "react";
import { getWeekdayName } from "../utils/dateUtils";

// All the state + rules for one package card's booking flow:
// expand/collapse, studio choice, add-ons, date/time, and building the
// booking summary that gets handed off to the info form. The PackageCard
// component only renders what this hook gives it.
export function usePackageBooking({ id, packageMeta, isBookingOpen, onProceedToForm }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedTime, setSelectedTime] = useState(null);

  // Reset sub-selections whenever this card's booking panel closes.
  useEffect(() => {
    if (!isBookingOpen) {
      setSelectedStudio(null);
      setSelectedTime(null);
      setSelectedAddons({});
    }
  }, [isBookingOpen]);

  const handleStudioSelect = (studioName) => setSelectedStudio(studioName);

  const handleAddonChange = (addonLabel) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonLabel]: !prev[addonLabel],
    }));
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day);
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
      date: `July ${selectedDate}, 2026`,
      dayOfWeek: getWeekdayName(selectedDate),
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
    selectedDate,
    handleDateSelect,
    selectedTime,
    setSelectedTime,
    handleProceed,
  };
}
