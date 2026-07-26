import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/pages/Home";
import { Book } from "./components/pages/Book";
import { OurStory } from "./components/pages/OurStory";
import { Rateus } from "./components/pages/Rateus";
import NotFound from "./components/pages/NotFound";
import { Footer } from "./components/Footer";

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
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Navbar activeLink={activeLink} setActiveLink={handlePageChange} />

      <main className="w-full flex-grow">
        {activeLink === "home" && <Home />}
        {activeLink === "book" && <Book setActiveLink={handlePageChange} />}
        {activeLink === "our-story" && (
          <OurStory setActiveLink={handlePageChange} />
        )}
        {activeLink === "rate-us" && (
          <Rateus setActiveLink={handlePageChange} />
        )}

        {isInvalidPage && <NotFound setActiveLink={handlePageChange} />}
      </main>

      {/* Pass handlePageChange as setActiveLink to the Footer */}
      <Footer setActiveLink={handlePageChange} />
    </div>
  );
}
