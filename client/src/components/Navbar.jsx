import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ activeLink, setActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);

  // Add subtle shadow/shrink effect on scroll for a premium feel
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close the profile dropdown when clicking outside it
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const navItems = [
    { id: "home", label: "home", path: "/" },
    { id: "book", label: "book", path: "/book" },
    { id: "our-story", label: "our story", path: "/our-story" },
    { id: "rate-us", label: "rate us", path: "/rate-us" },
  ];

  const loginItem = { id: "register", label: "login", path: "/register" };

  const handleLinkClick = (e, id, path) => {
    e.preventDefault();
    setActiveLink(id);
    setIsOpen(false);
    navigate(path, { state: { mode: "register" } });
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsOpen(false);
    setActiveLink("home");
    navigate("/");
  };

  // Initials-based avatar fallback — the users table has no photo field yet,
  // so this renders e.g. "J" for "julianacyrene". Swap for an <img> once a
  // photo_url column + upload flow exist.
  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const isLoginActive = activeLink === loginItem.id;

  return (
    <>
      <style>{`
        .yh-link { position: relative; }
        .yh-link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -3px;
          height: 2px;
          width: 100%;
          transform: translateX(-50%) scaleX(0);
          transform-origin: center;
          background: #A3704C;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .yh-link.is-active::after,
        .yh-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        .yh-iris {
          clip-path: circle(0% at calc(100% - 2.75rem) 2.75rem);
          visibility: hidden;
          pointer-events: none;
          transition: clip-path 0.6s cubic-bezier(0.65, 0, 0.35, 1), visibility 0.6s;
        }
        .yh-iris.is-open {
          clip-path: circle(150% at calc(100% - 2.75rem) 2.75rem);
          visibility: visible;
          pointer-events: auto;
        }
        .yh-drawer-item {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .yh-iris.is-open .yh-drawer-item {
          opacity: 1;
          transform: translateY(0);
        }

        .yh-toggle .yh-ring {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        .yh-toggle:hover .yh-ring {
          transform: scale(1);
          opacity: 1;
        }

        .yh-profile-menu {
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .yh-profile-menu.is-open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        @media (prefers-reduced-motion: reduce) {
          .yh-link::after,
          .yh-iris,
          .yh-drawer-item,
          .yh-toggle .yh-ring,
          .yh-profile-menu,
          header {
            transition: none !important;
          }
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-[#FBF9F5]/90 backdrop-blur-md px-6 md:px-12 border-b ${
          scrolled
            ? "border-[#E8DFD1] shadow-[0_10px_30px_rgba(163,112,76,0.06)] py-3.5"
            : "border-[#E8DFD1]/60 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, "home", "/")}
            className="group text-left rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
          >
            <h1 className="font-serif text-xl md:text-2xl font-normal tracking-[0.25em] text-[#2C221E] transition-opacity duration-200 group-hover:opacity-75 m-0 uppercase">
              Yuhum
              <span className="text-[#9A6C31] font-sans tracking-normal font-light">
                .
              </span>
              Studios
            </h1>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 list-none m-0">
              {navItems.map((item) => {
                const isActive = activeLink === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      onClick={(e) => handleLinkClick(e, item.id, item.path)}
                      className={`yh-link ${isActive ? "is-active" : ""} inline-block pb-1 text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5] ${
                        isActive
                          ? "text-[#A3704C]"
                          : "text-[#7A6B63] hover:text-[#2C221E]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: profile / login / CTA / toggle */}
          <div className="flex items-center gap-5">
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A3704C] to-[#8C5A35] text-white text-sm font-semibold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
                >
                  {getInitials(user.username)}
                </button>

                <div
                  className={`yh-profile-menu absolute right-0 mt-3 w-52 bg-white border border-[#E8DFD1] rounded-xl shadow-[0_12px_30px_rgba(163,112,76,0.12)] py-2 ${
                    profileOpen ? "is-open" : ""
                  }`}
                >
                  <div className="px-4 py-2.5 border-b border-[#E8DFD1]">
                    <p className="text-sm font-semibold text-[#2C221E] truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-[#7A6B63] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#A3704C] hover:bg-[#F4EFEA] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <a
                href="/register"
                onClick={(e) =>
                  handleLinkClick(e, loginItem.id, loginItem.path)
                }
                className={`yh-link ${isLoginActive ? "is-active" : ""} hidden md:inline-flex items-center pb-1 pr-5 mr-1 border-r border-[#E8DFD1] text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5] ${
                  isLoginActive
                    ? "text-[#A3704C]"
                    : "text-[#7A6B63] hover:text-[#2C221E]"
                }`}
              >
                {loginItem.label}
              </a>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="yh-toggle relative md:hidden w-10 h-10 flex items-center justify-center text-[#2C221E] bg-[#F4EFEA] rounded-full hover:bg-[#EBE3DC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              <span className="yh-ring pointer-events-none absolute inset-0 rounded-full border border-[#A3704C]/40 scale-90 opacity-0" />
              <svg
                className={`w-5 h-5 relative transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`yh-iris fixed inset-0 bg-[#FBF9F5] z-40 flex flex-col items-center justify-center md:hidden ${
          isOpen ? "is-open" : ""
        }`}
      >
        <div
          className="absolute top-6 left-6 yh-drawer-item"
          style={{ transitionDelay: isOpen ? "0.15s" : "0s" }}
        >
          <span className="font-serif text-lg tracking-[0.2em] text-[#2C221E] uppercase">
            Yuhum<span className="text-[#A3704C]">.</span>Studios
          </span>
        </div>

        <nav className="w-full px-8">
          <ul className="flex flex-col items-center gap-6 list-none m-0 p-0 text-center">
            {navItems.map((item, i) => {
              const isActive = activeLink === item.id;
              return (
                <li
                  key={item.id}
                  className="w-full max-w-xs yh-drawer-item"
                  style={{
                    transitionDelay: isOpen ? `${0.2 + i * 0.06}s` : "0s",
                  }}
                >
                  <a
                    href={item.path}
                    onClick={(e) => handleLinkClick(e, item.id, item.path)}
                    className={`block py-3 text-sm tracking-widest uppercase transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] ${
                      isActive
                        ? "text-[#A3704C] font-bold"
                        : "text-[#7A6B63] hover:text-[#2C221E] font-medium"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}

            <li
              className="w-full max-w-xs pt-5 mt-1 border-t border-[#E8DFD1] yh-drawer-item"
              style={{ transitionDelay: isOpen ? "0.45s" : "0s" }}
            >
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A3704C] to-[#8C5A35] text-white text-sm font-semibold flex items-center justify-center shadow-sm">
                      {getInitials(user.username)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#2C221E]">
                        {user.username}
                      </p>
                      <p className="text-xs text-[#7A6B63]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-sm tracking-widest uppercase font-bold text-[#A3704C] hover:text-[#8C5A35] transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href={loginItem.path}
                  onClick={(e) =>
                    handleLinkClick(e, loginItem.id, loginItem.path)
                  }
                  className={`block py-3 text-sm tracking-widest uppercase transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] ${
                    isLoginActive
                      ? "text-[#A3704C] font-bold"
                      : "text-[#7A6B63] hover:text-[#2C221E] font-medium"
                  }`}
                >
                  {loginItem.label}
                </a>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};