import React, { useEffect, useState } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

import { PackageCard } from "../booking/PackageCard";
import { StudioBackdropGuide } from "../booking/StudioBackdropGuide";
import { BookingInformationForm } from "../booking/BookingInformationForm";
import { ConfirmationModal } from "../booking/ConfirmationModal";
import { useBookingForm } from "../../hooks/useBookingForm";
import { PACKAGES } from "../../data/bookingOptions";

// Map static package data to its image (images can't live in the plain
// data file since bundlers resolve `import` paths at build time).
const PACKAGE_IMAGES = {
  kadlaw: Pic25,
  gugma: Pic8,
};

// Book only holds the state that's shared across the whole flow
// (which card is open, which booking is pending) and wires components +
// hooks together. It renders no booking rules itself.
export const Book = ({ setActiveLink, userEmail }) => {
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  const {
    formData,
    handleInputChange,
    handleCountryCodeChange,
    modal,
    closeModal,
    handleFinalSubmit,
  } = useBookingForm({ userEmail, pendingBooking });

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) setActiveLink("home");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setActiveLink]);

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col font-sans text-stone-600 select-none relative">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 md:px-16 md:py-20 flex flex-col gap-16 flex-grow">
        {pendingBooking ? (
          <BookingInformationForm
            pendingBooking={pendingBooking}
            formData={formData}
            onInputChange={handleInputChange}
            onCountryCodeChange={handleCountryCodeChange}
            onBack={() => setPendingBooking(null)}
            onSubmit={handleFinalSubmit}
          />
        ) : (
          <>
            <StudioBackdropGuide />

            <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-800 font-bold text-xs uppercase tracking-widest">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span>Seamless Online Reservation</span>
              </div>

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

      <ConfirmationModal modal={modal} onClose={closeModal} />
    </div>
  );
};

export default Book;
