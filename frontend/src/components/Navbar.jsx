import React, { useState, useEffect } from "react";

export const Navbar = ({ activeLink, setActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add subtle shadow/shrink effect on scroll for a premium feel
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setActiveLink(id);
    setIsOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 bg-amber-950/95 backdrop-blur-md px-6 md:px-12 border-b ${
          scrolled ? "border-amber-900/80 shadow-lg py-4" : "border-amber-900/40 py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo with Glow & Letterspacing */}
          <a
            href="#"
            onClick={(e) => handleLinkClick(e, "home")}
            className="group text-left focus:outline-none"
          >
            <h1 className="font-serif text-xl md:text-2xl font-normal tracking-[0.25em] text-white transition-opacity duration-200 group-hover:opacity-90 m-0 uppercase">
              Yuhum<span className="text-amber-400 font-sans tracking-normal font-light">.</span>Studios
            </h1>
          </a>

          {/* Desktop Navigation Link Row */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 bg-amber-900/20 border border-amber-800/40 p-1.5 rounded-full list-none m-0 shadow-inner">
              {navItems.map((item) => {
                const isActive = activeLink === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      className={`relative px-5 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-300 rounded-full block ${
                        isActive
                          ? "text-amber-950 bg-white shadow-sm"
                          : "text-stone-300 hover:text-white hover:bg-amber-900/40"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right CTA / Mobile Toggle */}
          <div className="flex items-center gap-4">
            <a
              href="#book"
              onClick={(e) => handleLinkClick(e, "book")}
              className="hidden lg:inline-flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-semibold px-4 py-2 rounded-md transition-all duration-200 shadow-sm"
            >
              Reserve Session
            </a>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-stone-200 hover:text-white focus:outline-none p-2 rounded-lg bg-amber-900/30 border border-amber-800/50 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile Drawer Overlay — rendered as a SIBLING of <header>, not a child.
        <header> has `backdrop-blur-md`, and any element with `filter` applied
        becomes the containing block for `position: fixed` descendants (same
        rule as `transform`). Left nested inside the header, `inset-0` here
        would resolve against the header's own (short) box instead of the
        viewport, squashing the "full screen" menu down into a sliver the
        height of the navbar. Moving it out fixes that.
      */}
      <div
        className={`fixed inset-0 bg-amber-950/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
        }`}
      >
        <div className="absolute top-6 left-6">
          <span className="font-serif text-lg tracking-[0.2em] text-white uppercase">
            Yuhum<span className="text-amber-400">.</span>Studios
          </span>
        </div>

        <nav className="w-full px-8">
          <ul className="flex flex-col items-center gap-6 list-none m-0 p-0 text-center">
            {navItems.map((item) => {
              const isActive = activeLink === item.id;
              return (
                <li key={item.id} className="w-full max-w-xs">
                  <a
                    href={item.url}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`block py-3 text-sm tracking-widest uppercase transition-all duration-200 rounded-lg ${
                      isActive
                        ? "text-amber-950 bg-white font-semibold shadow-md"
                        : "text-stone-300 hover:text-white hover:bg-amber-900/30 font-normal"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
            <li className="w-full max-w-xs pt-4">
              <a
                href="#book"
                onClick={(e) => handleLinkClick(e, "book")}
                className="block w-full py-3 text-sm tracking-widest uppercase bg-amber-500 text-amber-950 font-semibold rounded-lg text-center shadow-lg"
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
