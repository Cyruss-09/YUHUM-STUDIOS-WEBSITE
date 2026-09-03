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

  // Subtle shadow/shrink on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Close the mobile menu on resize back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { id: "home", label: "home", path: "/" },
    { id: "book", label: "book", path: "/book" },
    { id: "our-story", label: "our story", path: "/our-story" },
    { id: "rate-us", label: "rate us", path: "/rate-us" },
  ];

  const loginItem = { id: "register", label: "Log in", path: "/register" };

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

  // Initials-based avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      <style>{`
        .yh-link { position: relative; }
        .yh-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1.5px;
          width: 100%;
          transform: scaleX(0);
          transform-origin: left;
          background: #A3704C;
          transition: transform 0.3s ease;
        }
        .yh-link.is-active::after,
        .yh-link:hover::after {
          transform: scaleX(1);
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
          .yh-profile-menu,
          .yh-drawer,
          header {
            transition: none !important;
          }
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 w-full bg-[#FBF9F5]/95 backdrop-blur-md px-6 md:px-12 border-b transition-[padding,box-shadow] duration-300 ${scrolled
            ? "border-[#E8DFD1] shadow-[0_8px_24px_rgba(163,112,76,0.06)] py-3.5"
            : "border-[#E8DFD1]/70 py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, "home", "/")}
            className="group rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
          >
            <h1 className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#2C221E] transition-opacity duration-200 group-hover:opacity-75 m-0 uppercase">
              Yuhum
              <span className="text-[#A3704C] font-sans tracking-normal font-light">.</span>
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
                      className={`yh-link ${isActive ? "is-active" : ""} inline-block pb-1 text-[15px] font-medium rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5] ${isActive ? "text-[#A3704C]" : "text-[#5C5049] hover:text-[#2C221E]"
                        }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: profile / login / toggle */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  className="w-9 h-9 rounded-full bg-[#A3704C] text-white text-sm font-semibold flex items-center justify-center hover:bg-[#8C5A35] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
                >
                  {getInitials(user.username)}
                </button>

                <div
                  className={`yh-profile-menu absolute right-0 mt-3 w-52 bg-white border border-[#E8DFD1] rounded-xl shadow-[0_12px_30px_rgba(163,112,76,0.12)] py-2 ${profileOpen ? "is-open" : ""
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
                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setActiveLink("admin-dashboard");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-purple-700 hover:bg-purple-50 transition-colors border-b border-[#E8DFD1]/50"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#A3704C] hover:bg-[#F4EFEA] transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <a
                href={loginItem.path}
                onClick={(e) => handleLinkClick(e, loginItem.id, loginItem.path)}
                className="hidden md:inline-flex items-center rounded-full bg-[#A3704C] px-5 py-2 text-sm font-medium text-[#FBF9F5] hover:bg-[#8C5A35] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
              >
                {loginItem.label}
              </a>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#2C221E] bg-[#F4EFEA] rounded-full hover:bg-[#EBE3DC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF9F5]"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`yh-drawer md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${isOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <nav className="max-w-7xl mx-auto pt-4 pb-2">
            <ul className="flex flex-col list-none m-0 p-0">
              {navItems.map((item) => {
                const isActive = activeLink === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      onClick={(e) => handleLinkClick(e, item.id, item.path)}
                      className={`block py-3 text-[15px] font-medium rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C] ${isActive ? "text-[#A3704C]" : "text-[#5C5049]"
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
                      className="w-full py-3 text-sm tracking-widest uppercase font-bold text-white bg-[#A3704C] hover:bg-[#8C5A35] transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C]"
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
                    className="block w-full py-3 text-center text-sm tracking-widest uppercase font-bold text-white bg-[#A3704C] hover:bg-[#8C5A35] transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3704C]"
                  >
                    {loginItem.label}
                  </a>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};