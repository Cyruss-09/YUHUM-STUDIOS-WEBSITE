import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/public/Home";
import { Book } from "./pages/public/Book";
import { OurStory } from "./pages/public/OurStory";
import { Rateus } from "./pages/public/Rateus";
import Register from "./pages/public/LoginRegister";
import AdminDashboard from "./pages/admin/AdminDashbord";
import NotFound from "./pages/public/NotFound";
import { Footer } from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext"; // CHANGED: combined imports
import AdminLogin from "./pages/admin/AdminLogin";

// CHANGED: moved all page-switching logic into an inner component so it can
// call useAuth() — useAuth() only works INSIDE <AuthProvider>, and the old
// App() was calling it (well, importing it) at the same level as the provider.
function AppContent() {
  const { user } = useAuth(); // CHANGED: added — this was missing entirely
  const isAdmin = user?.role === "admin"; // CHANGED: added — isAdmin was undefined before

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

        {/* CHANGED: was rendering <AdminDashboard> here — now correctly renders <AdminLogin> */}
        {activeLink === "admin-login" && (
          <AdminLogin setActiveLink={handlePageChange} />
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
  );
}

// CHANGED: App() now only sets up the provider and renders AppContent inside it
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}