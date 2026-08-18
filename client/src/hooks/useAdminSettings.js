// client/src/hooks/useAdminSettings.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

const DEFAULT_SETTINGS = {
  general: {
    studioName: "Yuhum Studios",
    contactEmail: "yuhumstudios22@gmail.com",
    phone: "+63 912 345 6789",
    address: "Iloilo City, Philippines",
    googleMapsUrl: "https://maps.google.com",
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
    paymentInstructions: "Please send proof of payment / screenshot to yuhumstudios22@gmail.com or via Instagram DM @yuhumstudios.",
  },
  cms: {
    bannerEnabled: false,
    bannerText: "✨ Welcome to Yuhum Studios! Book your self-shoot session today.",
    bannerTheme: "dark",
    maintenanceMode: false,
    maintenanceMessage: "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!",
  },
};

export function useAdminSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [promoCodes, setPromoCodes] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      if (data.settings) {
        setSettings((prev) => ({
          ...DEFAULT_SETTINGS,
          ...data.settings,
          general: { ...DEFAULT_SETTINGS.general, ...(data.settings.general || {}) },
          schedule: { ...DEFAULT_SETTINGS.schedule, ...(data.settings.schedule || {}) },
          packages: { ...DEFAULT_SETTINGS.packages, ...(data.settings.packages || {}) },
          payments: { ...DEFAULT_SETTINGS.payments, ...(data.settings.payments || {}) },
          cms: { ...DEFAULT_SETTINGS.cms, ...(data.settings.cms || {}) },
        }));
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Promo Codes
  const fetchPromoCodes = useCallback(async () => {
    if (!token) return;
    setPromoLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load promo codes");
      const data = await res.json();
      setPromoCodes(data.promoCodes || []);
    } catch (err) {
      console.error("Error fetching promo codes:", err);
    } finally {
      setPromoLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
    fetchPromoCodes();
  }, [fetchSettings, fetchPromoCodes]);

  // Save Settings
  const saveSettings = async (updatedSettings) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: updatedSettings }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to save settings");
      }
      setSettings(updatedSettings);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  // Promo Code Operations
  const createPromoCode = async (promoData) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/promo-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(promoData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create promo code");
      setPromoCodes((prev) => [data.promoCode, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const togglePromoCode = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/promo-codes/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle promo code");
      setPromoCodes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: data.promoCode.is_active } : p))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deletePromoCode = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete promo code");
      }
      setPromoCodes((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Admin Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Export Bookings CSV
  const exportBookingsCsv = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/export/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export bookings");
      const data = await res.json();
      const bookings = data.bookings || [];

      if (bookings.length === 0) {
        alert("No bookings available to export.");
        return;
      }

      // Convert bookings array to CSV format
      const headers = [
        "Booking ID",
        "Customer Name",
        "Email",
        "Phone",
        "Package",
        "Studio",
        "Date",
        "Time",
        "Base Price",
        "Payment Mode",
        "Promo Code",
        "Created At",
      ];

      const rows = bookings.map((b) => [
        b.id,
        `"${((b.firstName || "") + " " + (b.lastName || "")).trim()}"`,
        `"${b.email || ""}"`,
        `"${b.phone || ""}"`,
        `"${b.package_title || b.package_id || ""}"`,
        `"${b.studio || ""}"`,
        `"${b.booking_date || ""}"`,
        `"${b.booking_time || ""}"`,
        `"${b.base_price || ""}"`,
        `"${b.paymentMode || ""}"`,
        `"${b.couponCode || ""}"`,
        `"${new Date(b.created_at).toLocaleString()}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `yuhum-bookings-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      alert("Error exporting CSV: " + err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    saveSettings,
    refetchSettings: fetchSettings,
    promoCodes,
    promoLoading,
    createPromoCode,
    togglePromoCode,
    deletePromoCode,
    changePassword,
    exportBookingsCsv,
  };
}
