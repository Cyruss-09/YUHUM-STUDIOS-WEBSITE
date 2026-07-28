 {/* --- STUDIO SELECTION PANEL --- */}
      {isBookingOpen && (
        <div className="w-full mt-4 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {/* Base Studio Box */}
          <div className="w-full bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-stone-50/80 px-6 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
                Step 1: Choose Your Studio Space
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              <div className="flex items-center justify-between p-6 hover:bg-stone-50/50 transition-colors">
                <div>
                  <span className="font-bold text-lg text-stone-900 block capitalize">
                    Studio A
                  </span>
                  <span className="text-xs text-stone-500">
                    Wheat, Scarlet Red, Marine Blue
                  </span>
                </div>
                <button
                  onClick={() => handleStudioSelect("Studio A")}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                    selectedStudio === "Studio A"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                  }`}
                >
                  {selectedStudio === "Studio A" ? "Selected" : "Select"}
                </button>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-stone-50/50 transition-colors">
                <div>
                  <span className="font-bold text-lg text-stone-900 block capitalize">
                    Studio B
                  </span>
                  <span className="text-xs text-stone-500">
                    White, Blush Pink, Amber Brown
                  </span>
                </div>
                <button
                  onClick={() => handleStudioSelect("Studio B")}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                    selectedStudio === "Studio B"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                  }`}
                >
                  {selectedStudio === "Studio B" ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>