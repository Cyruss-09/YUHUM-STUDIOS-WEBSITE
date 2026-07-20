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
    </section>
  );
};
