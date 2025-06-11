export const formatCustomDate = (input: any) => {
  if (!input || typeof input !== "string") return "Invalid date";

  // Support both MM/DD/YYYY and MM-DD-YYYY
  const parts = input.includes("/") ? input.split("/") : input.split("-");

  if (parts.length !== 3) return "Invalid date";

  const [monthStr, dayStr, yearStr] = parts;
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);

  if (
    isNaN(month) ||
    isNaN(day) ||
    isNaN(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return "Invalid date";
  }

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return "Invalid date";

  // Format to "Aug 20, 2025"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
