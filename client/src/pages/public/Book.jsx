import React, { useEffect, useState, useRef } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

import { PackageCard } from "../../components/booking/PackageCard";
import { StudioBackdropGuide } from "../../components/booking/StudioBackdropGuide";
import { BookingInformationForm } from "../../components/booking/BookingInformationForm";
import { ConfirmationModal } from "../../components/booking/ConfirmationModal";
import { useBookingForm } from "../../hooks/useBookingForm";
import { PACKAGES } from "../../data/bookingOptions";
import { useAuth } from "../../context/AuthContext";

const PACKAGE_IMAGES = {
  kadlaw: Pic25,
  gugma: Pic8,
};

const PENDING_BOOKING_KEY = "yuhum_pendingBooking";
const PENDING_FORM_KEY = "yuhum_pendingForm";

export const Book = ({ setActiveLink, userEmail }) => {
  const { user, loading: authLoading } = useAuth();
  const [activeBookingId, setActiveBookingId] = useState(null);

  const [pendingBooking, setPendingBooking] = useState(() => {
    try {
      const saved = localStorage.getItem(PENDING_BOOKING_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to restore pending booking:", e);
      return null;
    }
  });

  const {
    formData,
    handleInputChange,
    handleCountryCodeChange,
    modal,
    closeModal,
    handleFinalSubmit,
  } = useBookingForm({ userEmail, pendingBooking });

  // Keep localStorage in sync with pendingBooking selection
  useEffect(() => {
    try {
      if (pendingBooking) {
        localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(pendingBooking));
      } else {
        localStorage.removeItem(PENDING_BOOKING_KEY);
        localStorage.removeItem(PENDING_FORM_KEY);
      }
    } catch (e) {
      console.error("Failed to persist pending booking:", e);
    }
  }, [pendingBooking]);

  // 🔥 NEW: Auto-submit/trigger confirmation once the user successfully logs in and returns
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    // Only fire if auth is done loading, user is logged in, we have a pending booking, 
    // and we haven't already auto-submitted during this session mount.
    if (!authLoading && user && pendingBooking && !autoSubmittedRef.current) {
      // Check if we also have saved form data indicating they came back from login
      const savedForm = localStorage.getItem(PENDING_FORM_KEY);
      if (savedForm) {
        autoSubmittedRef.current = true;
        
        // Clean up the temporary form key so it doesn't loop
        localStorage.removeItem(PENDING_FORM_KEY);

        // Create a synthetic event object since handleFinalSubmit expects e.preventDefault()
        const syntheticEvent = { preventDefault: () => {} };
        
        // Automatically submit the booking payload to the backend
        handleFinalSubmit(syntheticEvent);
      }
    }
  }, [authLoading, user, pendingBooking, handleFinalSubmit]);

  const handleCloseModal = () => {
    setPendingBooking(null);
    closeModal();
  };

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col font-sans text-stone-600 select-none relative">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 md:px-16 md:py-20 flex flex-col gap-16 flex-grow">
        {pendingBooking ? (
          <BookingInformationForm
            pendingBooking={pendingBooking}
            formData={formData}
            onInputChange={handleInputChange}
            onCountryCodeChange={handleCountryCodeChange}
            onBack={() => {
              localStorage.removeItem(PENDING_FORM_KEY);
              setPendingBooking(null);
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!user) {
                try {
                  localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(pendingBooking));
                  localStorage.setItem(PENDING_FORM_KEY, JSON.stringify(formData));
                } catch (err) {
                  console.error("Failed to save state before login:", err);
                }
                if (setActiveLink) setActiveLink("register");
                return;
              }
              handleFinalSubmit(e);
            }}
          />
        ) : (
          <>
            <StudioBackdropGuide />

            <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide">
                {PACKAGES.kadlaw.group}
              </h2>
              <div className="space-y-4 mb-8">
                <PackageCard
                  {...PACKAGES.kadlaw}
                  image={PACKAGE_IMAGES.kadlaw}
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide mt-12">
                {PACKAGES.gugma.group}
              </h2>
              <div className="space-y-4">
                <PackageCard
                  {...PACKAGES.gugma}
                  image={PACKAGE_IMAGES.gugma}
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmationModal modal={modal} onClose={handleCloseModal} />
    </div>
  );
};

export default Book;