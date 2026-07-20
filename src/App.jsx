import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/pages/Home";
import { Book } from "./components/pages/Book";
import { OurStory } from "./components/pages/OurStory";
import { Rateus } from "./components/pages/Rateus";
import NotFound from "./components/pages/NotFound"; 
import { Footer } from "./components/Footer"; // 1. Import your standalone Footer component here

export default function App() {
  const [activeLink, setActiveLink] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveLink(hash || "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handlePageChange = (newPage) => {
    window.location.hash = newPage === "home" ? "" : newPage;
    setActiveLink(newPage);
  };

  const validPages = ["home", "book", "our-story", "rate-us"];
  const isInvalidPage = !validPages.includes(activeLink);

  return (
    // 2. Added flex & min-h-screen here to make a vertical sticky layout container
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Navbar activeLink={activeLink} setActiveLink={handlePageChange} />

      {/* 3. Added flex-grow to <main> so it expands to push the footer down */}
      <main className="w-full flex-grow">
        {/* Conditional Page Views */}
        {activeLink === "home" && <Home />}
        {activeLink === "book" && <Book setActiveLink={handlePageChange} />}
        {activeLink === "our-story" && <OurStory setActiveLink={handlePageChange} />}
        {activeLink === "rate-us" && <Rateus setActiveLink={handlePageChange} />}

        {isInvalidPage && <NotFound setActiveLink={handlePageChange} />}
      </main>

      {/* 4. Drop it here! Since it's outside the main block, it shows up on ALL pages */}
      <Footer />
    </div>
  );
}