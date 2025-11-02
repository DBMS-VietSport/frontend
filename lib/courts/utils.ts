// Utility functions for court management

import type { CourtStatus, CourtType } from "./types";

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
 * Get court image URL based on court type
 */
export function getCourtImageUrl(courtTypeName: string): string {
  const imageMap: Record<string, string> = {
    "Cầu lông":
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=300&fit=crop",
    "Bóng rổ":
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop",
    Tennis:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&h=300&fit=crop",
    "Bóng đá mini":
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=500&h=300&fit=crop",
    Futsal:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=500&h=300&fit=crop",
  };

  return (
    imageMap[courtTypeName] ||
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop"
  );
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: CourtStatus): string {
  switch (status) {
    case "Available":
      return "bg-green-500";
    case "InUse":
      return "bg-red-500";
    case "Maintenance":
      return "bg-yellow-500";
    default:
      return "bg-muted";
  }
}

/**
 * Get status display text
 */
export function getStatusText(status: CourtStatus): string {
  switch (status) {
    case "Available":
      return "Đang hoạt động";
    case "InUse":
      return "Đang sử dụng";
    case "Maintenance":
      return "Bảo trì";
    default:
      return status;
  }
}
