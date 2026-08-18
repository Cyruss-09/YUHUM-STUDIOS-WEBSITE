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

/**
 * Format a calendar year, 0-indexed month, and day into "YYYY-MM-DD"
 */
export const formatDateToYMD = (year, month, day) => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

/**
 * Check if a given date is in the studio's blackout / closed dates list
 */
export const isBlackoutDate = (year, month, day, blackoutDates = []) => {
  if (!Array.isArray(blackoutDates) || blackoutDates.length === 0) return false;
  const targetDateStr = formatDateToYMD(year, month, day);
  return blackoutDates.includes(targetDateStr);
};

/**
 * Parses time strings like "10:00 AM", "8:00 PM", "18:00", "09:30 am", etc.
 * Returns total minutes from midnight (0 to 1439), or null if unparseable.
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3] ? match[3].toLowerCase() : null;

  if (meridian === "pm" && hours < 12) {
    hours += 12;
  } else if (meridian === "am" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight (e.g. 630) to formatted 12-hour string (e.g. "10:30 AM")
 */
export const formatMinutesToTime = (totalMinutes) => {
  let hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const meridian = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hours12}:${minsStr} ${meridian}`;
};

/**
 * Dynamically generates time slots between openTime and closeTime given slotDurationMinutes
 */
export const generateTimeSlots = (
  openTimeStr = "10:00 AM",
  closeTimeStr = "06:00 PM",
  slotDurationMinutes = 30
) => {
  const startMins = parseTimeToMinutes(openTimeStr) ?? 600; // 10:00 AM default
  const endMins = parseTimeToMinutes(closeTimeStr) ?? 1080; // 06:00 PM default
  const duration = parseInt(slotDurationMinutes, 10) || 30;

  if (startMins >= endMins || duration <= 0) {
    return [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "1:00 PM",
      "1:30 PM",
      "2:00 PM",
      "2:30 PM",
      "3:00 PM",
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
      "5:00 PM",
      "5:30 PM",
      "6:00 PM",
    ];
  }

  const slots = [];
  for (let current = startMins; current <= endMins; current += duration) {
    slots.push(formatMinutesToTime(current));
  }

  return slots;
};
