import React, { useState, useMemo, useEffect } from "react";
import { usePublicSettings } from "../hooks/usePublicSettings";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
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
    a: "Yes — book at least 1–2 days ahead to get your preferred time and studio suite.",
  },
  {
    q: "Can I bring my pet to the shoot?",
    a: "Of course. Both suites are pet-friendly — just let us know beforehand so we can prep the space.",
  },
  {
    q: "How do I get my photos afterward?",
    a: "Digital copies land in your email right after the session. Prints are available on request.",
  },
];

export const Footer = ({ setActiveLink }) => {
  const { settings } = usePublicSettings();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [copiedType, setCopiedType] = useState(null); // 'address' | 'phone' | 'email'
  const [openFaq, setOpenFaq] = useState(null);
  const [showFaq, setShowFaq] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live-ticking clock so "open now" stays accurate without a refresh
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const availability = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = parseTimeToMinutes(settings.schedule?.openTime) ?? 10 * 60;
    const closeMinutes = parseTimeToMinutes(settings.schedule?.closeTime) ?? 18 * 60;

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

  const suiteLabel = availability.studioAActive && availability.studioBActive
    ? "Both suites ready today"
    : availability.studioAActive
      ? "Studio A ready today"
      : availability.studioBActive
        ? "Studio B ready today"
        : "Booking by request today";

  const handleNavigate = (pageKey) => {
    if (setActiveLink) setActiveLink(pageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
        setNewsletterMessage(data.message || "You're on the list — check your inbox.");
        setSubscriberEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data.error || data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setNewsletterStatus("error");
      setNewsletterMessage("Couldn't reach the server. Please try again later.");
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
    <section className="w-full mt-auto bg-[#FBF9F5] text-[#2C221E] font-sans border-t border-[#E8DFD1]">
      {/* Slim status + booking bar */}
      <div className="border-b border-[#E8DFD1] px-6 py-3 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <p className="text-[#7A6B63] leading-relaxed">
            <span
              className={`inline-block h-[7px] w-[7px] rounded-full mr-1.5 align-middle ${availability.isOpenNow ? "bg-emerald-500" : availability.isBlackout ? "bg-amber-500" : "bg-[#c98a5a]"
                }`}
            />
            {availability.isBlackout
              ? "Closed today for a private booking"
              : availability.isOpenNow
                ? `Open now until ${availability.closeTime}`
                : `Closed — opens ${availability.openTime}`}
            <span className="text-[#B3A594]"> · </span>
            {suiteLabel}
          </p>

          <button
            onClick={() => handleNavigate("book")}
            className="inline-flex items-center justify-center bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium px-5 py-2 rounded-full text-xs transition-colors"
          >
            Book a session
          </button>
        </div>
      </div>

      {/* Main content */}
      <footer className="w-full py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-8">

          {/* Brand column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-[#A3704C] flex items-center justify-center text-white font-semibold text-xs">
                YS
              </div>
              <h3 className="font-serif text-xl text-[#2C221E] tracking-wide">{studioName}</h3>
            </div>

            <p className="text-sm text-[#7A6B63] leading-relaxed max-w-sm">
              A self-shoot studio for photos you actually want to keep — your own timer, your own
              pace, no photographer looking over your shoulder. Pro lighting and a wireless clicker
              are already set up when you walk in, and pet-friendly suites mean the whole family can
              join.
            </p>

            <div className="flex items-center gap-4 pt-1 text-sm text-[#7A6B63]">
              <a
                href="https://www.instagram.com/yuhum.studios/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#A3704C] transition-colors underline decoration-[#E8DFD1] underline-offset-4 hover:decoration-[#A3704C]"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/yuhum.studiosph"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#A3704C] transition-colors underline decoration-[#E8DFD1] underline-offset-4 hover:decoration-[#A3704C]"
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@yuhumstudios"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#A3704C] transition-colors underline decoration-[#E8DFD1] underline-offset-4 hover:decoration-[#A3704C]"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Visit column */}
          <div className="md:col-span-4 md:border-l md:border-[#E8DFD1] md:pl-10 space-y-5">
            <div>
              <h4 className="text-sm font-medium text-[#2C221E] mb-2">Visit the studio</h4>
              <div className="flex items-start gap-2 text-sm text-[#5a4a3a]">
                <MapPin size={15} className="text-[#A3704C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="leading-relaxed">{address}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#A3704C] hover:text-[#8C5A35] inline-flex items-center gap-1"
                    >
                      Get directions <ExternalLink size={10} />
                    </a>
                    <button
                      onClick={() => handleCopy(address, "address")}
                      className="text-[#a89589] hover:text-[#2C221E] inline-flex items-center gap-1"
                    >
                      {copiedType === "address" ? (
                        <>
                          <Check size={11} className="text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#5a4a3a] mt-3">
                Open daily, {availability.openTime} – {availability.closeTime}
              </p>

              <div className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-[#5a4a3a]">
                  <Phone size={13} className="text-[#A3704C] shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-[#2C221E] transition-colors">
                    {phone}
                  </a>
                  <button
                    onClick={() => handleCopy(phone, "phone")}
                    className="text-[#a89589] hover:text-[#2C221E] ml-auto"
                    aria-label="Copy phone number"
                  >
                    {copiedType === "phone" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[#5a4a3a]">
                  <Mail size={13} className="text-[#A3704C] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-[#2C221E] transition-colors truncate">
                    {email}
                  </a>
                  <button
                    onClick={() => handleCopy(email, "email")}
                    className="text-[#a89589] hover:text-[#2C221E] ml-auto"
                    aria-label="Copy email address"
                  >
                    {copiedType === "email" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <button
                onClick={() => setShowFaq((prev) => !prev)}
                className="text-sm text-[#A3704C] hover:text-[#8C5A35] underline decoration-[#E8DFD1] underline-offset-4"
              >
                {showFaq ? "Hide common questions" : "Common questions"}
              </button>

              {showFaq && (
                <div className="mt-2 divide-y divide-[#E8DFD1] border-t border-[#E8DFD1]">
                  {FAQ_ITEMS.map((item, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={item.q} className="py-2">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between gap-3 text-left text-sm text-[#5a4a3a]"
                        >
                          <span>{item.q}</span>
                          <span className="text-[#A3704C] text-base leading-none shrink-0">
                            {isOpen ? "–" : "+"}
                          </span>
                        </button>
                        {isOpen && (
                          <p className="mt-1.5 text-xs text-[#7A6B63] leading-relaxed pr-5">{item.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Newsletter column */}
          <div className="md:col-span-3 md:border-l md:border-[#E8DFD1] md:pl-10 space-y-3">
            <h4 className="text-sm font-medium text-[#2C221E]">Stay in the loop</h4>
            <p className="text-sm text-[#7A6B63] leading-relaxed">
              Occasional notes about new backdrops, promos, and studio news. No spam.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                required
                value={subscriberEmail}
                onChange={(e) => {
                  setSubscriberEmail(e.target.value);
                  if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                }}
                placeholder="you@email.com"
                className="w-full bg-white text-[#2C221E] border border-[#E8DFD1] focus:border-[#A3704C] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A3704C] placeholder-[#b3a495]"
              />
              <button
                type="submit"
                disabled={newsletterStatus === "loading"}
                className="w-full bg-[#A3704C] hover:bg-[#8C5A35] text-white font-medium px-4 py-2 rounded-full text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {newsletterStatus === "loading" ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            {newsletterStatus === "success" && (
              <p className="flex items-start gap-1.5 text-xs text-emerald-700">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                {newsletterMessage}
              </p>
            )}
            {newsletterStatus === "error" && (
              <p className="flex items-start gap-1.5 text-xs text-rose-700">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-rose-500" />
                {newsletterMessage}
              </p>
            )}
          </div>
        </div>

        {/* Perforated divider — a small nod to a film strip */}
        <div
          className="max-w-7xl mx-auto mt-9 h-px"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, #E8DFD1 0 6px, transparent 6px 12px)",
          }}
        />

        <div className="max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#a89589]">
          <p>© {new Date().getFullYear()} {studioName}. A self-shoot studio in Santa Rosa, Laguna.</p>
          <button
            onClick={handleScrollToTop}
            className="inline-flex items-center gap-1 text-[#7A6B63] hover:text-[#2C221E] transition-colors"
          >
            Back to top <ArrowUp size={12} />
          </button>
        </div>
      </footer>
    </section>
  );
};