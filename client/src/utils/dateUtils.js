// Pure date helper — no React, no state, easy to unit test in isolation.
export const getWeekdayName = (dayNumber, year = 2026, month = 6) => {
  const dateObj = new Date(year, month, dayNumber); // month is 0-indexed (6 = July)
  return dateObj.toLocaleDateString("en-US", { weekday: "long" });
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const blanks = Array.from({ length: firstWeekday }, () => null);
  const days = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
  return [...blanks, ...days];
};

export const isPastDate = (year, month, day) => {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return new Date(year, month, day) < todayStart;
};
