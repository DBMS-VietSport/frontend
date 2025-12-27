"use client";

import { Card } from "@/ui/card";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { ShiftFilters } from "@/features/shifts/types";
import { getWeeksInMonth } from "@/features/shifts/utils";

interface ShiftSettingsFilterBarProps {
  filters: ShiftFilters;
  onFiltersChange: (filters: ShiftFilters) => void;
  onOpenPresetList: () => void;
  onSavePreset: () => void;
}

export function ShiftSettingsFilterBar({
  filters,
  onFiltersChange,
  onOpenPresetList,
  onSavePreset,
}: ShiftSettingsFilterBarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const weeks = getWeeksInMonth(filters.year, filters.month);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-2">
          <Label>Năm</Label>
          <Select
            value={filters.year.toString()}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, year: parseInt(v), week: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tháng</Label>
          <Select
            value={filters.month.toString()}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, month: parseInt(v), week: 1 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tuần</Label>
          <Select
            value={filters.week.toString()}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, week: parseInt(v) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tuần" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((w) => (
                <SelectItem key={w.week} value={w.week.toString()}>
                  Tuần {w.week} ({w.startDate} → {w.endDate})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex gap-2 md:justify-end">
          <Button variant="outline" onClick={onOpenPresetList}>
            Tải preset
          </Button>
          <Button onClick={onSavePreset}>Lưu preset mới</Button>
        </div>
      </div>
    </Card>
  );
}
