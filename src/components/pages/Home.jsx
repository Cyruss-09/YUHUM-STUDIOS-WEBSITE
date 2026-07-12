import { useState } from "react";

export const Home = () => {
  // Track which feature is currently clicked (defaults to null)
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      id: 1,
      text: "Level-up your portraits.",
      imageUrl: "/src/assets/Pic19.jpg", 
      description: "Step in front of professional lighting optimized entirely for your style. Our self-portrait setups ensure high-definition quality where you can craft crisp, magazine-ready shots.",
    },
    {
      id: 2,
      text: "Make core memories.",
      imageUrl: "/src/assets/Pic8.jpg", 
      description: "Drop your guard and have genuine fun. Whether you come with friends, a loved one, or solo, the real experience is the unscripted core memory you make during the session.",
    },
    {
      id: 3,
      text: "Quality time = Quality photos",
      imageUrl: "/src/assets/Pic1.jpg", 
      description: "Take command of your portrait session with your own private wireless clicker. Without external photographers in the booth, there is zero pressure—giving you fully authentic captures.",
    },
    {
      id: 4,
      text: "Bring your furry friends!",
      imageUrl: "/src/assets/Pic11.jpg", 
      description: "Pets are absolute family! Our space is welcoming to all dogs, cats, and small companions, allowing you to easily immortalize their unique traits right next to yours.",
    },
  ];

  const handleCardClick = (id) => {
    setSelectedFeature(selectedFeature === id ? null : id);
  };

  const activeItem = features.find((item) => item.id === selectedFeature);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-stone-50 pt-16 w-full gap-24">
      
      {/* --- HERO / INTRODUCTION SECTION --- */}
      <div className="flex flex-col items-center gap-8 w-full px-6">
        {/* Video Container */}
        <div className="w-full max-w-sm overflow-hidden rounded-xl shadow-lg">
          <video
            src="/9gridsvideos.mp4"
            className="w-full h-auto object-cover block"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>

        {/* Text Grouping container */}
        <div className="flex flex-col items-center gap-4 max-w-3xl text-center">
          <h2 className="text-black font-sans text-xl md:text-2xl font-bold tracking-wide lowercase">
            a photo studio for you, by you.
          </h2>

          <p className="text-gray-500 font-sans text-xs md:text-sm font-normal leading-relaxed tracking-widest uppercase">
            YUHUM STUDIO IS A SELF-PHOTOGRAPHY STUDIO BASED IN SANTA ROSA CITY,
            LAGUNA PHILIPPINES. IN OUR STUDIO, WE PROVIDE THE BEST SELF-PORTRAIT
            EXPERIENCE WHICH CELEBRATES YOUR MOST AUTHENTIC SELF.
          </p>
        </div>

        {/* Rounded CTA Button */}
        <div className="pt-2">
          <a
            href="#book"
            className="inline-block bg-[#1a1919] hover:bg-black text-white font-sans text-sm md:text-base font-normal tracking-wide px-8 py-4 rounded-full transition-colors duration-200 shadow-sm"
          >
            book an appointment
          </a>
        </div>
      </div>

      {/* --- RESPONSIVE FEATURES PHOTO GRID WITH DESCRIPTION --- */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 px-6">
        {/* The Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className={`relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden shadow-sm group cursor-pointer transition-all duration-300
                ${selectedFeature === item.id ? "ring-4 ring-amber-950/30 scale-[0.98]" : ""}`}
            >
              <img
                src={item.imageUrl}
                alt={item.text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/10">
                <div className="w-[260px] h-[60px] flex items-center justify-center  bg-white/10 border border-white/40 text-white font-sans text-sm md:text-base font-semibold tracking-wide text-center px-4 rounded-full shadow-md">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Display Area at the Bottom */}
        <div className="min-h-[120px] flex items-center justify-center w-full transition-all duration-300">
          {activeItem ? (
            <div className="w-full max-w-3xl mx-auto text-center bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm transition-all duration-300">
              <h4 className="text-amber-950 font-sans text-sm md:text-base font-bold uppercase tracking-wider mb-2">
                {activeItem.text}
              </h4>
              <p className="text-gray-600 font-sans text-sm leading-relaxed max-w-2xl mx-auto">
                {activeItem.description}
              </p>
            </div>
          ) : (
            <p className="text-stone-400 font-sans text-xs md:text-sm tracking-wide italic">
              * click on any photo card above to see details.
            </p>
          )}
        </div>
      </div>

      {/* --- MINIMALIST LOCATION SECTION --- */}
      <div className="w-full max-w-5xl mx-auto px-6 flex flex-col gap-8 items-center">
        {/* Section Title Header */}

        {/* Responsive Grid Split (Map left, text right) */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 pt-4">
          
          {/* Map Frame wrapper */}
          <div className="w-full md:w-1/2 overflow-hidden rounded-xl border border-stone-200 shadow-sm">
            <img 
              src="/src/assets/location.png" // Save your map capture inside the public directory
              alt="Yuhum Studio Location Map" 
              className="w-full h-[240px] md:h-[280px] object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
            />
          </div>

          {/* Location Content Details */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex items-center gap-2 text-stone-800">
              {/* Location Pin Icon */}
              <svg className="w-5 h-5 shrink-0 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-sans text-sm md:text-base font-medium tracking-wide lowercase">
                santa rosa city, laguna
              </span>
            </div>

            {/* Custom Directions Action link button */}
            <a 
              href="https://www.google.com/maps/place/The+Yuh%C3%BAm+Studios:+Self-shoot+X+Makeup/@14.2811949,121.1208636,16z/data=!4m6!3m5!1s0x3397d9d64411a5a9:0xe6cb1e3c3a788c04!8m2!3d14.2812036!4d121.1209445!16s%2Fg%2F11s4z97lg_?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D" // Update with your actual Google Maps pin share URL
              target="_blank" 
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-black font-sans text-xs font-normal tracking-wider underline underline-offset-4 decoration-stone-300 transition-colors duration-200"
            >
              get directions
            </a>
          </div>

        </div>
      </div>

      {/* --- BRANDED MINIMALIST FOOTER --- */}
       {/* FIXED FOOTER */}
      <footer className="w-full bg-amber-950 border-t border-amber-900/40 mt-auto py-12 px-6 md:px-12 text-stone-300 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand details */}
          <div className="md:col-span-1 space-y-4">
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
              <li className="pt-2">
                <a href="#book" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-400/50 transition-colors">
                  Book Online &rarr;
                </a>
              </li>
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
          <p>&copy; {new Date().getFullYear()} Yuhum.Studios All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </footer>

    </section>
  );
};