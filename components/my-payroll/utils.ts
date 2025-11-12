/**
 * Format number as VND currency
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format month and year as "Tháng X/YYYY"
 */
export function formatMonthYear(year: number, month: number): string {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return `${monthNames[month - 1]}/${year}`;
}

/**
 * Format date string to Vietnamese format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
