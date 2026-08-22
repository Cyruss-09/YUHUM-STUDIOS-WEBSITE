import React, { useEffect, useState, useRef } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

import { PackageCard } from "../../components/booking/PackageCard";
import { StudioBackdropGuide } from "../../components/booking/StudioBackdropGuide";
import { BookingInformationForm } from "../../components/booking/BookingInformationForm";
import { ConfirmationModal } from "../../components/booking/ConfirmationModal";
import { useBookingForm } from "../../hooks/useBookingForm";
import { usePublicSettings } from "../../hooks/usePublicSettings";
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
  const { settings } = usePublicSettings();
  const [activeBookingId, setActiveBookingId] = useState(null);

  // Dynamic live pricing configured by Admin
  const kadlawPriceFormatted =
    settings?.packages?.kadlawPrice != null
      ? `₱${Number(settings.packages.kadlawPrice).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : PACKAGES.kadlaw.price;

  const gugmaPriceFormatted =
    settings?.packages?.gugmaPrice != null
      ? `₱${Number(settings.packages.gugmaPrice).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : PACKAGES.gugma.price;

  const dynamicKadlaw = {
    ...PACKAGES.kadlaw,
    price: kadlawPriceFormatted,
  };

  const dynamicGugma = {
    ...PACKAGES.gugma,
    price: gugmaPriceFormatted,
  };

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

  // Auto-submit/trigger confirmation once the user successfully logs in and returns
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (!authLoading && user && pendingBooking && !autoSubmittedRef.current) {
      const savedForm = localStorage.getItem(PENDING_FORM_KEY);
      if (savedForm) {
        autoSubmittedRef.current = true;
        localStorage.removeItem(PENDING_FORM_KEY);

        const syntheticEvent = { preventDefault: () => { } };
        handleFinalSubmit(syntheticEvent);
      }
    }
  }, [authLoading, user, pendingBooking, handleFinalSubmit]);

  const handleCloseModal = () => {
    setPendingBooking(null);
    closeModal();
  };

  // Maintenance mode lives under settings.cms (see admin SettingsPanel.jsx),
  // not on the top-level settings object — that mismatch was why this never triggered.
  const isMaintenanceMode = settings?.cms?.maintenanceMode ?? false;
  const maintenanceMessage =
    settings?.cms?.maintenanceMessage ||
    "Our booking system is currently undergoing scheduled maintenance and updates. Please check back again shortly. Thank you for your patience!";

  return (
    <div className="w-full min-h-screen bg-[#faf8f5] flex flex-col font-sans text-stone-600 select-none relative">
      <div className="w-full max-w-7xl mx-auto px-4 py-12 md:px-16 md:py-20 flex flex-col gap-16 flex-grow justify-center">

        {/* Maintenance Mode Guard View */}
        {isMaintenanceMode ? (
          <div className="w-full max-w-xl mx-auto text-center bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-serif">
              ⚙️
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-3 tracking-wide">
              We'll Be Right Back
            </h2>
            <p className="text-stone-500 leading-relaxed mb-8 whitespace-pre-line">
              {maintenanceMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        ) : pendingBooking ? (
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
            <StudioBackdropGuide settings={settings} />

            <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide">
                {dynamicKadlaw.group}
              </h2>
              <div className="space-y-4 mb-8">
                <PackageCard
                  {...dynamicKadlaw}
                  settings={settings}
                  image={PACKAGE_IMAGES.kadlaw}
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide mt-12">
                {dynamicGugma.group}
              </h2>
              <div className="space-y-4">
                <PackageCard
                  {...dynamicGugma}
                  settings={settings}
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