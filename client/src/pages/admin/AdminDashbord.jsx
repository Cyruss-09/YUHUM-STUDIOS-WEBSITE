import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import BookingsPanel from "../../components/admin/BookingsPanel";
import UsersPanel from "../../components/admin/UsersPanel";
import SettingsPanel from "../../components/admin/SettingsPanel";
import ReviewsPanel from "../../components/admin/ReviewsPanel";
import SubscribersPanel from "../../components/admin/SubscribersPanel";
import OverviewPanel from "../../components/admin/OverviewPanel";
import { useTheme } from "../../context/ThemeContext";
import yuhumLogo from "../../assets/yuhum.studios home pic.jpg";

import {
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  Star,
  Mail,
  Users,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

/* ─── Global CSS: animations, custom scrollbar, sidebar accent ─── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');

  .yh-admin-wrap * { font-family: 'Inter', sans-serif; }

  /* Sidebar link active left-accent bar */
  .yh-sidebar-link { position: relative; overflow: hidden; }
  .yh-sidebar-link::before {
    content: '';
    position: absolute;
    left: 0; top: 4px; bottom: 4px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: #A3704C;
    transform: scaleY(0);
    transition: transform 0.22s ease;
  }
  .yh-sidebar-link.is-active::before { transform: scaleY(1); }

  /* Ripple press effect */
  .yh-nav-ripple { transition: background 0.18s ease, transform 0.14s ease; }
  .yh-nav-ripple:active { transform: scale(0.97); }

  /* Custom amber scrollbar */
  .yh-admin-scroll::-webkit-scrollbar { width: 4px; }
  .yh-admin-scroll::-webkit-scrollbar-track { background: transparent; }
  .yh-admin-scroll::-webkit-scrollbar-thumb {
    background: #A3704C30;
    border-radius: 9999px;
  }
  .yh-admin-scroll::-webkit-scrollbar-thumb:hover { background: #A3704C70; }

  /* Panel fade-in on tab change */
  .yh-fade-in { animation: yhFadeIn 0.28s ease both; }
  @keyframes yhFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Live status pulse */
  .yh-pulse { animation: yhPulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  @keyframes yhPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.45; }
  }
`;

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full transition-all duration-200 hover:bg-[#A3704C]/10 dark:hover:bg-[#A3704C]/20 active:scale-90"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={17} className="text-[#A3704C]" />
      ) : (
        <Moon size={17} className="text-[#A3704C]" />
      )}
    </button>
  );
}

const TABS = [
  { key: "overview",    label: "Overview",     icon: LayoutDashboard },
  { key: "bookings",    label: "Bookings",      icon: CalendarCheck },
  { key: "reviews",     label: "Reviews",       icon: Star },
  { key: "subscribers", label: "Subscribers",   icon: Mail },
  { key: "users",       label: "Manage Users",  icon: Users },
  { key: "settings",    label: "Settings",      icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsSubTab, setSettingsSubTab] = useState("studio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { adminUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin-login");
  };

  const handleTabChange = (key, subTab = "studio") => {
    setActiveTab(key);
    if (key === "settings") setSettingsSubTab(subTab);
    setMobileMenuOpen(false);
  };

  const currentTab = TABS.find((t) => t.key === activeTab);

  // Switch statement to conditionally render panels based on the active tab
  const renderActivePanel = () => {
    switch (activeTab) {
      case "bookings":    return <BookingsPanel />;
      case "reviews":     return <ReviewsPanel />;
      case "subscribers": return <SubscribersPanel />;
      case "users":       return <UsersPanel />;
      case "settings":    return <SettingsPanel initialSubTab={settingsSubTab} />;
      case "overview":
      default:
        return (
          <OverviewPanel
            onNavigateTab={handleTabChange}
            adminUser={adminUser}
          />
        );
    }
  };

  // Shared sidebar nav content (used by both desktop sidebar and mobile drawer)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Brand / Logo ── */}
      <div className="mb-7 px-1">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={yuhumLogo}
              alt="Yuhum Studios logo"
              className="h-11 w-11 rounded-xl object-cover shadow-md ring-2 ring-[#A3704C]/20"
            />
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#FBF9F5] dark:border-[#1A1108]" />
          </div>
          <div>
            <p className="font-['Cormorant_Garamond',serif] text-[16px] font-semibold text-[#2C221E] dark:text-[#EDE5DA] leading-tight tracking-wide">
              Yuhum
              <span className="text-[#A3704C] font-['Inter',sans-serif] font-light">.</span>
              Studios
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A3704C]/70 dark:text-[#A3704C]/60 mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 space-y-0.5" aria-label="Admin navigation">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`yh-sidebar-link yh-nav-ripple w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left
                ${
                  isActive
                    ? "is-active bg-[#A3704C]/10 dark:bg-[#A3704C]/15 text-[#A3704C] dark:text-[#C8956A]"
                    : "text-[#5C5049] dark:text-[#9E8A7A] hover:bg-[#A3704C]/[0.06] dark:hover:bg-[#A3704C]/10 hover:text-[#2C221E] dark:hover:text-[#EDE5DA]"
                }`}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-[#A3704C]" : "text-[#A3704C]/50 dark:text-[#A3704C]/40"
                }`}
              />
              <span className="flex-1 truncate">{tab.label}</span>
              {isActive && (
                <ChevronRight size={14} className="text-[#A3704C]/60 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="my-4 border-t border-[#E8DFD1] dark:border-[#2C2018]" />

      {/* ── User Profile ── */}
      <div className="px-1">
        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-[#A3704C]/[0.05] dark:bg-[#A3704C]/[0.08] border border-[#E8DFD1] dark:border-[#2C2018]">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#A3704C] to-[#8C5A35] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
            {adminUser?.name?.[0] || adminUser?.username?.[0] || "A"}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2C221E] dark:text-[#EDE5DA] truncate leading-tight">
              {adminUser?.name || adminUser?.username || "Admin User"}
            </p>
            <p className="text-[11px] text-[#7A6B63] dark:text-[#7A6B63] truncate">
              {adminUser?.email || "admin@yuhum.com"}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="yh-nav-ripple w-full flex items-center justify-center gap-2 rounded-xl border border-[#E8DFD1] dark:border-[#2C2018] bg-white dark:bg-[#1C1410] px-4 py-2.5 text-sm font-medium text-[#5C5049] dark:text-[#9E8A7A] transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Inject global styles */}
      <style>{GLOBAL_STYLES}</style>

      <div className="yh-admin-wrap flex h-screen bg-[#F4EFEA] dark:bg-[#120D09] overflow-hidden">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-[264px] flex-shrink-0 flex-col bg-[#FBF9F5] dark:bg-[#1A1108] border-r border-[#E8DFD1] dark:border-[#2C2018] p-5 shadow-[2px_0_20px_rgba(163,112,76,0.05)]">
          <SidebarContent />
        </aside>

        {/* ── Mobile Backdrop Overlay ── */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#2C221E]/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile Drawer Sidebar ── */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-[264px] flex flex-col
            bg-[#FBF9F5] dark:bg-[#1A1108]
            border-r border-[#E8DFD1] dark:border-[#2C2018]
            p-5 shadow-[4px_0_32px_rgba(44,34,30,0.18)]
            transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            lg:hidden
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Mobile navigation"
        >
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#A3704C]/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-[#5C5049] dark:text-[#9E8A7A]" />
          </button>
          <SidebarContent />
        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">

          {/* Top Header Bar */}
          <header className="flex-shrink-0 z-10 flex h-16 lg:h-[68px] items-center justify-between border-b border-[#E8DFD1] dark:border-[#2C2018] bg-[#FBF9F5]/90 dark:bg-[#1A1108]/90 backdrop-blur-md px-4 lg:px-7 gap-3 shadow-[0_2px_12px_rgba(163,112,76,0.06)]">

            {/* Left: burger + title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile burger */}
              <button
                id="admin-burger-menu"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden flex-shrink-0 p-2 rounded-xl hover:bg-[#A3704C]/10 transition-colors active:scale-90"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={21} className="text-[#2C221E] dark:text-[#EDE5DA]" />
              </button>

              {/* Mobile brand */}
              <div className="lg:hidden flex-shrink-0">
                <p className="font-['Cormorant_Garamond',serif] text-base font-semibold text-[#2C221E] dark:text-[#EDE5DA] leading-none tracking-wide">
                  Yuhum<span className="text-[#A3704C] font-['Inter',sans-serif] font-light">.</span>
                </p>
              </div>

              {/* Desktop: icon + page title */}
              <div className="hidden lg:flex items-center gap-2.5 min-w-0">
                {currentTab && (
                  <currentTab.icon size={20} className="text-[#A3704C] flex-shrink-0" />
                )}
                <h1 className="text-[17px] font-semibold text-[#2C221E] dark:text-[#EDE5DA] truncate tracking-tight">
                  {currentTab?.label || "Dashboard"}
                </h1>
              </div>

              {/* Mobile: page title */}
              <h1 className="lg:hidden text-base font-semibold text-[#2C221E] dark:text-[#EDE5DA] truncate">
                {currentTab?.label || "Dashboard"}
              </h1>
            </div>

            {/* Right: live badge + divider + theme toggle */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                <span className="yh-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                System Live
              </span>
              <span className="sm:hidden flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="yh-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
              <div className="h-5 w-px bg-[#E8DFD1] dark:bg-[#2C2018]" />
              <ThemeToggle />
            </div>
          </header>

          {/* Dynamic Panel Content */}
          <main className="flex-1 overflow-y-auto yh-admin-scroll p-4 lg:p-7">
            <div key={activeTab} className="yh-fade-in rounded-2xl border border-[#E8DFD1] dark:border-[#2C2018] bg-[#FBF9F5] dark:bg-[#1A1108] shadow-[0_2px_16px_rgba(163,112,76,0.07)] min-h-[calc(100vh-8rem)] overflow-hidden">
              {/* Amber accent top line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#A3704C]/40 to-transparent" />
              <div className="p-4 lg:p-6">
                {renderActivePanel()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}