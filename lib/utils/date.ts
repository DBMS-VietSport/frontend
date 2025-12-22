import { format, formatDistance } from "date-fns";
import { vi } from "date-fns/locale";

// -----------------------------------------------------------------------------
// Date Formatting Utilities
// Centralized date formatting with Vietnamese locale for consistency.
// -----------------------------------------------------------------------------

/**
 * Format a date to Vietnamese date format: dd/MM/yyyy
 * @example formatDate("2024-01-15") → "15/01/2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: vi });
}

/**
 * Format a date to Vietnamese datetime format: dd/MM/yyyy HH:mm
 * @example formatDateTime("2024-01-15T10:30:00") → "15/01/2024 10:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: vi });
}

/**
 * Format a date to long Vietnamese format: dd MMMM, yyyy
 * @example formatDateLong("2024-01-15") → "15 tháng 1, 2024"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMMM, yyyy", { locale: vi });
}

/**
 * Format a date to weekday + date format: EEEE, dd/MM
 * @example formatWeekday("2024-01-15") → "Thứ Hai, 15/01"
 */
export function formatWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, dd/MM", { locale: vi });
}

/**
 * Format time only: HH:mm
 * @example formatTime("2024-01-15T10:30:00") → "10:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: vi });
}

/**
 * Format a time range: HH:mm - HH:mm
 * @example formatTimeRange(start, end) → "10:30 - 12:00"
 */
export function formatTimeRange(
  start: Date | string,
  end: Date | string
): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format relative time distance from now
 * @example formatRelative("2024-01-14T10:30:00") → "1 ngày trước"
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true, locale: vi });
}

/**
 * Format date with custom pattern (escape hatch for edge cases)
 * @example formatCustom(date, "yyyy-MM-dd") → "2024-01-15"
 */
export function formatCustom(date: Date | string, pattern: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: vi });
}
