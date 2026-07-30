import React from "react";
import { STUDIO_A_COLORS, STUDIO_B_COLORS } from "../../data/bookingOptions";

// Pure display — no state, no handlers. Just renders the palette swatches.
export const StudioBackdropGuide = () => (
  <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 bg-white border border-stone-200/80 p-8 md:p-12 rounded-3xl shadow-sm">
    <div className="w-full md:w-1/3 text-center md:text-left">
      <span className="tracking-[0.25em] text-[11px] uppercase font-bold text-amber-800 block mb-3">
        Atmosphere & Aesthetic
      </span>
      <h2 className="text-3xl md:text-4xl text-stone-900 font-serif lowercase italic">
        a quick studio backdrop guide
      </h2>
      <p className="text-stone-500 text-sm mt-3 leading-relaxed">
        Explore our curated palette of backdrops available across our two dedicated studio environments.
      </p>
    </div>

    <div className="w-full md:w-2/3 flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-8">
      {[
        { label: "Studio A", colors: STUDIO_A_COLORS },
        { label: "Studio B", colors: STUDIO_B_COLORS },
      ].map(({ label, colors }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="flex gap-2.5">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center p-3 text-center text-xs font-medium tracking-wide shadow-sm ${color.bg} ${color.text} ${color.border || ""}`}
              >
                {color.name}
              </div>
            ))}
          </div>
          <span className="mt-3 font-bold text-xs tracking-wider text-stone-900 uppercase">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StudioBackdropGuide;
