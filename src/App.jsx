import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/sections/Home";
import { Book } from "./components/sections/Book";

export default function App() {
  const [activeLink, setActiveLink] = useState("home");

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navbar activeLink={activeLink} setActiveLink={setActiveLink} />
      
      <main className="w-full">
        {activeLink === "home" && <Home />}
        {/* Pass setActiveLink here so Book can change pages if needed */}
        {activeLink === "book" && <Book setActiveLink={setActiveLink} />}
        
        {activeLink === "story" && <div className="p-10 text-center">Our Story Section</div>}
        {activeLink === "faqs" && <div className="p-10 text-center">Rate Us Section</div>}
      </main>
    </div>
  );
}