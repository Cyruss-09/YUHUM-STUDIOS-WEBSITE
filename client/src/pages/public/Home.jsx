// client/src/pages/public/Home.jsx
import { features } from "../../data/features.js";
import { useFeatureSelection } from "../../hooks/useFeatureSelection.js";
import { usePublicSettings } from "../../hooks/usePublicSettings.js";

const BANNER_THEMES = {
  dark: "bg-stone-900 text-stone-100 border-stone-800",
  amber: "bg-[#4a2e18] text-amber-100 border-[#3d2412]",
  emerald: "bg-emerald-950 text-emerald-100 border-emerald-900",
  blue: "bg-slate-900 text-sky-100 border-slate-800",
};

export const Home = () => {
  const { selectedFeature, handleCardClick, activeItem } =
    useFeatureSelection(features);
  const { settings } = usePublicSettings();

  const bannerThemeClass =
    BANNER_THEMES[settings.cms?.bannerTheme] || BANNER_THEMES.dark;

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-stone-50 pb-24 w-full gap-20">
      {/* --- CMS ANNOUNCEMENT BANNER (Configured in Admin Settings) --- */}
      {settings.cms?.bannerEnabled && settings.cms?.bannerText && (
        <div
          className={`w-full py-3 shadow-sm border-b transition-all duration-300 overflow-hidden relative ${bannerThemeClass}`}
        >
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="text-xs md:text-sm font-medium tracking-wide px-6">
              {settings.cms.bannerText}
            </span>
            <span className="text-xs md:text-sm font-medium tracking-wide px-6">
              {settings.cms.bannerText}
            </span>
            <span className="text-xs md:text-sm font-medium tracking-wide px-6">
              {settings.cms.bannerText}
            </span>
            <span className="text-xs md:text-sm font-medium tracking-wide px-6">
              {settings.cms.bannerText}
            </span>
          </div>
        </div>
      )}

      {/* --- MAINTENANCE MODE NOTICE (If enabled in Admin Settings) --- */}
      {settings.cms?.maintenanceMode && (
        <div className="w-full max-w-4xl mx-auto mt-6 px-6">
          <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 md:p-5 flex items-center gap-3 text-amber-900 shadow-sm">
            <span className="text-xl">🛠️</span>
            <div>
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider">
                Maintenance Notice
              </h4>
              <p className="text-xs md:text-sm text-amber-800/90 mt-0.5">
                {settings.cms.maintenanceMessage ||
                  "Our booking system is currently undergoing scheduled maintenance. We will be back shortly!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- HERO / INTRODUCTION SECTION --- */}
      <div className="flex flex-col items-center gap-8 w-full px-6 pt-8">
        <div className="w-full max-w-sm overflow-hidden rounded-xl shadow-lg">
          <video
            src="/9gridsvideos.mp4"
            className="w-full h-auto object-cover block"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>

        <div className="flex flex-col items-center gap-4 max-w-3xl text-center">
          <h2 className="text-black font-sans text-xl md:text-2xl font-bold tracking-wide lowercase">
            a photo studio for you, by you.
          </h2>

          <p className="text-gray-500 font-sans text-xs md:text-sm font-normal leading-relaxed tracking-widest uppercase">
            {(settings.general?.studioName || "YUHUM STUDIO").toUpperCase()} IS
            A SELF-PHOTOGRAPHY STUDIO BASED IN{" "}
            {(
              settings.general?.address || "SANTA ROSA CITY, LAGUNA PHILIPPINES"
            ).toUpperCase()}
            . IN OUR STUDIO, WE PROVIDE THE BEST SELF-PORTRAIT EXPERIENCE WHICH
            CELEBRATES YOUR MOST AUTHENTIC SELF.
          </p>

          {/* Operating Hours Info Badge */}
          {settings.schedule?.openTime && settings.schedule?.closeTime && (
            <div className="inline-flex items-center gap-2 text-stone-600 bg-stone-200/60 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>
                Open Daily: {settings.schedule.openTime} –{" "}
                {settings.schedule.closeTime}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="book"
            className="inline-block bg-[#1a1919] hover:bg-black text-white font-sans text-sm md:text-base font-normal tracking-wide px-8 py-4 rounded-full transition-colors duration-200 shadow-sm"
          >
            book an appointment
          </a>
        </div>
      </div>

      {/* --- RESPONSIVE FEATURES PHOTO GRID WITH DESCRIPTION --- */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className={`relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-300
                ${selectedFeature === item.id
                  ? "ring-4 ring-amber-950/30 scale-[0.98]"
                  : ""
                }`}
            >
              <img
                src={item.imageUrl}
                alt={item.text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/10">
                <div className="w-[260px] h-[60px] flex items-center justify-center bg-white/10 border border-white/40 text-white font-sans text-sm md:text-base font-semibold tracking-wide text-center px-4 rounded-full shadow-md">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[120px] flex items-center justify-center w-full transition-all duration-300">
          {activeItem ? (
            <div className="w-full max-w-3xl mx-auto text-center bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm transition-all duration-300">
              <h4 className="text-amber-950 font-sans text-sm md:text-base font-bold uppercase tracking-wider mb-2">
                {activeItem.text}
              </h4>
              <p className="text-gray-600 font-sans text-sm leading-relaxed max-w-2xl mx-auto">
                {activeItem.description}
              </p>
            </div>
          ) : (
            <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide italic">
              * click on any photo card above to see details.
            </p>
          )}
        </div>
      </div>

      {/* --- MINIMALIST LOCATION SECTION (Powered dynamically by Admin Settings) --- */}
      <div className="w-full max-w-5xl mx-auto px-6 flex flex-col gap-8 items-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-4">
          <div className="w-full md:w-1/2 overflow-hidden rounded-xl border border-stone-200 shadow-sm hover:scale-105 transition-transform duration-300">
            <img
              src="/src/assets/location.png"
              alt="Yuhum Studio Location Map"
              className="w-full h-[240px] md:h-[280px] object-cover object-top grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex items-center gap-2 text-stone-800">
              <svg
                className="w-5 h-5 shrink-0 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-sans text-sm md:text-base font-medium tracking-wide lowercase">
                {settings.general?.address || "santa rosa city, laguna"}
              </span>
            </div>

            {/* Custom Directions Action link button */}
            <a
              href={
                settings.general?.googleMapsUrl ||
                "https://www.google.com/maps/place/The+Yuh%C3%BAm+Studios:+Self-shoot+X+Makeup/@14.2811949,121.1208636,16z/data=!4m6!3m5!1s0x3397d9d64411a5a9:0xe6cb1e3c3a788c04!8m2!3d14.2812036!4d121.1209445!16s%2Fg%2F11s4z97lg_?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-black font-sans text-xs font-normal tracking-wider underline underline-offset-4 decoration-stone-300 transition-colors duration-200"
            >
              get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
