import { useState } from "react";
import { submitBooking } from "../services/bookingApi";

const PENDING_FORM_KEY = "yuhum_pendingForm";

export function useBookingForm({ userEmail, pendingBooking }) {

  const [formData, setFormData] = useState(() => {
    try {
      const savedForm = localStorage.getItem(PENDING_FORM_KEY);
      if (savedForm) {
        return JSON.parse(savedForm);
      }
    } catch (e) {
      console.error("Failed to load saved form draft:", e);
    }
    return {
      firstName: "",
      lastName: "",
      phone: "",
      email: userEmail || "",
      termsAccepted: false,
      findUs: "",
      paymentMode: "",
      couponCode: "",
      countryCode: "+63",
    };
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isSuccess: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryCodeChange = (newCode) => {
    setFormData((prev) => ({ ...prev, countryCode: newCode }));
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!pendingBooking) return;

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
      termsAccepted: formData.termsAccepted,
      backdrop: formData.backdrop,
      paymentMode: formData.paymentMode,
      couponCode: formData.couponCode,
      findUs: formData.findUs,
    };

    try {
      const { ok, result } = await submitBooking(payload);

      if (ok && result.success) {
        try {
          localStorage.removeItem("yuhum_pendingBooking");
          localStorage.removeItem(PENDING_FORM_KEY);
        } catch (err) {
          console.error("Failed to clear storage:", err);
        }

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

  return {
    formData,
    setFormData,
    handleInputChange,
    handleCountryCodeChange,
    modal,
    closeModal,
    handleFinalSubmit,
  };
}