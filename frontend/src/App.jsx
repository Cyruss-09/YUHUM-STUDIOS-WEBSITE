import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Book } from "./pages/Book";
import { OurStory } from "./pages/OurStory";
import { Rateus } from "./pages/Rateus";
import NotFound from "./pages/NotFound";
import { Footer } from "./components/Footer";
import  {CustomerLogin}  from "./pages/CustomerLogin";
import { AdminLogin } from "./pages/AdminLogin";
import { AuthProvider } from "./context/AuthContext"; // Added AuthProvider import

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

  const validPages = [
    "home",
    "book",
    "our-story",
    "rate-us",
    "login",
    "admin-login",
  ];
  const isInvalidPage = !validPages.includes(activeLink);

  return (
    <AuthProvider>
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
          {activeLink === "login" && (
            <CustomerLogin setActiveLink={handlePageChange} />
          )}
          {activeLink === "admin-login" && (
            <AdminLogin setActiveLink={handlePageChange} />
          )}

          {isInvalidPage && <NotFound setActiveLink={handlePageChange} />}
        </main>

        <Footer setActiveLink={handlePageChange} />
      </div>
    </AuthProvider>
  );
}