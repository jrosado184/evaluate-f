/* --------------------------------------------- *
 * helpers.ts
 * --------------------------------------------- */

/** Parse "MM/DD/YYYY" → Date (local time)         */
export const parseMDY = (mdy: string): Date | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(mdy);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

/** Return Monday of the same week as `date`       */
export const getMondayOfWeek = (date: Date): Date => {
  const monday = new Date(date);
  const day = monday.getDay(); // Sun = 0 … Sat = 6
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(monday.getDate() + diff);
  return monday;
};

/** "Monday April 7, 2025"                         */
export const formatLongDate = (d: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);