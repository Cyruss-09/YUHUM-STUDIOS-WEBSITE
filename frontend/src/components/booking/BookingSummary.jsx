
            {/* Appointment Summary Card */}
            <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4 relative">
              <div className="flex gap-4 items-start">
                <img
                  src={pendingBooking.image}
                  alt={pendingBooking.packageTitle}
                  className="w-28 h-28 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-stone-900 capitalize text-lg">
                    {pendingBooking.packageTitle} with {pendingBooking.studio}
                  </h3>
                  <p className="text-amber-800 font-bold text-sm mt-0.5">
                    {pendingBooking.basePrice}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {pendingBooking.dayOfWeek}, {pendingBooking.date} at{" "}
                    {pendingBooking.time}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">
                    {pendingBooking.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingBooking(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>