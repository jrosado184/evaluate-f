export const formatISODate = (input?: string | number): string => {
  if (!input) {
    return "Invalid date"; // Handle undefined/null input
  }

  const date = typeof input === "number" ? new Date(input) : new Date(input);

  if (isNaN(date.getTime())) {
    return "Invalid date"; // Handle invalid date strings or timestamps
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export default formatISODate;
