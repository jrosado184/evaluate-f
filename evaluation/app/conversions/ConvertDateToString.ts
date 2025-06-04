export const formatCustomDate = (input) => {
  if (!input) return "Invalid date";

  // Split the input string into components
  const parts = input.split("-");
  if (parts.length !== 3) return "Invalid date";

  const [monthStr, dayStr, yearStr] = parts;
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);

  // Validate the components
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

  // Create a Date object (Note: months are 0-based in JavaScript)
  const date = new Date(year, month - 1, day);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Format the date to "Month Day, Year"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
