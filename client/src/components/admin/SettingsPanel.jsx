// client/src/components/admin/SettingsPanel.jsx
import { useState, useEffect } from "react";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import { useAuth } from "../../context/AuthContext";

const SUB_TABS = [
  { id: "studio", label: "Studio & Schedule", icon: "🕒" },
  { id: "pricing", label: "Packages & Add-ons", icon: "🏷️" },
  { id: "promos", label: "Promo Codes", icon: "🎟️" },
  { id: "payments", label: "Payments & GCash", icon: "💳" },
  { id: "cms", label: "Website & Banner", icon: "📢" },
  { id: "security", label: "Security & System", icon: "🔒" },
];

export default function SettingsPanel({ initialSubTab = "studio" }) {
  const { user } = useAuth();
  const {
    settings,
    setSettings,
    loading,
    saving,
    error,
    saveSettings,
    promoCodes,
    promoLoading,
    createPromoCode,
    togglePromoCode,
    deletePromoCode,
    changePassword,
    exportBookingsCsv,
  } = useAdminSettings();

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const isBannerLive = Boolean(settings.cms?.bannerEnabled ?? settings.cms?.bannerActive);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'

  // New Blackout Date Input
  const [newBlackoutDate, setNewBlackoutDate] = useState("");

  // Promo Code Form State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_spend: "",
    max_uses: "",
    expires_at: "",
  });

  // Password Change State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveSettings = async () => {
    const res = await saveSettings(settings);
    if (res.success) {
      showToast("Studio settings saved successfully!");
    } else {
      showToast(res.error || "Failed to save settings", "error");
    }
  };

  // Blackout date handlers
  const handleAddBlackoutDate = () => {
    if (!newBlackoutDate) return;
    const currentDates = settings.schedule?.blackoutDates || [];
    if (currentDates.includes(newBlackoutDate)) {
      showToast("Date is already in the blackout list", "error");
      return;
    }
    const updated = [...currentDates, newBlackoutDate].sort();
    setSettings((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, blackoutDates: updated },
    }));
    setNewBlackoutDate("");
  };

  const handleRemoveBlackoutDate = (dateToRemove) => {
    const updated = (settings.schedule?.blackoutDates || []).filter(
      (d) => d !== dateToRemove
    );
    setSettings((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, blackoutDates: updated },
    }));
  };

  // Promo Form Submit
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code || !promoForm.discount_value) {
      showToast("Please provide promo code and discount value", "error");
      return;
    }
    const res = await createPromoCode(promoForm);
    if (res.success) {
      showToast(`Promo code ${promoForm.code.toUpperCase()} created!`);
      setPromoForm({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_spend: "",
        max_uses: "",
        expires_at: "",
      });
      setIsPromoModalOpen(false);
    } else {
      showToast(res.error || "Failed to create promo code", "error");
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdFeedback(null);
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdFeedback({ type: "error", message: "New passwords do not match" });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdFeedback({
        type: "error",
        message: "New password must be at least 6 characters",
      });
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(
      pwdForm.currentPassword,
      pwdForm.newPassword
    );
    setPwdLoading(false);
    if (res.success) {
      setPwdFeedback({
        type: "success",
        message: "Password updated successfully!",
      });
      setPwdForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Admin password changed successfully!");
    } else {
      setPwdFeedback({
        type: "error",
        message: res.error || "Failed to update password",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full mb-4"></div>
        <p className="font-medium text-sm">Loading studio configurations…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all transform animate-bounce duration-300 ${toastType === "success"
            ? "bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20"
            : "bg-red-900 text-white border-red-700 shadow-red-950/20"
            }`}
        >
          <span>{toastType === "success" ? "✅" : "⚠️"}</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Studio Settings & Configurations
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your schedule, dynamic package pricing, promo codes, and
            system preferences.
          </p>
        </div>

        {activeSubTab !== "promos" && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black shadow-md shadow-black/10 dark:shadow-none transition-all hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full"></div>
                Saving…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-700 pb-2">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${isActive
                ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Studio & Schedule */}
      {activeSubTab === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* General Information */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏢</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Studio Contact & Info
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Studio Name
              </label>
              <input
                type="text"
                value={settings.general?.studioName ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, studioName: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general?.contactEmail ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        contactEmail: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Phone / Mobile
                </label>
                <input
                  type="text"
                  value={settings.general?.phone ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Studio Address
              </label>
              <input
                type="text"
                value={settings.general?.address ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, address: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
              />
            </div>
          </div>

          {/* Operating Hours & Room Toggles */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕒</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Operating Hours & Rooms
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={settings.schedule?.openTime ?? "10:00 AM"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        openTime: e.target.value,
                      },
                    })
                  }
                  placeholder="10:00 AM"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={settings.schedule?.closeTime ?? "06:00 PM"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        closeTime: e.target.value,
                      },
                    })
                  }
                  placeholder="06:00 PM"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Slot Interval (mins)
                </label>
                <input
                  type="number"
                  value={settings.schedule?.slotDurationMinutes ?? 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        slotDurationMinutes: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Reset Buffer (mins)
                </label>
                <input
                  type="number"
                  value={settings.schedule?.bufferMinutes ?? 15}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        bufferMinutes: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
            </div>

            {/* Room Availability */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                Studio Room Availability
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.schedule?.studioAActive ?? true}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        schedule: {
                          ...settings.schedule,
                          studioAActive: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-black focus:ring-black dark:bg-gray-800 dark:border-gray-600"
                  />
                  <span>Studio A (Active)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.schedule?.studioBActive ?? true}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        schedule: {
                          ...settings.schedule,
                          studioBActive: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-black focus:ring-black dark:bg-gray-800 dark:border-gray-600"
                  />
                  <span>Studio B (Active)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Blackout / Blocked Dates */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚫</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Blackout / Closed Studio Dates
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Dates selected here will be blocked on the public booking
                    calendar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newBlackoutDate}
                  onChange={(e) => setNewBlackoutDate(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
                <button
                  type="button"
                  onClick={handleAddBlackoutDate}
                  className="rounded-xl bg-black dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  + Add Date
                </button>
              </div>
            </div>

            {/* List of blocked dates */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(settings.schedule?.blackoutDates || []).length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                  No blackout dates set. All calendar days within schedule are
                  open.
                </p>
              ) : (
                settings.schedule.blackoutDates.map((dateStr) => (
                  <span
                    key={dateStr}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400"
                  >
                    📅 {dateStr}
                    <button
                      type="button"
                      onClick={() => handleRemoveBlackoutDate(dateStr)}
                      className="hover:text-red-900 dark:hover:text-red-200 font-bold ml-1 text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Packages & Pricing */}
      {activeSubTab === "pricing" && (
        <div className="flex flex-col gap-6 pt-2">
          {/* Main Packages Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Kadlaw Package
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Self-portrait session (Up to 4 pax)
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800">
                  Standard
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Base Price (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={settings.packages?.kadlawPrice ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        packages: {
                          ...settings.packages,
                          kadlawPrice: val,
                        },
                      });
                    }}
                    placeholder="1000"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Gugma Package
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Groups & Families session (Up to 5 pax)
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-800">
                  Premium
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  Base Price (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={settings.packages?.gugmaPrice ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                      setSettings({
                        ...settings,
                        packages: {
                          ...settings.packages,
                          gugmaPrice: val,
                        },
                      });
                    }}
                    placeholder="1499"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Pricing Editor */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                Add-on Services & Rates
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adjust rates for extra persons, pets, prints, and studio
                services.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {(settings.packages?.addOns || []).map((addon, idx) => (
                <div
                  key={addon.key}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between gap-2 shadow-sm"
                >
                  <div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block">
                      {addon.label}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                      {addon.key}
                    </span>
                  </div>

                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      ₱
                    </span>
                    <input
                      type="number"
                      value={addon.price ?? ""}
                      onChange={(e) => {
                        const newAddOns = [...settings.packages.addOns];
                        newAddOns[idx] = {
                          ...addon,
                          price: e.target.value === "" ? "" : parseFloat(e.target.value),
                        };
                        setSettings({
                          ...settings,
                          packages: { ...settings.packages, addOns: newAddOns },
                        });
                      }}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 pl-7 pr-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Promo Codes */}
      {activeSubTab === "promos" && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                Discount Promo Codes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create coupon codes for marketing campaigns and holiday promos.
              </p>
            </div>

            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-black dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              + Create Promo Code
            </button>
          </div>

          {/* Promo Codes Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Code</th>
                  <th className="text-left px-4 py-3 font-semibold">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold">Max Uses</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {promoLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                      Loading promo codes…
                    </td>
                  </tr>
                ) : !Array.isArray(promoCodes) || promoCodes.filter(Boolean).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                      No active promo codes. Click "+ Create Promo Code" above to add one.
                    </td>
                  </tr>
                ) : (
                  promoCodes.filter(Boolean).map((p, index) => (
                    <tr key={p?.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-gray-100">
                        {p?.code || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {p?.discount_type === "percentage"
                          ? `${p?.discount_value}% OFF`
                          : `₱${p?.discount_value} OFF`}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {p?.max_uses ? `${p?.used_count || 0} / ${p?.max_uses}` : "Unlimited"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePromoCode(p?.id, p?.is_active)}
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p?.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                            }`}
                        >
                          {p?.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deletePromoCode(p?.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Promo Modal */}
          {isPromoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create New Promo Code</h3>
                <form onSubmit={handleCreatePromo} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Promo Code</label>
                    <input
                      type="text"
                      required
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER2026"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Discount Type</label>
                      <select
                        value={promoForm.discount_type}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 px-3.5 py-2 text-sm"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₱)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Value</label>
                      <input
                        type="number"
                        required
                        value={promoForm.discount_value}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                        placeholder="e.g. 10 or 100"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Max Uses</label>
                      <input
                        type="number"
                        value={promoForm.max_uses}
                        onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                        placeholder="Optional"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">Expires At</label>
                      <input
                        type="date"
                        value={promoForm.expires_at}
                        onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 px-3.5 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsPromoModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white text-xs font-semibold text-white dark:text-black"
                    >
                      Save Promo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Payments & GCash */}
      {activeSubTab === "payments" && (
        <div className="flex flex-col gap-6 pt-2">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                GCash & Online Payment Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  GCash Account Name
                </label>
                <input
                  type="text"
                  value={settings.payments?.gcashAccountName ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, gcashAccountName: e.target.value },
                    })
                  }
                  placeholder="e.g. Studio Admin"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                  GCash Number
                </label>
                <input
                  type="text"
                  value={settings.payments?.gcashNumber ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, gcashNumber: e.target.value },
                    })
                  }
                  placeholder="e.g. 0917XXXXXXX"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">
                Payment Instructions / Notes
              </label>
              <textarea
                rows={3}
                value={settings.payments?.instructions ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: { ...settings.payments, instructions: e.target.value },
                  })
                }
                placeholder="Instructions shown to customers at checkout..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Website & Banner */}
      {activeSubTab === "cms" && (
        <div className="flex flex-col gap-6 pt-2">
          {/* Card 1: Announcement Banner Configuration */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 dark:border-gray-700/60 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📢</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Announcement Banner
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display an animated announcement marquee across the top of the client landing page.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isBannerLive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {isBannerLive ? "● Active on Client Site" : "○ Hidden"}
                </span>
              </div>
            </div>

            {/* Banner Toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={Boolean(settings.cms?.bannerEnabled ?? settings.cms?.bannerActive ?? false)}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSettings({
                    ...settings,
                    cms: {
                      ...settings.cms,
                      bannerEnabled: val,
                      bannerActive: val,
                    },
                  });
                }}
                className="h-4 w-4 rounded text-black focus:ring-black dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Enable Announcement Banner
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  When enabled, visitors will see the scrolling marquee banner on the client page.
                </span>
              </div>
            </label>

            {/* Banner Message Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Banner Message Text
              </label>
              <input
                type="text"
                value={settings.cms?.bannerText ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cms: { ...settings.cms, bannerText: e.target.value },
                  })
                }
                placeholder="e.g. ✨ Special weekend discount! Use code YUHUM10 for 10% off."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Color Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: "dark",
                    label: "Dark Charcoal",
                    desc: "Classic & Sleek",
                    chipBg: "bg-stone-900 border-stone-700 text-white",
                  },
                  {
                    id: "amber",
                    label: "Warm Amber",
                    desc: "Studio Earthy",
                    chipBg: "bg-[#4a2e18] border-[#3d2412] text-amber-100",
                  },
                  {
                    id: "emerald",
                    label: "Emerald Forest",
                    desc: "Lush & Fresh",
                    chipBg: "bg-emerald-950 border-emerald-800 text-emerald-100",
                  },
                  {
                    id: "blue",
                    label: "Slate Blue",
                    desc: "Modern Calm",
                    chipBg: "bg-slate-900 border-slate-700 text-sky-100",
                  },
                ].map((t) => {
                  const isSelected = (settings.cms?.bannerTheme || "dark") === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          cms: { ...settings.cms, bannerTheme: t.id },
                        })
                      }
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 bg-white dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full border shadow-xs ${t.chipBg}`} />
                        {isSelected && (
                          <span className="text-xs font-bold text-black dark:text-white">✓</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {t.label}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Live Banner Preview
                </label>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                  Exact preview on client page
                </span>
              </div>

              {isBannerLive ? (
                <div
                  className={`w-full py-3.5 rounded-xl border overflow-hidden shadow-inner relative transition-colors duration-300 ${
                    {
                      dark: "bg-stone-900 text-stone-100 border-stone-800",
                      amber: "bg-[#4a2e18] text-amber-100 border-[#3d2412]",
                      emerald: "bg-emerald-950 text-emerald-100 border-emerald-900",
                      blue: "bg-slate-900 text-sky-100 border-slate-800",
                    }[settings.cms?.bannerTheme || "dark"]
                  }`}
                >
                  <div className="flex whitespace-nowrap animate-marquee">
                    <span className="text-xs md:text-sm font-medium tracking-wide px-6">
                      {settings.cms?.bannerText || "✨ Welcome to Yuhum Studios! Book your self-shoot session today."}
                    </span>
                    <span className="text-xs md:text-sm font-medium tracking-wide px-6">
                      {settings.cms?.bannerText || "✨ Welcome to Yuhum Studios! Book your self-shoot session today."}
                    </span>
                    <span className="text-xs md:text-sm font-medium tracking-wide px-6">
                      {settings.cms?.bannerText || "✨ Welcome to Yuhum Studios! Book your self-shoot session today."}
                    </span>
                    <span className="text-xs md:text-sm font-medium tracking-wide px-6">
                      {settings.cms?.bannerText || "✨ Welcome to Yuhum Studios! Book your self-shoot session today."}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full py-5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                  Banner is currently disabled. Check &quot;Enable Announcement Banner&quot; above to preview.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Maintenance Notice Configuration */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 dark:border-gray-700/60 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🛠️</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Maintenance Mode Notice
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display a maintenance alert box on the landing and booking pages.
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  settings.cms?.maintenanceMode
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {settings.cms?.maintenanceMode ? "● Maintenance Active" : "○ Normal Operation"}
              </span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={settings.cms?.maintenanceMode ?? false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cms: { ...settings.cms, maintenanceMode: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded text-black focus:ring-black dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Enable Maintenance Mode Notice
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Alerts clients that booking or system services are temporarily under maintenance.
                </span>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Maintenance Notice Message
              </label>
              <textarea
                rows={2}
                value={settings.cms?.maintenanceMessage ?? ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cms: { ...settings.cms, maintenanceMessage: e.target.value },
                  })
                }
                placeholder="Our booking system is currently undergoing scheduled maintenance. We will be back shortly!"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-black dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-black shadow-md shadow-black/10 dark:shadow-none transition-all hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full" />
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Website & Banner Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Security & System */}
      {activeSubTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Change Password */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Change Admin Password
              </h3>
            </div>

            {pwdFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${pwdFeedback.type === "success"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                  }`}
              >
                {pwdFeedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 px-3.5 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="mt-2 rounded-xl bg-black dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
              >
                {pwdLoading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          </div>

          {/* Data Export / System Backup */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                System Data Export
              </h3>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Download your full booking history and customer details as a CSV file for backup or accounting purposes.
            </p>

            <button
              type="button"
              onClick={exportBookingsCsv}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              📥 Export Bookings CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}