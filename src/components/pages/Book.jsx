import { useEffect, useState } from "react";
import Pic25 from "../../assets/Pic25.jpg";
import Pic8 from "../../assets/Pic8.jpg";

// --- SUB-COMPONENT FOR THE INDIVIDUAL PACKAGE CARD ---
const PackageCard = ({ title, price, image, description, inclusions, altText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-[#F2F2F2] rounded-xl flex flex-col md:flex-row items-stretch overflow-hidden mb-4">
      {/* Left Side: Image */}
      <div className="w-full md:w-[220px] min-h-[250px] md:min-h-full shrink-0 relative">
        <img src={image} alt={altText} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* Right Side: Content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-black">{title}</h3>
              <span className="text-base text-neutral-800 block mt-0.5">{price}</span>
            </div>
            <button className="px-6 py-2.5 bg-[#e2e2e2] hover:bg-[#d5d5d5] rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-colors duration-150 shrink-0">
              Book
            </button>
          </div>

          <p className="font-normal text-black text-[15px] leading-relaxed mb-4">{description}</p>

          {isExpanded && (
            <div className="mt-4 text-neutral-900 text-[15px] leading-relaxed space-y-5 border-t border-neutral-200 pt-4">
              <div className="text-black font-normal">
                <span className="block mb-1 font-semibold">Package Inclusions:</span>
                <ul className="list-none space-y-1">
                  {inclusions.map((item, idx) => (
                    <li key={idx} className={item.indent ? "pl-3 text-neutral-800" : ""}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-5 py-2 border-2 border-black text-xs font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN BOOK COMPONENT ---
export const Book = ({ setActiveLink }) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (setActiveLink) setActiveLink("home");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [setActiveLink]);

  const studioAColors = [
    { name: "Wheat", bg: "bg-[#F5DEB3]", text: "text-[#5c4a3c]" },
    { name: "Scarlet red", bg: "bg-[#ED2100]", text: "text-white" },
    { name: "Marine blue", bg: "bg-[#01386A]", text: "text-white" },
  ];

  const studioBColors = [
    { name: "White", bg: "bg-white", text: "text-[#5c5c5c]", border: "border border-gray-200" },
    { name: "Blush pink", bg: "bg-[#F4C2C2]", text: "text-[#4a4540]" },
    { name: "Amber brown", bg: "bg-[#A6674C]", text: "text-white" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-gray-600 select-none">
      
      {/* WRAPPER FOR MAIN CONTENT (Keeps everything except the footer constrained and padded) */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-16 flex flex-col gap-16 flex-grow">
        
        {/* ================= SECTION 1: STUDIO BACKDROP GUIDE ================= */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 pt-12">
          <div className="w-full md:w-1/4 text-center md:text-left tracking-[0.2em] text-xs uppercase leading-relaxed text-gray-900 font-light">
            Let's take things to the next level, shall we?
          </div>

          <div className="w-full md:w-3/4 flex flex-col items-center md:items-end">
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-10 md:mr-24 italic lowercase font-serif" style={{ fontFamily: "'Caveat', cursive, sans-serif" }}>
              a quick studio backdrop guide
            </h2>

            <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="flex gap-4">
                  {studioAColors.map((color, idx) => (
                    <div key={idx} className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center p-4 text-center text-sm font-light tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}>
                      {color.name}
                    </div>
                  ))}
                </div>
                <span className="mt-4 font-bold text-sm tracking-wider text-black underline">Studio A</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex gap-4">
                  {studioBColors.map((color, idx) => (
                    <div key={idx} className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex items-center justify-center p-4 text-center text-sm font-light tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}>
                      {color.name}
                    </div>
                  ))}
                </div>
                <span className="mt-4 font-bold text-sm tracking-wider text-black underline">Studio B</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= APPOINTMENT SELECTION ================= */}
        <div className="w-full max-w-2xl mx-auto text-[#1a1a1a] px-4 md:px-0">
          <div className="flex items-center justify-center gap-2 mb-8 font-medium text-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>Select Appointment</span>
          </div>

          <h2 className="text-xl font-bold mb-4 tracking-wide">Self-Portraits</h2>
          <PackageCard
            title="Kadlaw"
            price="₱649.00"
            image={Pic25}
            altText="Couple Photo"
            description="A timeless studio session portraits with elegant printed keepsakes. Package Inclusions: • Good for 2 people • 1-hour appointment duration, 15-minute unlimited studio shoot • Can be a mix of headshots ..."
            inclusions={[
              { text: "• Good for up to 4 persons" },
              { text: "• For 2 pax" },
              { text: "• 15 minute self-shoot" },
              { text: "• 1 colored backdrop of choice" },
              { text: "• 2 4R Prints and 2 Photo Grids Strips" },
              { text: "• Soft copies of Select Photos (5)" },
              { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
              { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
            ]}
          />

          <h2 className="text-xl font-bold mb-4 tracking-wide mt-8">Groups</h2>
          <PackageCard
            title="Gugma"
            price="₱1,499"
            image={Pic8}
            altText="Group Photo"
            description="A session designed for families, friends, or medium-sized groups who want timeless studio portraits."
            inclusions={[
              { text: "• For 5 pax" },
              { text: "• 20 minute self-shoot" },
              { text: "• 15 minute self-shoot" },
              { text: "• 15 minute photo selection" },
              { text: "• 1 colored backdrop of choice" },
              { text: "• 5 4R Prints and 6 Photo Grids Strips" },
              { text: "• Soft copies of Select Photos (10)" },
              { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
              { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
            ]}
          />
        </div>
      </div>

      {/* --- BRANDED MINIMALIST FOOTER (Now breaks layout and expands full screen width) --- */}
      <footer className="w-full bg-amber-950 border-t border-amber-900/40 mt-auto py-12 px-6 md:px-12 text-stone-300 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
              The Brand
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Crafting premium experiences with meticulous attention to detail and timeless aesthetics.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-amber-400 transition-colors duration-200" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-200" aria-label="Pinterest">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Our Journal</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Contact/Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Appointments
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Mon — Fri: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 5:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

          {/* Column 4: Newsletter Sign-up */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Stay Connected
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-amber-900/30 text-stone-200 border border-amber-800/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-500" 
              />
              <button 
                type="submit" 
                className="bg-white hover:bg-stone-100 text-amber-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="max-w-7xl mx-auto border-t border-amber-900/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
          <p>&copy; {new Date().getFullYear()} The Brand. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Book;