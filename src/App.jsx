import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/sections/Home";
import { Book } from "./components/sections/Book";

export default function App() {
  // Initialize state based on the current URL hash, e.g., "#book" -> "book"
  const [activeLink, setActiveLink] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  });

  // Listen for manual URL changes or back/forward button clicks
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveLink(hash || "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Custom setter that updates the URL hash automatically
  const handlePageChange = (newPage) => {
    window.location.hash = newPage === "home" ? "" : newPage;
    setActiveLink(newPage);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navbar activeLink={activeLink} setActiveLink={handlePageChange} />

      <main className="w-full">
        {activeLink === "home" && <Home />}
        {activeLink === "book" && <Book setActiveLink={handlePageChange} />}
        {/* ... rest of your code */}
      </main>
    </div>
  );
}
