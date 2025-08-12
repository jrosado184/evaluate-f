export const dateValidation = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;

  // Must match MM/DD/YYYY
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!regex.test(value)) return false;

  const [month, day, year] = value.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  // Check exact match to avoid invalid days like 02/30/2025
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
