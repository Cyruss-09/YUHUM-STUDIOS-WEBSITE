import React, { useState, useMemo, useEffect } from "react";
import { usePublicSettings } from "../hooks/usePublicSettings";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Camera,
  CheckCircle2,
  AlertCircle,
  Heart,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5000";

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

const FAQ_ITEMS = [
  {
    q: "Do I need to book in advance?",
    a: "Yes, we recommend booking at least 1–2 days ahead to secure your preferred time slot and studio suite.",
  },
  {
    q: "Can I bring my pet to the shoot?",
    a: "Absolutely! Both Studio A and Studio B are pet-friendly. Just let us know beforehand so we can prep the space.",
  },
  {
    q: "How do I get my photos afterward?",
    a: "Instant digital copies are sent to your email right after your session, plus printed copies are available on request.",
  },
];

export const Footer = ({ setActiveLink }) => {
  const { settings } = usePublicSettings();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [copiedType, setCopiedType] = useState(null); // 'address' | 'phone' | 'email'
  const [openFaq, setOpenFaq] = useState(null); // index of open FAQ item
  const [showFaqPanel, setShowFaqPanel] = useState(false); // collapsed by default to keep footer compact
  const [now, setNow] = useState(new Date());

  // Live-ticking clock for the studio schedule card
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live availability based on studio schedule
  const availability = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = parseTimeToMinutes(settings.schedule?.openTime) ?? 10 * 60; // 10:00 AM
    const closeMinutes = parseTimeToMinutes(settings.schedule?.closeTime) ?? 18 * 60; // 6:00 PM

    const todayIso = now.toISOString().slice(0, 10);
    const isBlackout =
      Array.isArray(settings.schedule?.blackoutDates) &&
      settings.schedule.blackoutDates.includes(todayIso);

    const isOpenNow = !isBlackout && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return {
      isOpenNow,
      isBlackout,
      openTime: settings.schedule?.openTime || "10:00 AM",
      closeTime: settings.schedule?.closeTime || "06:00 PM",
      studioAActive: settings.schedule?.studioAActive !== false,
      studioBActive: settings.schedule?.studioBActive !== false,
    };
  }, [settings.schedule, now]);

  const liveTimeLabel = useMemo(
    () =>
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [now]
  );

  const handleNavigate = (pageKey) => {
    if (setActiveLink) {
      setActiveLink(pageKey);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!subscriberEmail || !subscriberEmail.includes("@")) {
      setNewsletterStatus("error");
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }

    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail.trim().toLowerCase() }),
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok) {
        setNewsletterStatus("success");
        setNewsletterMessage(data.message || "Thank you for subscribing! Check your inbox for updates.");
        setSubscriberEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data.error || data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setNewsletterStatus("error");
      setNewsletterMessage("Unable to connect to server. Please try again later.");
    }
  };

  const studioName = settings.general?.studioName || "Yuhum Studios";
  const phone = settings.general?.phone || "+63 912 345 6789";
  const email = settings.general?.contactEmail || "yuhumstudios22@gmail.com";
  const address = settings.general?.address || "Santa Rosa City, Laguna, Philippines";
  const mapsUrl =
    settings.general?.googleMapsUrl ||
    "https://maps.google.com/?q=The+Yuhum+Studios+Self-shoot+Santa+Rosa";

  return (
    <section className="w-full mt-auto relative overflow-hidden bg-[#fdfaf5] text-[#4a3a2c] font-sans border-t border-[#eadfd1]">
      {/* Subtle Warm Ambient Glow */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#A3704C]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── TOP AVAILABILITY & CTA BANNER ── */}
      <div className="border-b border-[#eadfd1] bg-gradient-to-r from-[#fbf3e8] via-[#fdfaf5] to-[#fbf3e8] px-6 py-3 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Availability Status Card */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div
              className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all duration-300 ${availability.isOpenNow
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : availability.isBlackout
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${availability.isOpenNow
                      ? "bg-emerald-400"
                      : availability.isBlackout
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${availability.isOpenNow
                      ? "bg-emerald-500"
                      : availability.isBlackout
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                ></span>
              </span>
              <span>
                {availability.isOpenNow
                  ? `Studio Open Today • ${availability.openTime} – ${availability.closeTime}`
                  : availability.isBlackout
                    ? "Studio Closed Today • Special Schedule"
                    : `Currently Closed • Reopens ${availability.openTime}`}
              </span>
            </div>

            {/* Studio Active Suites Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 text-xs text-[#7a6b5c] bg-white border border-[#eadfd1] px-3 py-1.5 rounded-full shadow-sm">
              <Camera size={13} className="text-[#A3704C]" />
              <span>
                {availability.studioAActive && availability.studioBActive
                  ? "Studio A & Studio B Ready"
                  : availability.studioAActive
                    ? "Studio A Suite Ready"
                    : "Studio B Suite Ready"}
              </span>
            </div>

            {/* Live clock pill */}
            <div className="hidden md:inline-flex items-center gap-2 text-xs text-[#7a6b5c] bg-white border border-[#eadfd1] px-3 py-1.5 rounded-full shadow-sm tabular-nums">
              <Clock size={13} className="text-[#A3704C]" />
              <span>{liveTimeLabel}</span>
            </div>
          </div>

          {/* Quick Booking CTA Action */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs text-[#7a6b5c] hidden sm:inline">
              Instant reservations & self-shoot slots available
            </span>
            <button
              onClick={() => handleNavigate("book")}
              className="inline-flex items-center gap-2 bg-[#A3704C] hover:bg-[#8B5E3C] text-white font-semibold px-5 py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
            >
              <Sparkles size={14} className="text-white" />
              <span>Book a Session</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER CONTENT GRID ── */}
      <footer className="w-full py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">

          {/* Column 1: Brand & Studio Info */}
          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#A3704C] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  YS
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3a2c20] tracking-wide">
                  {studioName}
                </h3>
              </div>
              <p className="text-[11px] font-medium text-[#A3704C] tracking-wider uppercase">
                Self-Shoot Studio & Creative Space
              </p>
            </div>

            <p className="text-xs text-[#7a6b5c] leading-relaxed max-w-sm">
              Crafting authentic, joyful photo memories in complete privacy with studio lighting, wireless clickers, and timeless backdrops.
            </p>

            {/* Studio Feature Highlight Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#eadfd1] text-[11px] text-[#5a4a3a] shadow-sm hover:border-[#A3704C]/50 transition-colors">
                <Camera size={11} className="text-[#A3704C]" />
                Pro Lighting
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#eadfd1] text-[11px] text-[#5a4a3a] shadow-sm hover:border-[#A3704C]/50 transition-colors">
                <Heart size={11} className="text-[#A3704C]" />
                Pet-Friendly
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#eadfd1] text-[11px] text-[#5a4a3a] shadow-sm hover:border-[#A3704C]/50 transition-colors">
                <Sparkles size={11} className="text-[#A3704C]" />
                Instant Copies
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-[#a89589] uppercase tracking-wider mb-1.5">
                Follow Our Stories
              </div>
              <div className="flex items-center gap-2.5">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/yuhum.studios/"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-[#eadfd1] hover:border-[#A3704C] text-[#7a6b5c] hover:text-white hover:bg-[#A3704C] shadow-sm transition-all duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/yuhum.studiosph"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-[#eadfd1] hover:border-[#A3704C] text-[#7a6b5c] hover:text-white hover:bg-[#A3704C] shadow-sm transition-all duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@yuhumstudios"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-[#eadfd1] hover:border-[#A3704C] text-[#7a6b5c] hover:text-white hover:bg-[#A3704C] shadow-sm transition-all duration-200"
                  aria-label="TikTok"
                >
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.95 1.2 2.27 2.05 3.75 2.4v3.91c-1.63-.04-3.23-.55-4.63-1.38-.41-.25-.8-.54-1.15-.87v7.24c0 1.2-.23 2.39-.7 3.5-1.07 2.53-3.44 4.31-6.18 4.61-3.15.34-6.32-1.21-7.72-4.08C.1 17.06-.23 14 1.01 11.23c1.07-2.38 3.33-4.08 5.92-4.43 1.15-.15 2.33-.06 3.45.24v4c-.81-.29-1.69-.36-2.54-.2-1.32.25-2.52 1.07-3.17 2.24-.77 1.38-.85 3.09-.23 4.54.62 1.45 1.96 2.53 3.52 2.76 1.48.22 3.03-.26 3.99-1.39.75-.89.98-2.09.98-3.24V.02z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Hours & Studio Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#3a2c20] uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3704C]"></span>
              Studio Schedule & Info
            </h4>

            {/* Operating Schedule Box */}
            <div className="rounded-xl bg-white border border-[#eadfd1] shadow-sm p-2.5 space-y-1.5">
              <div className="flex items-start gap-2.5 text-xs">
                <Clock size={14} className="text-[#A3704C] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#3a2c20] font-semibold">Operating Hours</div>
                  <div className="text-[#7a6b5c] text-[11px]">
                    Open Daily (Mon – Sun)
                  </div>
                  <div className="text-[#A3704C] font-medium text-xs mt-0.5">
                    {availability.openTime} – {availability.closeTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Contact Actions */}
            <div className="space-y-2 text-xs text-[#7a6b5c]">
              {/* Address with Map Link & Copy */}
              <div className="flex items-start gap-2 pt-0.5">
                <MapPin size={13} className="text-[#A3704C] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[#5a4a3a] text-[11px] leading-relaxed">
                    {address}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#A3704C] hover:text-[#8B5E3C] inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Google Maps</span>
                      <ExternalLink size={10} />
                    </a>
                    <button
                      onClick={() => handleCopy(address, "address")}
                      className="text-[11px] text-[#a89589] hover:text-[#3a2c20] inline-flex items-center gap-1 transition-colors"
                    >
                      {copiedType === "address" ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <Phone size={12} className="text-[#A3704C] shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-[#5a4a3a] hover:text-[#3a2c20] transition-colors truncate"
                >
                  {phone}
                </a>
                <button
                  onClick={() => handleCopy(phone, "phone")}
                  className="text-[#a89589] hover:text-[#3a2c20] inline-flex items-center gap-1 transition-colors ml-auto"
                >
                  {copiedType === "phone" ? (
                    <Check size={11} className="text-emerald-600" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-[11px]">
                <Mail size={12} className="text-[#A3704C] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-[#5a4a3a] hover:text-[#3a2c20] transition-colors truncate"
                >
                  {email}
                </a>
                <button
                  onClick={() => handleCopy(email, "email")}
                  className="text-[#a89589] hover:text-[#3a2c20] inline-flex items-center gap-1 transition-colors ml-auto"
                >
                  {copiedType === "email" ? (
                    <Check size={11} className="text-emerald-600" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable FAQ Panel — collapsed by default to keep the footer compact */}
            <div>
              <button
                onClick={() => setShowFaqPanel((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-[#eadfd1] bg-white shadow-sm px-3 py-2 text-[11px] font-semibold text-[#5a4a3a] hover:bg-[#fbf3e8] transition-colors"
                aria-expanded={showFaqPanel}
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle size={12} className="text-[#A3704C]" />
                  Quick Answers
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#A3704C] shrink-0 transition-transform duration-200 ${showFaqPanel ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`grid transition-all duration-200 ease-in-out ${showFaqPanel ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="rounded-xl border border-[#eadfd1] bg-white shadow-sm divide-y divide-[#f0e8db] overflow-hidden">
                    {FAQ_ITEMS.map((item, index) => {
                      const isOpen = openFaq === index;
                      return (
                        <div key={item.q}>
                          <button
                            onClick={() => toggleFaq(index)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left text-[11px] font-medium text-[#5a4a3a] hover:bg-[#fbf3e8] transition-colors"
                            aria-expanded={isOpen}
                          >
                            <span>{item.q}</span>
                            <ChevronDown
                              size={12}
                              className={`text-[#A3704C] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                }`}
                            />
                          </button>
                          <div
                            className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                              }`}
                          >
                            <div className="overflow-hidden">
                              <p className="px-3 pb-2 text-[11px] text-[#7a6b5c] leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Newsletter Sign-up */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#3a2c20] uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3704C]"></span>
              Stay Connected
            </h4>
            <p className="text-xs text-[#7a6b5c] leading-relaxed">
              Subscribe for exclusive studio promotions, flash discounts, and studio announcements.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={subscriberEmail}
                  onChange={(e) => {
                    setSubscriberEmail(e.target.value);
                    if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  className="w-full bg-white text-[#3a2c20] border border-[#eadfd1] focus:border-[#A3704C] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#A3704C] placeholder-[#b3a495] shadow-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={newsletterStatus === "loading"}
                className="w-full bg-[#A3704C] hover:bg-[#8B5E3C] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {newsletterStatus === "loading" ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Join Newsletter</span>
                  </>
                )}
              </button>
            </form>

            {/* Newsletter Status Alerts */}
            {newsletterStatus === "success" && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-[11px] leading-tight">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                <span>{newsletterMessage}</span>
              </div>
            )}

            {newsletterStatus === "error" && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-[11px] leading-tight">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{newsletterMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM BAR: COPYRIGHT & BACK TO TOP ── */}
        <div className="max-w-7xl mx-auto border-t border-[#eadfd1] mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-[#a89589] gap-3">
          <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left text-[11px]">
            <p>
              &copy; {new Date().getFullYear()} {studioName}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-[#d8c9b8]">•</span>
            <span className="text-[11px] text-[#7a6b5c]">Self-Shoot Experience</span>
          </div>

          {/* Interactive Back To Top Button */}
          <button
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#fbf3e8] border border-[#eadfd1] text-[#7a6b5c] hover:text-[#3a2c20] text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Scroll back to top of the page"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </footer>
    </section>
  );
};