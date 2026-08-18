// client/src/components/admin/SettingsPanel.jsx
import { useState } from "react";
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

export default function SettingsPanel() {
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

  const [activeSubTab, setActiveSubTab] = useState("studio");
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
    const currentDates = settings.schedule.blackoutDates || [];
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
    const updated = (settings.schedule.blackoutDates || []).filter(
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
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mb-4"></div>
        <p className="font-medium text-sm">Loading studio configurations…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all transform animate-bounce duration-300 ${
            toastType === "success"
              ? "bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20"
              : "bg-red-900 text-white border-red-700 shadow-red-950/20"
          }`}
        >
          <span>{toastType === "success" ? "✅" : "⚠️"}</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Studio Settings & Configurations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your schedule, dynamic package pricing, promo codes, and
            system preferences.
          </p>
        </div>

        {activeSubTab !== "promos" && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition-all hover:bg-gray-800 disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
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
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 pb-2">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏢</span>
              <h3 className="font-semibold text-gray-900">
                Studio Contact & Info
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Studio Name
              </label>
              <input
                type="text"
                value={settings.general?.studioName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, studioName: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general?.contactEmail || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        contactEmail: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Phone / Mobile
                </label>
                <input
                  type="text"
                  value={settings.general?.phone || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Studio Address
              </label>
              <input
                type="text"
                value={settings.general?.address || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, address: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          {/* Operating Hours & Room Toggles */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕒</span>
              <h3 className="font-semibold text-gray-900">
                Operating Hours & Rooms
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={settings.schedule?.openTime || "10:00 AM"}
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={settings.schedule?.closeTime || "06:00 PM"}
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Slot Interval (mins)
                </label>
                <input
                  type="number"
                  value={settings.schedule?.slotDurationMinutes || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        slotDurationMinutes: parseInt(e.target.value, 10) || 30,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Reset Buffer (mins)
                </label>
                <input
                  type="number"
                  value={settings.schedule?.bufferMinutes || 15}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schedule: {
                        ...settings.schedule,
                        bufferMinutes: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {/* Room Availability */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                Studio Room Availability
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
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
                    className="h-4 w-4 rounded text-black focus:ring-black"
                  />
                  <span>Studio A (Active)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
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
                    className="h-4 w-4 rounded text-black focus:ring-black"
                  />
                  <span>Studio B (Active)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Blackout / Blocked Dates */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚫</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Blackout / Closed Studio Dates
                  </h3>
                  <p className="text-xs text-gray-500">
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
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="button"
                  onClick={handleAddBlackoutDate}
                  className="rounded-xl bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  + Add Date
                </button>
              </div>
            </div>

            {/* List of blocked dates */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(settings.schedule?.blackoutDates || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No blackout dates set. All calendar days within schedule are
                  open.
                </p>
              ) : (
                settings.schedule.blackoutDates.map((dateStr) => (
                  <span
                    key={dateStr}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700"
                  >
                    📅 {dateStr}
                    <button
                      type="button"
                      onClick={() => handleRemoveBlackoutDate(dateStr)}
                      className="hover:text-red-900 font-bold ml-1 text-sm"
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
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Kadlaw Package
                  </h3>
                  <p className="text-xs text-gray-500">
                    Self-portrait session (Up to 4 pax)
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  Standard
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Base Price (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={settings.packages?.kadlawPrice || 649}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        packages: {
                          ...settings.packages,
                          kadlawPrice: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Gugma Package
                  </h3>
                  <p className="text-xs text-gray-500">
                    Groups & Families session (Up to 5 pax)
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-purple-50 text-purple-800 rounded-full border border-purple-200">
                  Premium
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Base Price (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    value={settings.packages?.gugmaPrice || 1499}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        packages: {
                          ...settings.packages,
                          gugmaPrice: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Pricing Editor */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Add-on Services & Rates
              </h3>
              <p className="text-xs text-gray-500">
                Adjust rates for extra persons, pets, prints, and studio
                services.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {(settings.packages?.addOns || []).map((addon, idx) => (
                <div
                  key={addon.key}
                  className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between gap-2 shadow-sm"
                >
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">
                      {addon.label}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {addon.key}
                    </span>
                  </div>

                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-500 text-xs">
                      ₱
                    </span>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => {
                        const newAddOns = [...settings.packages.addOns];
                        newAddOns[idx] = {
                          ...addon,
                          price: parseFloat(e.target.value) || 0,
                        };
                        setSettings({
                          ...settings,
                          packages: { ...settings.packages, addOns: newAddOns },
                        });
                      }}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-7 pr-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
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
              <h3 className="font-bold text-gray-900 text-base">
                Discount Promo Codes
              </h3>
              <p className="text-xs text-gray-500">
                Create coupon codes for marketing campaigns and holiday promos.
              </p>
            </div>

            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              + Create Promo Code
            </button>
          </div>

          {/* Promo Codes Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Code</th>
                  <th className="text-left px-4 py-3 font-semibold">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold">Max Uses</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promoLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                      Loading promo codes…
                    </td>
                  </tr>
                ) : promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                      No active promo codes. Click "+ Create Promo Code" above to add one.
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.discount_type === "percentage"
                          ? `${p.discount_value}% OFF`
                          : `₱${p.discount_value} OFF`}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.max_uses ? `${p.used_count || 0} / ${p.max_uses}` : "Unlimited"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePromoCode(p.id)}
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            p.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deletePromoCode(p.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800"
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

          {/* Create Promo Modal */}
          {isPromoModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">New Promo Voucher</h3>
                  <button
                    onClick={() => setIsPromoModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreatePromo} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. YUHUM10"
                      value={promoForm.code}
                      onChange={(e) =>
                        setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm uppercase font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={promoForm.discount_type}
                        onChange={(e) =>
                          setPromoForm({ ...promoForm, discount_type: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₱)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Discount Value
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 10 or 100"
                        value={promoForm.discount_value}
                        onChange={(e) =>
                          setPromoForm({ ...promoForm, discount_value: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Max Redemptions
                      </label>
                      <input
                        type="number"
                        placeholder="Leave blank for unlimited"
                        value={promoForm.max_uses}
                        onChange={(e) =>
                          setPromoForm({ ...promoForm, max_uses: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={promoForm.expires_at}
                        onChange={(e) =>
                          setPromoForm({ ...promoForm, expires_at: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsPromoModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-black text-white rounded-xl hover:bg-gray-800"
                    >
                      Save Promo Code
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* GCash & Maya Settings */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <h3 className="font-semibold text-gray-900">
                E-Wallet Accounts (GCash & Maya)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  GCash Account Name
                </label>
                <input
                  type="text"
                  value={settings.payments?.gcashName || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, gcashName: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  GCash Mobile Number
                </label>
                <input
                  type="text"
                  value={settings.payments?.gcashNumber || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: {
                        ...settings.payments,
                        gcashNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Maya Account Name
                </label>
                <input
                  type="text"
                  value={settings.payments?.mayaName || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, mayaName: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Maya Mobile Number
                </label>
                <input
                  type="text"
                  value={settings.payments?.mayaNumber || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, mayaNumber: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Deposit Rules & Instructions */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h3 className="font-semibold text-gray-900">
                Deposit Policy & Bank Details
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Payment Requirement Mode
              </label>
              <select
                value={settings.payments?.downpaymentType || "full"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      downpaymentType: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium"
              >
                <option value="full">100% Full Payment Required</option>
                <option value="half">50% Downpayment Deposit</option>
                <option value="onsite">Pay Upon Arrival / Studio Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Customer Payment Instructions Note
              </label>
              <textarea
                rows={3}
                value={settings.payments?.paymentInstructions || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: {
                      ...settings.payments,
                      paymentInstructions: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Website CMS & Banner */}
      {activeSubTab === "cms" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Announcement Banner */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <h3 className="font-semibold text-gray-900">
                  Homepage Announcement Bar
                </h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cms?.bannerEnabled ?? false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cms: { ...settings.cms, bannerEnabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Banner Message
              </label>
              <input
                type="text"
                value={settings.cms?.bannerText || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cms: { ...settings.cms, bannerText: e.target.value },
                  })
                }
                placeholder="e.g. ✨ Book now for 10% off using code LOVE2026!"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Banner Accent Style
              </label>
              <div className="flex gap-2">
                {["dark", "amber", "emerald", "blue"].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        cms: { ...settings.cms, bannerTheme: theme },
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border ${
                      (settings.cms?.bannerTheme || "dark") === theme
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛠️</span>
                <h3 className="font-semibold text-gray-900">
                  Maintenance Mode
                </h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cms?.maintenanceMode ?? false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cms: { ...settings.cms, maintenanceMode: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <p className="text-xs text-gray-500">
              When enabled, public booking will show a temporary offline notice.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                Maintenance Notice
              </label>
              <textarea
                rows={2}
                value={settings.cms?.maintenanceMessage || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cms: {
                      ...settings.cms,
                      maintenanceMessage: e.target.value,
                    },
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Security & System Diagnostics */}
      {activeSubTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Admin Password Change Form */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <h3 className="font-semibold text-gray-900">
                Change Admin Password
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              {pwdFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    pwdFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {pwdFeedback.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, currentPassword: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, newPassword: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) =>
                    setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="mt-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {pwdLoading ? "Updating Password…" : "Update Password"}
              </button>
            </form>
          </div>

          {/* System Status & Data Export */}
          <div className="flex flex-col gap-6">
            {/* System Status Box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-semibold text-gray-900">
                  System & Integration Status
                </h3>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200/60 text-xs">
                <span className="text-gray-600">PostgreSQL Database</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200/60 text-xs">
                <span className="text-gray-600">Resend Email Gateway</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-gray-600">Active Admin Account</span>
                <span className="font-mono text-gray-900 font-medium">
                  {user?.email || "admin@yuhum.com"}
                </span>
              </div>
            </div>

            {/* CSV Data Export Box */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h3 className="font-semibold text-gray-900">
                  Data Backup & Export
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Download a clean spreadsheet format (CSV) of all studio bookings
                for accounting, reports, and backup.
              </p>

              <button
                onClick={exportBookingsCsv}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export All Bookings to CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
