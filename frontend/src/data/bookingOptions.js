// Static reference data for the booking flow. Kept separate from
// components/hooks so pricing/slot changes don't touch any logic.

export const ADD_ONS = [
  { key: "add_head", label: "+1 adult", price: "₱250.00" },
  { key: "add_pet", label: "+1 pet", price: "₱100.00" },
  { key: "add_4r_print", label: "+1 4R Print", price: "₱50.00" },
  { key: "add_grid_strips", label: "+1 2x Photo Grid Strips", price: "₱50.00" },
  { key: "raw_photos", label: "All Raw Photos", price: "₱400.00" },
  { key: "hair_makeup", label: "Hair & Makeup Service", price: "₱2,500.00" },
  {
    key: "studio_rental",
    label: "Rental Studio (Rate is per hour)",
    price: "₱1,000.00",
  },
];

export const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
];

export const DAYS_IN_JULY = Array.from({ length: 31 }, (_, i) => i + 1);

export const STUDIO_A_COLORS = [
  { name: "Wheat", bg: "bg-[#F5DEB3]", text: "text-[#5c4a3c]" },
  { name: "Scarlet red", bg: "bg-[#ED2100]", text: "text-white" },
  { name: "Marine blue", bg: "bg-[#01386A]", text: "text-white" },
];

export const STUDIO_B_COLORS = [
  {
    name: "White",
    bg: "bg-white",
    text: "text-[#5c5c5c]",
    border: "border border-stone-200",
  },
  { name: "Blush pink", bg: "bg-[#F4C2C2]", text: "text-[#4a4540]" },
  { name: "Amber brown", bg: "bg-[#A6674C]", text: "text-white" },
];

// The two bookable packages. Import the images where this is consumed
// (Book/index.jsx) since paths are relative to the app's asset folder.
export const PACKAGES = {
  kadlaw: {
    id: "kadlaw",
    title: "Kadlaw",
    price: "₱649.00",
    altText: "Couple Photo",
    description:
      "A timeless studio session featuring elegant printed keepsakes and an intimate self-shoot environment.",
    group: "Self-Portraits & Packages",
    inclusions: [
      { text: "• Good for up to 4 persons" },
      { text: "• 15 minute self-shoot session" },
      { text: "• 1 colored backdrop of choice" },
      { text: "• 2 4R Prints and 2 Photo Grids Strips" },
      { text: "• Soft copies of Select Photos (5)" },
      { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
      { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
    ],
  },
  gugma: {
    id: "gugma",
    title: "Gugma",
    price: "₱1,499.00",
    altText: "Group Photo",
    description:
      "A session designed for families, friends, or medium-sized groups who want comprehensive coverage and gorgeous keepsakes.",
    group: "Groups & Families",
    inclusions: [
      { text: "• For up to 5 pax" },
      { text: "• 20 minute self-shoot session" },
      { text: "• 15 minute photo selection window" },
      { text: "• 1 colored backdrop of choice" },
      { text: "• 5 4R Prints and 6 Photo Grids Strips" },
      { text: "• Soft copies of Select Photos (10)" },
      { text: "Studio A – Wheat, Scarlet Red, Marine Blue", indent: true },
      { text: "Studio B – White, Blush Pink, Amber Brown", indent: true },
    ],
  },
};
