// client/src/hooks/usePublicSettings.js
import { useState, useEffect } from "react";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

const DEFAULT_SETTINGS = {
  general: {
    studioName: "Yuhum Studios",
    contactEmail: "yuhumstudios22@gmail.com",
    phone: "+63 912 345 6789",
    address: "Santa Rosa City, Laguna, Philippines",
    googleMapsUrl:
      "https://www.google.com/maps/place/The+Yuh%C3%BAm+Studios:+Self-shoot+X+Makeup/@14.2811949,121.1208636,16z/data=!4m6!3m5!1s0x3397d9d64411a5a9:0xe6cb1e3c3a788c04!8m2!3d14.2812036!4d121.1209445!16s%2Fg%2F11s4z97lg_?entry=ttu",
  },
  schedule: {
    openTime: "10:00 AM",
    closeTime: "06:00 PM",
    slotDurationMinutes: 30,
    bufferMinutes: 15,
    studioAActive: true,
    studioBActive: true,
    blackoutDates: [],
  },
  packages: {
    kadlawPrice: 649,
    gugmaPrice: 1499,
    addOns: [
      { key: "add_head", label: "+1 adult", price: 250 },
      { key: "add_pet", label: "+1 pet", price: 100 },
      { key: "add_4r_print", label: "+1 4R Print", price: 50 },
      { key: "add_grid_strips", label: "+1 2x Photo Grid Strips", price: 50 },
      { key: "raw_photos", label: "All Raw Photos", price: 400 },
      { key: "hair_makeup", label: "Hair & Makeup Service", price: 2500 },
      { key: "studio_rental", label: "Rental Studio (Rate is per hour)", price: 1000 },
    ],
  },
  payments: {
    gcashName: "YUHUM STUDIOS",
    gcashNumber: "0912 345 6789",
    mayaName: "YUHUM STUDIOS",
    mayaNumber: "0912 345 6789",
    bankName: "BPI",
    bankAccountName: "Yuhum Studios Inc.",
    bankAccountNumber: "1234-5678-90",
    downpaymentType: "full",
    paymentInstructions:
      "Please send proof of payment / screenshot to yuhumstudios22@gmail.com or via Instagram DM @yuhumstudios.",
  },
  cms: {
    bannerEnabled: false,
    bannerText: "✨ Welcome to Yuhum Studios! Book your self-shoot session today.",
    bannerTheme: "dark",
    maintenanceMode: false,
    maintenanceMessage:
      "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!",
  },
};

export function usePublicSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch(`${API_BASE}/api/public/settings`);
        if (!res.ok) throw new Error("Failed to fetch studio settings");
        const data = await res.json();
        if (isMounted && data.settings) {
          setSettings((prev) => ({
            ...DEFAULT_SETTINGS,
            ...data.settings,
            general: { ...DEFAULT_SETTINGS.general, ...(data.settings.general || {}) },
            schedule: {
              ...DEFAULT_SETTINGS.schedule,
              ...(data.settings.schedule || {}),
              blackoutDates: Array.isArray(data.settings.schedule?.blackoutDates)
                ? data.settings.schedule.blackoutDates
                : DEFAULT_SETTINGS.schedule.blackoutDates,
            },
            packages: {
              ...DEFAULT_SETTINGS.packages,
              ...(data.settings.packages || {}),
              addOns: Array.isArray(data.settings.packages?.addOns) && data.settings.packages.addOns.length > 0
                ? data.settings.packages.addOns
                : DEFAULT_SETTINGS.packages.addOns,
            },
            payments: { ...DEFAULT_SETTINGS.payments, ...(data.settings.payments || {}) },
            cms: { ...DEFAULT_SETTINGS.cms, ...(data.settings.cms || {}) },
          }));
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading, error };
}

