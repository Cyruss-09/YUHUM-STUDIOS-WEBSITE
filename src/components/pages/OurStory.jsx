import ourStory from "../../assets/Our-Story.png";
import storyVideo from "../../assets/our-story-video.mp4";

export const OurStory = () => {
  return (
    <section className="w-full bg-[#fdfbf7]">
      {/* 1. Top Banner Image - Responsive heights */}
      <div className="w-full">
        <img
          src={ourStory}
          alt="our-story"
          className="w-full h-auto block" /* 'h-auto' keeps the aspect ratio intact without cropping */
        />
      </div>

      {/* 2. Video & Text Row */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column: Video - Uses portrait aspect ratio on mobile to match the screenshot */}
        <div className="w-full md:w-1/2 aspect-[3/4] md:h-[600px] overflow-hidden">
          <video
            src={storyVideo}
            muted
            autoPlay
            loop
            playsInline /* Crucial for iOS autoPlay compatibility */
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Column: Text Content - Responsive padding and gaps */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 md:p-12 bg-white text-center">
          <div className="max-w-md space-y-6 md:space-y-12">
            {/* Main Headline - Scaled font sizes */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-black font-sans">
              for you, <span className="font-bold">by you.</span>
            </h2>

            {/* Address Block - Scaled text sizes */}
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed font-sans px-2 sm:px-4">
              Unit 2A, Mariquita Pueblo, 5 Sports Ave,
              <br />
              City of Santa Rosa, 4026 Laguna
            </p>
          </div>
        </div>
      </div>
      <footer className="w-full bg-amber-950 border-t border-amber-900/40 mt-auto py-12 px-6 md:px-12 text-stone-300 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand details */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
              Yuhum.Studios
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Crafting premium experiences with meticulous attention to detail
              and timeless aesthetics.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/yuhum.studios/"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/yuhum.studiosph"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@yuhumstudios?is_from_webapp=1&sender_device=pc"
                target="_blank"
                className="hover:text-amber-400 transition-colors duration-200"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.95 1.2 2.27 2.05 3.75 2.4v3.91c-1.63-.04-3.23-.55-4.63-1.38-.41-.25-.8-.54-1.15-.87v7.24c0 1.2-.23 2.39-.7 3.5-1.07 2.53-3.44 4.31-6.18 4.61-3.15.34-6.32-1.21-7.72-4.08C.1 17.06-.23 14 1.01 11.23c1.07-2.38 3.33-4.08 5.92-4.43 1.15-.15 2.33-.06 3.45.24v4c-.81-.29-1.69-.36-2.54-.2-1.32.25-2.52 1.07-3.17 2.24-.77 1.38-.85 3.09-.23 4.54.62 1.45 1.96 2.53 3.52 2.76 1.48.22 3.03-.26 3.99-1.39.75-.89.98-2.09.98-3.24V.02z" />
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
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Our Journal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
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
                <a
                  href="#book"
                  className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-400/50 transition-colors"
                >
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
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
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
          <p>
            &copy; {new Date().getFullYear()} Yuhum.Studios All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </section>
  );
};
