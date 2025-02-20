/**
 * Formats a price number to a currency string
 */
export const formatPrice = (price: number, currency = "EUR"): string => {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency,
  }).format(price);
};

/**
 * Formats a date to a localized string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("hr-HR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Generates a slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/--+/g, "-") // Replace multiple - with single -
    .trim();
};
