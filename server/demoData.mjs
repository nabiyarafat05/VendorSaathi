/**
 * demoData.mjs
 *
 * Seeded history for the demo vendor ("Ramesh", Lucknow tea/samosa stall).
 * Per the implementation guide (section 9C): if a real DB or weather call
 * fails during judging, the app should fall back to this data and show a
 * small "Demo data" label, rather than breaking.
 *
 * In-memory only for now — swap this for real Supabase/Firebase reads
 * once persistence is wired up (see /api/checkin below).
 */

export const demoUnitPrices = {
  samosa: 12,
  tea: 10,
};

// 14 days of seeded history, oldest first. Weekdays intentionally repeat
// twice so averageSoldOnWeekday() has real same-weekday data to use.
export const demoHistory = [
  { date: '2026-08-07', weekday: 'Friday', items: [
    { name: 'samosa', sold: 85, leftover: 10, unitPrice: 12 },
    { name: 'tea', sold: 110, leftover: 5, unitPrice: 10 },
  ], expenses: 480 },
  { date: '2026-08-08', weekday: 'Saturday', items: [
    { name: 'samosa', sold: 95, leftover: 8, unitPrice: 12 },
    { name: 'tea', sold: 130, leftover: 0, unitPrice: 10 },
  ], expenses: 520 },
  { date: '2026-08-09', weekday: 'Sunday', items: [
    { name: 'samosa', sold: 100, leftover: 12, unitPrice: 12 },
    { name: 'tea', sold: 140, leftover: 4, unitPrice: 10 },
  ], expenses: 540 },
  { date: '2026-08-10', weekday: 'Monday', items: [
    { name: 'samosa', sold: 70, leftover: 6, unitPrice: 12 },
    { name: 'tea', sold: 95, leftover: 2, unitPrice: 10 },
  ], expenses: 430 },
  { date: '2026-08-11', weekday: 'Tuesday', items: [
    { name: 'samosa', sold: 75, leftover: 9, unitPrice: 12 },
    { name: 'tea', sold: 100, leftover: 3, unitPrice: 10 },
  ], expenses: 445 },
  { date: '2026-08-12', weekday: 'Wednesday', items: [
    { name: 'samosa', sold: 82, leftover: 14, unitPrice: 12 },
    { name: 'tea', sold: 108, leftover: 6, unitPrice: 10 },
  ], expenses: 460 },
  { date: '2026-08-13', weekday: 'Thursday', items: [
    { name: 'samosa', sold: 88, leftover: 11, unitPrice: 12 },
    { name: 'tea', sold: 115, leftover: 2, unitPrice: 10 },
  ], expenses: 470 },
  { date: '2026-08-14', weekday: 'Friday', items: [
    { name: 'samosa', sold: 90, leftover: 13, unitPrice: 12 },
    { name: 'tea', sold: 118, leftover: 4, unitPrice: 10 },
  ], expenses: 490 },
  { date: '2026-08-15', weekday: 'Saturday', items: [
    { name: 'samosa', sold: 98, leftover: 9, unitPrice: 12 },
    { name: 'tea', sold: 135, leftover: 3, unitPrice: 10 },
  ], expenses: 525 },
  { date: '2026-08-16', weekday: 'Sunday', items: [
    { name: 'samosa', sold: 105, leftover: 15, unitPrice: 12 },
    { name: 'tea', sold: 145, leftover: 5, unitPrice: 10 },
  ], expenses: 550 },
  { date: '2026-08-17', weekday: 'Monday', items: [
    { name: 'samosa', sold: 72, leftover: 7, unitPrice: 12 },
    { name: 'tea', sold: 98, leftover: 1, unitPrice: 10 },
  ], expenses: 435 },
  { date: '2026-08-18', weekday: 'Tuesday', items: [
    { name: 'samosa', sold: 78, leftover: 10, unitPrice: 12 },
    { name: 'tea', sold: 102, leftover: 4, unitPrice: 10 },
  ], expenses: 450 },
  { date: '2026-08-19', weekday: 'Wednesday', items: [
    { name: 'samosa', sold: 84, leftover: 16, unitPrice: 12 },
    { name: 'tea', sold: 112, leftover: 7, unitPrice: 10 },
  ], expenses: 465 },
  { date: '2026-08-20', weekday: 'Thursday', items: [
    { name: 'samosa', sold: 80, leftover: 15, unitPrice: 12 },
    { name: 'tea', sold: 120, leftover: 0, unitPrice: 10 },
  ], expenses: 500 },
];

// Fallback weather used only if the real weather API call fails.
export const demoWeatherFallback = {
  condition: 'rain',
  rainProbability: 40,
  temperatureC: 26,
  isDemoData: true,
};
