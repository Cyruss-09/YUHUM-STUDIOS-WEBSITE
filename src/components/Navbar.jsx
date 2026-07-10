import { useState } from "react";

// Passed down activeLink and setActiveLink states as props
export const Navbar = ({ activeLink, setActiveLink }) => {
  // Track mobile menu open/close state
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "home", label: "home", url: "#" },
    { id: "book", label: "book", url: "#" },
    { id: "story", label: "our story", url: "#" },
    { id: "faqs", label: "rate us", url: "#" },
  ];

  const handleLinkClick = (e, id) => {
    e.preventDefault(); // Prevents web page from refreshing
    setActiveLink(id);
    setIsOpen(false); // Close mobile menu when a link is clicked
  };

  return (
    <header className="relative flex flex-col items-center justify-center bg-amber-950 pt-8 pb-8 md:pt-10 md:pb-6 px-5 border-b border-neutral-800 w-full">
      {/* Brand Logo */}
      <div className="md:mb-12 text-center">
        <h1 className="font-serif text-[2.4rem] md:text-[2.6rem] font-normal leading-[0.9] md:leading-[0.85] tracking-wider text-white text-shadow-amber-800 m-0 uppercase">
          YUHUM &nbsp; &nbsp; &nbsp;
          <br /> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          .STUDIOS
        </h1>
      </div>

      {/* Hamburger Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -translate-y-1/2 right-6 md:hidden z-50 text-white focus:outline-none"
        aria-label="Toggle Menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-8 m-0 p-0 list-none">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`text-[15px] font-normal tracking-wide pb-1 transition-colors duration-200 lowercase
                  ${
                    activeLink === item.id
                      ? "text-white border-b-[2.5px] border-white"
                      : "text-white/70 hover:text-white"
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 bg-amber-950 z-40 flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav>
          <ul className="flex flex-col items-center gap-8 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  className={`text-xl font-normal tracking-wide pb-1 transition-colors duration-200 lowercase
                    ${
                      activeLink === item.id
                        ? "text-white border-b-[1.5px] border-white"
                        : "text-white/70 hover:text-white"
                    }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};