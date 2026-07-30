// Pure date helper — no React, no state, easy to unit test in isolation.
export const getWeekdayName = (dayNumber, year = 2026, month = 6) => {
  const dateObj = new Date(year, month, dayNumber); // month is 0-indexed (6 = July)
  return dateObj.toLocaleDateString("en-US", { weekday: "long" });
};
