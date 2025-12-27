/**
 * Get membership badge color class
 */
export function getMembershipBadgeColor(level: string): string {
  switch (level) {
    case "Platinum":
      return "bg-purple-600";
    case "Gold":
      return "bg-yellow-600";
    case "Silver":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
}

/**
 * Get membership discount percentage
 */
export function getMembershipDiscount(level: string): number {
  switch (level) {
    case "Platinum":
      return 20;
    case "Gold":
      return 15;
    case "Silver":
      return 10;
    default:
      return 0;
  }
}
