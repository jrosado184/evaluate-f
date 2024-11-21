export const formatISODate = (isoDate?: string): string => {
  if (!isoDate) {
    return "Invalid date"; // Return a fallback value for undefined/null input
  }

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return "Invalid date"; // Handle invalid date strings
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export default formatISODate;
