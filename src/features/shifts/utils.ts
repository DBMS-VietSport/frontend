import { WeekData } from "./types";

/**
 * Get the weekday name in Vietnamese
 */
export function getVietnameseWeekday(date: Date): string {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return days[date.getDay()];
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDateVN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format time as HH:MM from HH:MM:SS
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Get ISO date string (YYYY-MM-DD) from Date object
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get all weeks in a given month
 */
export function getWeeksInMonth(year: number, month: number): WeekData[] {
  const weeks: WeekData[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Start from the Monday of the week containing the first day
  let currentDate = new Date(firstDay);
  const dayOfWeek = currentDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Move to Monday
  currentDate.setDate(currentDate.getDate() + diff);

  let weekNumber = 1;

  while (currentDate <= lastDay || currentDate.getMonth() === month - 1) {
    const weekStart = new Date(currentDate);
    const days: string[] = [];

    // Generate 7 days (Mon-Sun)
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(toISODate(date));
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    weeks.push({
      year,
      month,
      week: weekNumber,
      startDate: toISODate(weekStart),
      endDate: toISODate(weekEnd),
      days,
    });

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;

    // Stop after 5 weeks or when we're well past the month
    if (weekNumber > 5 || currentDate.getMonth() > month) {
      break;
    }
  }

  return weeks;
}

/**
 * Get specific week data
 */
export function getWeekData(
  year: number,
  month: number,
  week: number
): WeekData | null {
  const weeks = getWeeksInMonth(year, month);
  return weeks.find((w) => w.week === week) || null;
}

/**
 * Get current year, month, and week
 */
export function getCurrentWeekInfo(): {
  year: number;
  month: number;
  week: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Find which week of the month contains today
  const weeks = getWeeksInMonth(year, month);
  const today = toISODate(now);

  for (const week of weeks) {
    if (week.days.includes(today)) {
      return { year, month, week: week.week };
    }
  }

  // Default to week 1 if not found
  return { year, month, week: 1 };
}

/**
 * Generate weekday label with date
 */
export function getWeekdayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const weekday = getVietnameseWeekday(date);
  const formatted = formatDateVN(date);
  return `${weekday} - ${formatted}`;
}

/**
 * Check if all role requirements are met
 */
export function isShiftFullyStaffed(
  roleRequirements: Array<{ required: number; assigned: number }>
): boolean {
  return roleRequirements.every((r) => r.assigned >= r.required);
}

/**
 * Get shift status color classes
 */
export function getShiftStatusColor(
  isFull: boolean,
  hasShift: boolean
): string {
  if (!hasShift) return "bg-gray-50 border-gray-200";
  if (isFull) return "bg-green-50 border-green-200";
  return "bg-red-50 border-red-200";
}
