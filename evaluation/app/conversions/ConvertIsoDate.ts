export const formatISODate = (
  input?: string | number,
  useSlashes?: boolean
): string => {
  if (!input) {
    return "Invalid date";
  }

  const date = typeof input === "number" ? new Date(input) : new Date(input);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    useSlashes
      ? {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      : {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
  ).format(date);
};

export default formatISODate;
