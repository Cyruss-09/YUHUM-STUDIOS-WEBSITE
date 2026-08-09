import React, { useEffect, useState } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

import { PackageCard } from "../../components/booking/PackageCard";
import { StudioBackdropGuide } from "../../components/booking/StudioBackdropGuide";
import { BookingInformationForm } from "../../components/booking/BookingInformationForm";
import { ConfirmationModal } from "../../components/booking/ConfirmationModal";
import { useBookingForm } from "../../hooks/useBookingForm";
import { PACKAGES } from "../../data/bookingOptions";
import { useAuth } from "../../context/AuthContext"; // CHANGED: added

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
  const { user, loading: authLoading } = useAuth(); // CHANGED: added
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

  // CHANGED: wait for AuthContext to finish checking localStorage/`/api/auth/me`
  // before deciding whether to show the gate — avoids a flash of the
  // "please log in" screen for users who are actually logged in.
  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <p className="text-stone-500 text-sm">Loading...</p>
      </div>
    );
  }

  // CHANGED: block the whole booking flow behind login. Backend also
  // enforces this (verifyToken on POST /api/bookings) — this is just the
  // frontend UX so users aren't filling out a form only to hit a 401.
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4 text-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-3">
            Please Sign In to Book
          </h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            You'll need an account to schedule a session with us. It only
            takes a minute to create one.
          </p>
        </div>
        <button
          onClick={() => setActiveLink && setActiveLink("register")}
          className="bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] font-semibold text-xs tracking-[0.15em] uppercase py-3.5 px-8 rounded-lg shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_20px_rgba(192,138,62,0.5)] transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
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