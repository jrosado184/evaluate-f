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
  }

  /* 2. Number ----------------------------------------------------------- */
  else if (typeof input === "number") {
    date =
      input > 1e11                                   // timestamp
        ? new Date(input)
        : yyyymmddToDate(input.toString().padStart(8, "0"));
  }

  /* 3. String ----------------------------------------------------------- */
  else if (typeof input === "string") {
    const str = input.trim();

    if (/^\d{8}$/.test(str)) {
      // "20250616"
      date = yyyymmddToDate(str);
    } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
      // "09-17-2024" or "09/17/2024"
      const [mm, dd, yyyy] = str.split(/[-/]/);
      date = new Date(`${yyyy}-${mm}-${dd}`);        // ISO string
    } else {
      // ISO, RFC-2822, etc.
      date = new Date(str);
    }
  }

  /* 4. Anything else ---------------------------------------------------- */
  else {
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