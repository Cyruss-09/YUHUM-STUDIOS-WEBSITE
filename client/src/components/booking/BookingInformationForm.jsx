import React from "react";
import { CountryCodeDropdown } from "./CountryCodeDropdown";

// Pure UI: renders the "your information" step. All data + behavior
// (formData, handlers, submit) are passed in as props.
export const BookingInformationForm = ({
  pendingBooking,
  formData,
  onInputChange,
  onCountryCodeChange,
  onBack,
  onSubmit,
}) => (
  <div className="w-full max-w-4xl mx-auto">
    <div className="text-center mb-6">
      <button onClick={onBack} className="text-xs tracking-widest text-stone-400 hover:underline uppercase font-bold">
        &lt; Date &amp; Time
      </button>
      <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Your Information</h2>
    </div>

    {/* Appointment Summary Card */}
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4 relative">
      <div className="flex gap-4 items-start">
        <img src={pendingBooking.image} alt={pendingBooking.packageTitle} className="w-28 h-28 object-cover rounded-xl" />
        <div>
          <h3 className="font-bold text-stone-900 capitalize text-lg">
            {pendingBooking.packageTitle} with {pendingBooking.studio}
          </h3>
          <p className="text-amber-800 font-bold text-sm mt-0.5">{pendingBooking.basePrice}</p>
          <p className="text-xs text-stone-500 mt-1">
            {pendingBooking.dayOfWeek}, {pendingBooking.date} at {pendingBooking.time}
          </p>
          <p className="text-xs text-stone-600 mt-2 line-clamp-2">{pendingBooking.description}</p>
        </div>
      </div>
      <button onClick={onBack} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 text-sm font-bold">
        ✕
      </button>
    </div>

    <form onSubmit={onSubmit} className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">First name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onInputChange}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Last name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onInputChange}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Phone *</label>
            <div className="flex border border-stone-200 rounded-xl bg-stone-50 overflow-hidden focus-within:border-stone-900">
              <CountryCodeDropdown value={formData.countryCode} onChange={onCountryCodeChange} />
              <input
                type="text"
                name="phone"
                inputMode="numeric"
                maxLength={15}
                value={formData.phone}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  onInputChange(e);
                }}
                required
                placeholder="Phone number"
                className="w-full bg-transparent p-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="example@gmail.com"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Use a comma or press enter/return to add additional email addresses
            </span>
          </div>
        </div>

        <div>
          <div className="border-b border-stone-200 pb-2 flex justify-between items-center cursor-pointer">
            <span className="text-sm font-bold text-stone-800">Package, gift, or coupon code</span>
            <span className="text-lg font-light">+</span>
          </div>
          <input
            type="text"
            name="couponCode"
            value={formData.couponCode}
            onChange={onInputChange}
            placeholder="Enter code (optional)"
            className="w-full mt-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 mt-6 mb-8">
        <input
          type="checkbox"
          name="termsAccepted"
          id="terms"
          checked={formData.termsAccepted}
          onChange={onInputChange}
          required
          className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-stone-500 leading-relaxed">
          By checking, you accept Terms of Service, acknowledge that you have read and understood our Privacy Policy
          and consent to receive SMS communications about your appointments and/or waitlist availability from this
          scheduling business. Message frequency may vary. Message and data rates may apply. Reply HELP for help or
          STOP to opt-out.
        </label>
      </div>

      <div className="border-t border-stone-200 pt-6 mt-6">
        <h3 className="text-base font-serif font-bold text-stone-900 mb-4">Additional Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">How did you find us?</label>
            <select
              name="findUs"
              value={formData.findUs}
              onChange={onInputChange}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none"
            >
              <option value="">Select an option</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Friend">Friend / Referral</option>
              <option value="Google">Google Search</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Mode of Payment *</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={onInputChange}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-900"
            >
              <option value="">Select an option</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash on-site</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-100">
        <button
          type="submit"
          className="w-full bg-stone-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition shadow-lg shadow-stone-900/10"
        >
          Complete Booking
        </button>
      </div>
    </form>
  </div>
);

export default BookingInformationForm;
