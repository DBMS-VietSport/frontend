// Utility functions for employee management

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
 * Get role badge color
 */
export function getRoleColor(roleName: string): string {
  switch (roleName) {
    case "Quản lý":
      return "bg-purple-500";
    case "Lễ tân":
      return "bg-blue-500";
    case "Kỹ thuật":
      return "bg-orange-500";
    case "Thu ngân":
      return "bg-pink-500";
    default:
      return "bg-muted";
  }
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): "default" | "secondary" {
  return status === "Working" ? "default" : "secondary";
}

/**
 * Format time from ISO string
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
