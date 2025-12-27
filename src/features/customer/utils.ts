// Utility functions for customer management

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format number as VND currency
 */
export function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Get customer level badge color
 */
export function getCustomerLevelColor(levelName: string): string {
  switch (levelName) {
    case "Platinum":
      return "bg-gray-500";
    case "Gold":
      return "bg-yellow-500";
    case "Silver":
      return "bg-blue-500";
    default:
      return "bg-muted";
  }
}
