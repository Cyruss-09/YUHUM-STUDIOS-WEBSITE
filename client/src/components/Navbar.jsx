import React, { useState, useEffect } from "react";

/*
  Design direction — "darkroom / aperture"
  -----------------------------------------
  Yuhum.Studios reads as a booking-driven creative studio (Reserve Session,
  Book Online, our story). Rather than a generic dark-mode SaaS pill nav,
  this pass leans into a photography-studio vernacular: a warm near-black
  "safelight" background, a brass/copper accent instead of flat amber,
  underline reveals instead of filled pills, and a mobile menu that opens
  like a camera iris/shutter from the toggle button rather than a plain
  fade. One motif (aperture / lens / shutter) ties color, layout and
  motion together instead of several unrelated effects.
*/

export const Navbar = ({ activeLink, setActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const navItems = [
    { id: "home", label: "home", url: "#" },
    { id: "book", label: "book", url: "#book" },
    { id: "our-story", label: "our story", url: "#our-story" },
    { id: "rate-us", label: "rate us", url: "#rate-us" },
  ];

  const loginItem = { id: "login", label: "login", url: "#login" };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setActiveLink(id);
    setIsOpen(false);
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
          height: 1px;
          width: 100%;
          transform: translateX(-50%) scaleX(0);
          transform-origin: center;
          background: linear-gradient(90deg, transparent, #E8B368, transparent);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .yh-link.is-active::after,
        .yh-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* Mobile drawer opens like a camera iris from the toggle button */
        .yh-iris {
          clip-path: circle(0% at calc(100% - 2.75rem) 2.75rem);
          transition: clip-path 0.6s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .yh-iris.is-open {
          clip-path: circle(150% at calc(100% - 2.75rem) 2.75rem);
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

        /* Lens-ring hover cue on the mobile toggle */
        .yh-toggle .yh-ring {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        .yh-toggle:hover .yh-ring {
          transform: scale(1);
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .yh-link::after,
          .yh-iris,
          .yh-drawer-item,
          .yh-toggle .yh-ring,
          header {
            transition: none !important;
          }
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-[#150E09]/95 backdrop-blur-md px-6 md:px-12 border-b ${
          scrolled ? "border-[#C08A3E]/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] py-4" : "border-[#C08A3E]/10 py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, "home")}
            className="group text-left rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150E09]"
          >
            <h1 className="font-serif text-xl md:text-2xl font-normal tracking-[0.25em] text-[#F3EDE3] transition-opacity duration-200 group-hover:opacity-80 m-0 uppercase">
              Yuhum<span className="text-[#E8B368] font-sans tracking-normal font-light">.</span>Studios
            </h1>
          </a>

          {/* Desktop nav — flush row, underline reveal instead of a filled pill */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 list-none m-0">
              {navItems.map((item) => {
                const isActive = activeLink === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className={`yh-link ${isActive ? "is-active" : ""} inline-block pb-1 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150E09] ${
                        isActive ? "text-[#E8B368]" : "text-[#B8AA98] hover:text-[#F3EDE3]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: login / CTA / toggle */}
          <div className="flex items-center gap-5">
            {/* Login keeps its own area, set off by a divider, in the new palette */}
            <a
              href={loginItem.url}
              onClick={(e) => handleLinkClick(e, loginItem.id)}
              className={`yh-link ${isLoginActive ? "is-active" : ""} hidden md:inline-flex items-center pb-1 pr-5 mr-1 border-r border-[#C08A3E]/25 text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150E09] ${
                isLoginActive ? "text-[#E8B368]" : "text-[#B8AA98] hover:text-[#F3EDE3]"
              }`}
            >
              {loginItem.label}
            </a>

            <a
              href="#book"
              onClick={(e) => handleLinkClick(e, "book")}
              className="hidden lg:inline-flex items-center justify-center bg-gradient-to-b from-[#E8B368] to-[#C08A3E] hover:from-[#F0C07E] hover:to-[#CE9750] text-[#1c1410] text-xs font-semibold px-5 py-2.5 rounded-sm transition-all duration-200 shadow-[0_4px_14px_rgba(192,138,62,0.35)] hover:shadow-[0_6px_18px_rgba(192,138,62,0.5)] hover:-translate-y-px active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EDE3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150E09]"
            >
              Reserve Session
            </a>

            {/* Mobile toggle — hairline "lens ring" appears on hover, icon morphs to a close mark */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="yh-toggle relative md:hidden w-10 h-10 flex items-center justify-center text-[#E8D9C4] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] focus-visible:ring-offset-2 focus-visible:ring-offset-[#150E09]"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              <span className="yh-ring pointer-events-none absolute inset-0 rounded-full border border-[#C08A3E]/50 scale-90 opacity-0" />
              <svg
                className={`w-5 h-5 relative transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile Drawer — rendered as a SIBLING of <header>, not a child.
        <header> has `backdrop-blur-md`, and any element with `filter` applied
        becomes the containing block for `position: fixed` descendants (same
        rule as `transform`). Left nested inside the header, this overlay
        would resolve against the header's own (short) box instead of the
        viewport. Moving it out keeps the iris reveal filling the screen.
      */}
      <div
        className={`yh-iris fixed inset-0 bg-[#150E09] z-40 flex flex-col items-center justify-center md:hidden ${
          isOpen ? "is-open pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="absolute top-6 left-6 yh-drawer-item" style={{ transitionDelay: isOpen ? "0.15s" : "0s" }}>
          <span className="font-serif text-lg tracking-[0.2em] text-[#F3EDE3] uppercase">
            Yuhum<span className="text-[#E8B368]">.</span>Studios
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
                  style={{ transitionDelay: isOpen ? `${0.2 + i * 0.06}s` : "0s" }}
                >
                  <a
                    href={item.url}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block py-3 text-sm tracking-widest uppercase transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] ${
                      isActive ? "text-[#E8B368] font-semibold" : "text-[#B8AA98] hover:text-[#F3EDE3] font-normal"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}

            {/* Login gets its own bordered area, set apart by a hairline divider above it */}
            <li
              className="w-full max-w-xs pt-5 mt-1 border-t border-[#C08A3E]/20 yh-drawer-item"
              style={{ transitionDelay: isOpen ? "0.45s" : "0s" }}
            >
              <a
                href={loginItem.url}
                onClick={(e) => handleLinkClick(e, loginItem.id)}
                className={`block py-3 text-sm tracking-widest uppercase transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B368] ${
                  isLoginActive ? "text-[#E8B368] font-semibold" : "text-[#B8AA98] hover:text-[#F3EDE3] font-normal"
                }`}
              >
                {loginItem.label}
              </a>
            </li>

            <li className="w-full max-w-xs pt-4 yh-drawer-item" style={{ transitionDelay: isOpen ? "0.52s" : "0s" }}>
              <a
                href="#book"
                onClick={(e) => handleLinkClick(e, "book")}
                className="block w-full py-3 text-sm tracking-widest uppercase bg-gradient-to-b from-[#E8B368] to-[#C08A3E] text-[#1c1410] font-semibold rounded-sm text-center shadow-[0_4px_14px_rgba(192,138,62,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3EDE3]"
              >
                Book Online
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
