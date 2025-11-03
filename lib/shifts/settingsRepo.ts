import { getWeekData } from "./utils";
import { listRoles } from "./index";

export interface WeeklyShift {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  requirements: Array<{
    role_id: number;
    role_name: string;
    required_count: number;
  }>;
}

export interface ShiftPreset {
  id: string;
  name: string;
  description?: string;
  created_at: string; // ISO
  // pattern by day_of_week (1..7) => array of shifts (no concrete date)
  weekPattern: Record<number, Omit<WeeklyShift, "id" | "date">[]>;
}

// In-memory stores
const presets: ShiftPreset[] = [];
const weekStore = new Map<string, WeeklyShift[]>(); // key = `${year}-${month}-${week}`

function keyOf(year: number, month: number, week: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${week}`;
}

// Seed one sample preset
(function seed() {
  if (presets.length > 0) return;
  const roles = listRoles();
  const getRole = (name: string) => roles.find((r) => r.name === name);

  const pattern: Record<number, Omit<WeeklyShift, "id" | "date">[]> = {};

  // Mon-Fri: 07:00–15:00 (Lễ tân: 3, Thu ngân: 1, Kỹ thuật: 2)
  // Mon-Fri: 14:00–22:00 (Lễ tân: 2, Kỹ thuật: 2)
  for (let dow = 1; dow <= 5; dow++) {
    pattern[dow] = [
      {
        start_time: "07:00:00",
        end_time: "15:00:00",
        requirements: [
          {
            role_id: getRole("Lễ tân")?.id ?? 2,
            role_name: "Lễ tân",
            required_count: 3,
          },
          {
            role_id: getRole("Thu ngân")?.id ?? 4,
            role_name: "Thu ngân",
            required_count: 1,
          },
          {
            role_id: getRole("Kỹ thuật")?.id ?? 3,
            role_name: "Kỹ thuật",
            required_count: 2,
          },
        ],
      },
      {
        start_time: "14:00:00",
        end_time: "22:00:00",
        requirements: [
          {
            role_id: getRole("Lễ tân")?.id ?? 2,
            role_name: "Lễ tân",
            required_count: 2,
          },
          {
            role_id: getRole("Kỹ thuật")?.id ?? 3,
            role_name: "Kỹ thuật",
            required_count: 2,
          },
        ],
      },
    ];
  }

  // Sat–Sun: 08:00–12:00 (Lễ tân: 2)
  for (let dow of [6, 7]) {
    pattern[dow] = [
      {
        start_time: "08:00:00",
        end_time: "12:00:00",
        requirements: [
          {
            role_id: getRole("Lễ tân")?.id ?? 2,
            role_name: "Lễ tân",
            required_count: 2,
          },
        ],
      },
    ];
  }

  presets.push({
    id: "preset-001",
    name: "Ca tuần chuẩn HCM",
    description: "Khung ca tiêu chuẩn cho chi nhánh HCM",
    created_at: new Date().toISOString(),
    weekPattern: pattern,
  });
})();

export function listPresets(): ShiftPreset[] {
  return [...presets];
}

export function savePreset(
  preset: Omit<ShiftPreset, "id" | "created_at">
): ShiftPreset {
  const newPreset: ShiftPreset = {
    ...preset,
    id: `preset-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
  };
  presets.unshift(newPreset);
  return newPreset;
}

export function loadPreset(id: string): ShiftPreset | undefined {
  return presets.find((p) => p.id === id);
}

export function getWeekShifts(
  year: number,
  month: number,
  week: number
): WeeklyShift[] {
  const key = keyOf(year, month, week);
  return [...(weekStore.get(key) || [])];
}

export function saveWeekShifts(
  year: number,
  month: number,
  week: number,
  shifts: WeeklyShift[]
) {
  const key = keyOf(year, month, week);
  weekStore.set(key, [...shifts]);
}

export function applyPresetToWeek(
  presetId: string,
  year: number,
  month: number,
  week: number
): WeeklyShift[] {
  const preset = loadPreset(presetId);
  if (!preset) return [];

  const weekData = getWeekData(year, month, week);
  if (!weekData) return [];

  // Map Mon..Sun with day_of_week 1..7
  // JS getDay: Sun=0..Sat=6. We'll compute dow as 1..7
  const result: WeeklyShift[] = [];
  weekData.days.forEach((dateStr) => {
    const date = new Date(dateStr);
    const jsDow = date.getDay();
    const dow = jsDow === 0 ? 7 : jsDow; // 1..7
    const patternForDay = preset.weekPattern[dow] || [];

    patternForDay.forEach((tpl) => {
      result.push({
        id: `ws-${dateStr}-${tpl.start_time}-${tpl.end_time}`,
        date: dateStr,
        start_time: tpl.start_time,
        end_time: tpl.end_time,
        requirements: tpl.requirements.map((r) => ({ ...r })),
      });
    });
  });

  saveWeekShifts(year, month, week, result);
  return result;
}
