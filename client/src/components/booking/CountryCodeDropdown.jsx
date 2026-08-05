import React, { useEffect, useRef, useState } from "react";
import { COUNTRIES } from "../../data/countries";

// Purely presentational: the only state here is UI state (is the panel
// open, what's typed in the search box) — never business data. The
// selected value and the change handler both come from the parent.
export const CountryCodeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCountry =
    COUNTRIES.find(
      (c) => c.code === value && c.flag === (value === "+63" ? "🇵🇭" : c.flag),
    ) ||
    COUNTRIES.find((c) => c.code === value) ||
    COUNTRIES.find((c) => c.name === "Philippines");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery),
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full bg-stone-100 border-r border-stone-200 px-3.5 py-3 text-sm flex items-center gap-2 hover:bg-stone-200/60 transition focus:outline-none"
      >
        <span className="text-base leading-none">{selectedCountry?.flag}</span>
        <span className="font-medium text-stone-800">{selectedCountry?.code}</span>
        <svg
          className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in duration-150">
          <div className="p-2.5 border-b border-stone-100 bg-stone-50">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, idx) => {
                const isSelected =
                  selectedCountry?.name === country.name &&
                  selectedCountry?.code === country.code;
                return (
                  <button
                    key={`${country.name}-${country.code}-${idx}`}
                    type="button"
                    onClick={() => {
                      onChange(country.code);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                      isSelected ? "bg-blue-600 text-white font-medium" : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-sm">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <span className={`font-mono text-[11px] ml-2 ${isSelected ? "text-blue-100" : "text-stone-400"}`}>
                      {country.code}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-stone-400 text-center">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeDropdown;
