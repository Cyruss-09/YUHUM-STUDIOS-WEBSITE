import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import BookingsPanel from "../../components/admin/BookingsPanel";
import UsersPanel from "../../components/admin/UsersPanel";
import SettingsPanel from "../../components/admin/SettingsPanel";
import ReviewsPanel from "../../components/admin/ReviewsPanel";
import SubscribersPanel from "../../components/admin/SubscribersPanel";
import { useTheme } from "../../context/ThemeContext";
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
  ArrowRight,
} from "lucide-react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-gray-300" />
      ) : (
        <Moon size={18} className="text-gray-600" />
      )}
    </button>
  );
}

const TABS = [
  {
    key: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: <CalendarCheck className="w-5 h-5" />,
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: <Star className="w-5 h-5" />,
  },
  {
    key: "subscribers",
    label: "Subscribers",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    key: "users",
    label: "Manage Users",
    icon: <Users className="w-5 h-5" />,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setMobileMenuOpen(false);
  };

  const currentTabLabel =
    TABS.find((t) => t.key === activeTab)?.label || "Dashboard";

  // Switch statement to conditionally render panels based on the active tab
  const renderActivePanel = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsPanel />;
      case "reviews":
        return <ReviewsPanel />;
      case "subscribers":
        return <SubscribersPanel />;
      case "users":
        return <UsersPanel />;
      case "settings":
        return <SettingsPanel />;
      case "overview":
      default:
        return (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 text-white p-6 lg:p-8 shadow-md">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-gray-200 backdrop-blur-sm mb-3">
                Yuhum Studios • Admin Center
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Welcome back, {user?.name || user?.username || "Admin"} 👋
              </h2>
              <p className="text-gray-300 text-sm mt-1 max-w-xl">
                Manage your studio bookings, inspect customer ratings and feedback, grow your newsletter audience, and configure studio operations.
              </p>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleTabChange("bookings")}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <CalendarCheck size={20} />
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Bookings Schedule
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    View upcoming client shoots, confirm slots, and manage reservations.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTabChange("reviews")}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Star size={20} className="fill-amber-400" />
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Customer Reviews
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Check client ratings, feedback comments, privacy, and props ratings.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTabChange("subscribers")}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Mail size={20} />
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Newsletter Subscribers
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage client subscribers, export audience list, and copy active emails.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTabChange("users")}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:shadow-sm group"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                    <Users size={20} />
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    User Accounts
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    View registered clients and manage administrator permissions.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTabChange("settings")}
                className="flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-left hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:shadow-sm group sm:col-span-2 lg:col-span-2"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <Settings size={20} />
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    Studio & System Settings
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Configure package rates, studio schedule hours, payment details, promo codes, and announcement banner.
                  </p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  // Shared sidebar nav content (used by both desktop sidebar and mobile drawer)
  const SidebarContent = () => (
    <>
      <div>
        {/* Logo / Brand Header */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold tracking-wider shadow-md">
            YS
          </div>
          <div>
            <span className="block text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Yuhum Studios
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/10 dark:shadow-none"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                <span
                  className={`${isActive ? "text-white dark:text-black" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout Box */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold text-sm">
            {user?.name?.[0] || user?.username?.[0] || "A"}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user?.name || user?.username || "Admin User"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "admin@yuhum.com"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 active:scale-[0.98]"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Mobile Backdrop Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 flex flex-col justify-between
          border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-900 p-6 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Mobile navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        <SidebarContent />
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex h-16 lg:h-20 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 lg:px-8 gap-3">

          {/* Left side: burger (mobile only) + page title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Burger button — mobile only */}
            <button
              id="admin-burger-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Mobile brand mark (visible only on mobile) */}
            <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs tracking-wider shadow">
                YS
              </div>
            </div>

            <h1 className="text-lg lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate">
              {currentTabLabel}
            </h1>
          </div>

          {/* Right side: status badge + theme toggle */}
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Live
            </span>
            {/* Compact live dot on very small screens */}
            <span className="sm:hidden flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Panel Content */}
        <main className="p-4 lg:p-8">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-6 shadow-sm min-h-[70vh]">
            {renderActivePanel()}
          </div>
        </main>
      </div>
    </div>
  );
}