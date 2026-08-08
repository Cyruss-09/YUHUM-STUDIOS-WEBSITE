import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/public/Home";
import { Book } from "./pages/public/Book";
import { OurStory } from "./pages/public/OurStory";
import { Rateus } from "./pages/public/Rateus";
import Register from "./pages/public/LoginRegister"; // adjust based on your file path
import AdminDashboard from "./pages/admin/AdminDashbord"; // adjust based on your file path
import NotFound from "./pages/public/NotFound";
import { Footer } from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const [activeLink, setActiveLink] = useState(() => {
    const path = window.location.pathname.replace("/", "");
    return path || "home";
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace("/", "");
      setActiveLink(path || "home");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handlePageChange = (newPage) => {
    const targetPath = newPage === "home" ? "/" : `/${newPage}`;
    window.history.pushState({}, "", targetPath);
    setActiveLink(newPage);
  };

  const validPages = [
    "home",
    "book",
    "our-story",
    "rate-us",
    "login",
    "admin-login",
    "admin-dashboard",
    "register",
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
          {activeLink === "register" && (
            <Register setActiveLink={handlePageChange} />
          )}
          {activeLink === "admin-login" && (
            <AdminDashboard setActiveLink={handlePageChange} />
          )}

          {activeLink === "admin-dashboard" &&
            (isAdmin ? (
              <AdminDashboard setActiveLink={handlePageChange} />
            ) : (
              <AdminLogin setActiveLink={handlePageChange} />
            ))}

          {isInvalidPage && <NotFound setActiveLink={handlePageChange} />}
        </main>

        <Footer setActiveLink={handlePageChange} />
      </div>
    </AuthProvider>
  );
}
