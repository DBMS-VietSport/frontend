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
 * Uses images from public/ folder
 */
export function getCourtImageUrl(courtTypeName: string): string {
  // Normalize the input: trim whitespace and handle empty/undefined
  const normalizedName = (courtTypeName || "").trim();

  if (!normalizedName) {
    return "/badminton-court.jpg";
  }

  const imageMap: Record<string, string> = {
    "Cầu lông": "/badminton-court.jpg",
    "Bóng rổ": "/basketball-court.jpg",
    Tennis: "/tennis-court.jpg",
    "Bóng đá mini": "/soccer-sourt.jpg",
  };

  // Direct match (exact)
  if (imageMap[normalizedName]) {
    return imageMap[normalizedName];
  }

  // Case-insensitive match
  const lowerName = normalizedName.toLowerCase();
  for (const [key, value] of Object.entries(imageMap)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  // Fallback based on partial match (more flexible)
  if (lowerName.includes("cầu lông") || lowerName.includes("badminton")) {
    return "/badminton-court.jpg";
  }
  if (lowerName.includes("bóng rổ") || lowerName.includes("basketball")) {
    return "/basketball-court.jpg";
  }
  if (lowerName.includes("tennis")) {
    return "/tennis-court.jpg";
  }
  if (lowerName.includes("bóng đá") || lowerName.includes("soccer")) {
    return "/soccer-sourt.jpg";
  }

  // Default fallback
  return "/badminton-court.jpg";
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
