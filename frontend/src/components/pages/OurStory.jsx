import ourStory from "../../assets/Our-Story.png";
import storyVideo from "../../assets/our-story-video.mp4";

export const OurStory = () => {
  return (
    <section className="w-full bg-[#faf8f5] overflow-hidden">
      {/* 1. Top Banner Image - Clean full-width display */}
      <div className="w-full">
        <img
          src={ourStory}
          alt="our-story"
          className="w-full h-auto block object-cover"
        />
      </div>

      {/* 2. Video & Text Row */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column: Video */}
        <div className="w-full md:w-1/2 aspect-[3/4] md:h-[600px] overflow-hidden relative">
          <video
            src={storyVideo}
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
              for you, <span className="font-bold italic">by you.</span>
            </h2>

            <div className="w-12 h-[1px] bg-amber-800/30 mx-auto" />

            {/* Address Block - Refined typography & stone color palette */}
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans px-2 sm:px-4">
              Unit 2A, Mariquita Pueblo, 5 Sports Ave,
              <br />
              <span className="font-medium text-stone-800">City of Santa Rosa, 4026 Laguna</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;