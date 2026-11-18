export const HOUR_H = 48; // px per hour
export const MINUTES_PER_DAY = 24 * 60;

export const pad = (n: number) => String(n).padStart(2, '0');

/** "HH:mm" (or "24:00") → minutes since midnight */
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fmtHHmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** Item timestamps are local "YYYY-MM-DDTHH:mm" strings. */
export const dayOf = (ts: string) => ts.slice(0, 10);
export const minOf = (ts: string) => toMin(ts.slice(11));
export const makeTs = (day: string, min: number) => `${day}T${fmtHHmm(min)}`;

const parseDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (day: string, n: number) => {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return isoDay(d);
};
/** Weeks start on Sunday. */
export const weekStart = (day: string) => addDays(day, -parseDay(day).getDay());
export const weekDays = (day: string) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(day), i));

export const dayLabel = (day: string) => ({
  weekday: parseDay(day).toLocaleDateString('en-US', { weekday: 'short' }),
  date: parseDay(day).getDate(),
});
export const monthLabel = (day: string) => parseDay(day).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const meridiem = (min: number) => (min >= 720 && min < MINUTES_PER_DAY ? 'pm' : 'am');
const clock = (min: number) => {
  const h = Math.floor(min / 60) % 12 || 12;
  return min % 60 ? `${h}:${pad(min % 60)}` : `${h}`;
};

/** "9 – 11am", "9 – 9:30am", "11am – 1pm" */
export function formatRange(startMin: number, endMin: number) {
  const sameHalf = meridiem(startMin) === meridiem(endMin);
  const start = sameHalf ? clock(startMin) : `${clock(startMin)}${meridiem(startMin)}`;
  return `${start} – ${clock(endMin)}${meridiem(endMin)}`;
}
