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
      <footer className="w-full bg-amber-950 border-t border-stone-200 mt-auto py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-white font-serif text-lg font-bold tracking-widest uppercase m-0">
              YUHUM.STUDIOS
            </h3>
            <p className="text-stone-400 font-sans text-[11px] uppercase tracking-widest mt-1">
              Santa Rosa, Laguna, Philippines
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-normal tracking-wider uppercase text-white">
            <a href="#" className="hover:text-black transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-black transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-black transition-colors duration-200">Contact Us</a>
          </div>

          <p className="text-stone-400 font-sans text-[11px] tracking-wide">
            &copy; {new Date().getFullYear()} YUHUM STUDIO. All rights reserved.
          </p>
        </div>
      </footer>

    </section>
  );
};