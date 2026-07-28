
import React from 'react'

const PackageSection = () => {
  return (
    <div>
         {/* ================= APPOINTMENT SELECTION ================= */}
            <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-800 font-bold text-xs uppercase tracking-widest">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span>Seamless Online Reservation</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide">
                Self-Portraits & Packages
              </h2>

              <div className="space-y-4 mb-8">
                <PackageCard
                  id="kadlaw"
                  title="Kadlaw"
                  price="₱649.00"
                  image={Pic25}
                  altText="Couple Photo"
                  description="A timeless studio session featuring elegant printed keepsakes and an intimate self-shoot environment."
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                  inclusions={[
                    { text: "• Good for up to 4 persons" },
                    { text: "• 15 minute self-shoot session" },
                    { text: "• 1 colored backdrop of choice" },
                    { text: "• 2 4R Prints and 2 Photo Grids Strips" },
                    { text: "• Soft copies of Select Photos (5)" },
                    {
                      text: "Studio A – Wheat, Scarlet Red, Marine Blue",
                      indent: true,
                    },
                    {
                      text: "Studio B – White, Blush Pink, Amber Brown",
                      indent: true,
                    },
                  ]}
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center tracking-wide mt-12">
                Groups & Families
              </h2>

              <div className="space-y-4">
                <PackageCard
                  id="gugma"
                  title="Gugma"
                  price="₱1,499.00"
                  image={Pic8}
                  altText="Group Photo"
                  description="A session designed for families, friends, or medium-sized groups who want comprehensive coverage and gorgeous keepsakes."
                  activeBookingId={activeBookingId}
                  setActiveBookingId={setActiveBookingId}
                  onProceedToForm={setPendingBooking}
                  inclusions={[
                    { text: "• For up to 5 pax" },
                    { text: "• 20 minute self-shoot session" },
                    { text: "• 15 minute photo selection window" },
                    { text: "• 1 colored backdrop of choice" },
                    { text: "• 5 4R Prints and 6 Photo Grids Strips" },
                    { text: "• Soft copies of Select Photos (10)" },
                    {
                      text: "Studio A – Wheat, Scarlet Red, Marine Blue",
                      indent: true,
                    },
                    {
                      text: "Studio B – White, Blush Pink, Amber Brown",
                      indent: true,
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PackageSection
