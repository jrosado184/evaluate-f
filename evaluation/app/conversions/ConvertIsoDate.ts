/**
 * formatISODate
 * -------------
 *  • "Jun 16, 2025"   (default)
 *  • "06/16/2025"     (useSlashes === true)
 *
 * Accepts:
 *   • Date
 *   • number  – ms timestamp OR 8-digit YYYYMMDD
 *   • string  – ISO / RFC / MM-DD-YYYY / MM/DD/YYYY / 8-digit
 */
export const formatISODate = (
  input?: string | number | Date,
  useSlashes: boolean = false
): string => {
  if (!input) return "Invalid date";

  let date: Date;

  /* 1. Date instance ---------------------------------------------------- */
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "number") {
    /* 2. Number ----------------------------------------------------------- */
    date =
      input > 1e11 // timestamp
        ? new Date(input)
        : yyyymmddToDate(input.toString().padStart(8, "0"));
  } else if (typeof input === "string") {
    /* 3. String ----------------------------------------------------------- */
    const str = input.trim();

    if (/^\d{8}$/.test(str)) {
      // "20250616"
      date = yyyymmddToDate(str);
    } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
      // "05-25-2025" or "05/25/2025"  → local time
      const [mm, dd, yyyy] = str.split(/[-/]/);
      date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      // "2025-05-25" (ISO date-only)  → local time
      const [yyyy, mm, dd] = str.split("-");
      date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else {
      // Full ISO with time zone, RFC-2822, etc.
      date = new Date(str);
    }
  } else {
    /* 4. Anything else ---------------------------------------------------- */
    return "Invalid date";
  }

  if (isNaN(date.getTime())) return "Invalid date";

  const opts: Intl.DateTimeFormatOptions = useSlashes
    ? { year: "numeric", month: "2-digit", day: "2-digit" }
    : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("en-US", opts).format(date);
};

/* Helper: YYYYMMDD → Date (local TZ) */
function yyyymmddToDate(yyyymmdd: string): Date {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(yyyymmdd);
  if (!m) return new Date(NaN);
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
}

export default formatISODate;
