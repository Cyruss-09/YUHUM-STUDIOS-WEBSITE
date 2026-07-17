import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/pages/Home";
import { Book } from "./components/pages/Book";
import { OurStory } from "./components/pages/OurStory";
import { Rateus } from "./components/pages/Rateus";
import NotFound from "./components/pages/NotFound"; // Import the fallback view

export default function App() {
  // Initialize state based on the current URL hash, e.g., "#our-story" -> "our-story"
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

  // Define your array of valid application pages
  const validPages = ["home", "book", "our-story", "rate-us"];
  const isInvalidPage = !validPages.includes(activeLink);

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navbar activeLink={activeLink} setActiveLink={handlePageChange} />

      <main className="w-full">
        {/* Conditional Page Rendering */}
        {activeLink === "home" && <Home />}
        {activeLink === "book" && <Book setActiveLink={handlePageChange} />}
        
        {/* Fix: Changed from "our story" to "our-story" to align cleanly with standard URL strings */}
        {activeLink === "our-story" && <OurStory setActiveLink={handlePageChange} />}
        {activeLink === "rate-us" && <Rateus setActiveLink={handlePageChange} />}

        {/* Fallback View: Displays if the hash points to a non-existent page */}
        {isInvalidPage && <NotFound setActiveLink={handlePageChange} />}
      </main>
    </div>
  );
}