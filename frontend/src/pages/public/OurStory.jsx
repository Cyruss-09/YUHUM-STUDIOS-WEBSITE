import { ourStoryContent } from "../../data/ourStoryContent.js";

export const OurStory = () => {
  const { bannerImage, bannerAlt, video, headline, address } = ourStoryContent;

  return (
    <section className="w-full bg-[#faf8f5] overflow-hidden">
      {/* 1. Top Banner Image - Clean full-width display */}
      <div className="w-full">
        <img
          src={bannerImage}
          alt={bannerAlt}
          className="w-full h-auto block object-cover"
        />
      </div>

      {/* 2. Video & Text Row */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column: Video */}
        <div className="w-full md:w-1/2 aspect-[3/4] md:h-[600px] overflow-hidden relative">
          <video
            src={video}
            muted
            autoPlay
            loop
            playsInline /* Crucial for iOS autoPlay compatibility */
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none md:hidden" />
        </div>

        {/* Right Column: Text Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-white text-center">
          <div className="max-w-md space-y-6 md:space-y-8">
            {/* Main Headline - Serif styling matching booking section */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-900 font-normal tracking-wide">
              {headline.normal}
              <span className="font-bold italic">{headline.emphasis}</span>
            </h2>

            <div className="w-12 h-[1px] bg-amber-800/30 mx-auto" />

            {/* Address Block - Refined typography & stone color palette */}
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans px-2 sm:px-4">
              {address.line1}
              <br />
              <span className="font-medium text-stone-800">{address.line2}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;