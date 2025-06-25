import { addDays } from './dateUtils';

// Constants for Hijri calendar calculations
const ISLAMIC_EPOCH = 1948439.5; // Julian day for 1 Muharram 1 AH
const CIVIL_EPOCH = 1721425.5;   // Julian day for 1 January 1 CE

// Hijri month names
export const hijriMonthNames = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah"
];

// Convert Gregorian date to Julian day
const gregorianToJulian = (year: number, month: number, day: number): number => {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  return Math.floor(365.25 * (year + 4716)) + 
         Math.floor(30.6001 * (month + 1)) + 
         day + b - 1524.5;
};

// Convert Julian day to Hijri date
const julianToHijri = (jd: number): { year: number, month: number, day: number } => {
  jd = Math.floor(jd) + 0.5;
  const year = Math.floor(((30 * (jd - ISLAMIC_EPOCH)) + 10646) / 10631);
  const month = Math.min(12, Math.ceil((jd - (29 + julianForHijri(year, 1, 1))) / 29.5) + 1);
  const day = (jd - julianForHijri(year, month, 1)) + 1;
  
  return { year, month, day };
};

// Calculate Julian day for a given Hijri date
const julianForHijri = (year: number, month: number, day: number): number => {
  return day + 
         Math.ceil(29.5 * (month - 1)) + 
         (year - 1) * 354 + 
         Math.floor((3 + (11 * year)) / 30) + 
         ISLAMIC_EPOCH - 1;
};

// Convert Gregorian date to Hijri date
export const gregorianToHijri = (date: Date): { year: number, month: number, day: number } => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const jd = gregorianToJulian(year, month, day);
  return julianToHijri(jd);
};

// Get Islamic events for a specific Hijri date
export const getIslamicEventsForDate = (
  hijriDate: { year: number, month: number, day: number },
  islamicEvents: Array<{ name: string, day: number, month: number }>
) => {
  return islamicEvents.filter(event => 
    event.month === hijriDate.month && event.day === hijriDate.day
  );
};

// Get Hijri date string
export const getHijriDateString = (date: Date): string => {
  const hijri = gregorianToHijri(date);
  return `${hijriMonthNames[hijri.month - 1]} ${hijri.day}, ${hijri.year}`;
};

// Get all Hijri dates for a month
export const getHijriDatesForMonth = (year: number, month: number): Array<{ 
  gregorianDate: Date, 
  hijriDate: { year: number, month: number, day: number } 
}> => {
  const result = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const gregorianDate = new Date(year, month, day);
    const hijriDate = gregorianToHijri(gregorianDate);
    result.push({ gregorianDate, hijriDate });
  }
  
  return result;
};

// Check if a date is the first day of a Hijri month
export const isFirstDayOfHijriMonth = (date: Date): boolean => {
  const hijri = gregorianToHijri(date);
  const yesterday = addDays(date, -1);
  const yesterdayHijri = gregorianToHijri(yesterday);
  
  return hijri.day === 1 || hijri.month !== yesterdayHijri.month;
};

// Get Hijri months that overlap with a Gregorian month
export const getHijriMonthsForGregorianMonth = (year: number, month: number): string[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const firstDayHijri = gregorianToHijri(firstDay);
  const lastDayHijri = gregorianToHijri(lastDay);
  
  if (firstDayHijri.month === lastDayHijri.month) {
    return [hijriMonthNames[firstDayHijri.month - 1]];
  }
  
  const months = new Set<string>();
  let currentDate = new Date(firstDay);
  
  while (currentDate <= lastDay) {
    const hijri = gregorianToHijri(currentDate);
    months.add(hijriMonthNames[hijri.month - 1]);
    currentDate = addDays(currentDate, 1);
  }
  
  return Array.from(months);
};