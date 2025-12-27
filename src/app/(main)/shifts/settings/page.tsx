"use client";

import { useEffect, useMemo, useState } from "react";
import { ShiftSettingsFilterBar } from "@/features/shifts/components/settings/ShiftSettingsFilterBar";
import { WeeklyShiftEditor } from "@/features/shifts/components/settings/WeeklyShiftEditor";
import { ShiftPresetList } from "@/features/shifts/components/settings/ShiftPresetList";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { toast } from "sonner";
import { getCurrentWeekInfo, getWeekData } from "@/features/shifts/utils";
import { ShiftFilters } from "@/features/shifts/types";
import {
  WeeklyShift,
  getWeekShifts,
  saveWeekShifts,
  applyPresetToWeek,
  savePreset,
} from "@/features/shifts/mock/settingsRepo";

export default function ShiftSettingsPage() {
  const [filters, setFilters] = useState<ShiftFilters>(getCurrentWeekInfo());
  const [weeklyShifts, setWeeklyShifts] = useState<WeeklyShift[]>([]);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");

  useEffect(() => {
    const data = getWeekShifts(filters.year, filters.month, filters.week);
    setWeeklyShifts(data);
  }, [filters]);

  const handleApplyPreset = (presetId: string) => {
    const applied = applyPresetToWeek(
      presetId,
      filters.year,
      filters.month,
      filters.week
    );
    setWeeklyShifts(applied);
    setPresetDialogOpen(false);
    toast.success("Đã áp dụng preset cho tuần hiện tại");
  };

  const handleSaveWeek = (next: WeeklyShift[]) => {
    setWeeklyShifts(next);
    saveWeekShifts(filters.year, filters.month, filters.week, next);
  };

  const handleSavePreset = () => {
    const weekData = getWeekData(filters.year, filters.month, filters.week);
    if (!weekData) return;
    // Build pattern by day_of_week 1..7
    const pattern: Record<number, Omit<WeeklyShift, "id" | "date">[]> = {};
    for (const day of weekData.days) {
      const jsDow = new Date(day).getDay();
      const dow = jsDow === 0 ? 7 : jsDow;
      const shiftsForDay = weeklyShifts.filter((s) => s.date === day);
      pattern[dow] = shiftsForDay.map((s) => ({
        start_time: s.start_time,
        end_time: s.end_time,
        requirements: s.requirements.map((r) => ({ ...r })),
      }));
    }
    savePreset({
      name: presetName || "Preset mới",
      description: presetDesc,
      weekPattern: pattern,
    });
    setPresetName("");
    setPresetDesc("");
    setSavePresetOpen(false);
    toast.success("Đã lưu preset mới");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt ca</h1>
        <p className="text-gray-500 mt-1">
          Định nghĩa khung ca hàng tuần để sử dụng trong phân ca
        </p>
      </div>

      <ShiftSettingsFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onOpenPresetList={() => setPresetDialogOpen(true)}
        onSavePreset={() => setSavePresetOpen(true)}
      />

      <WeeklyShiftEditor
        year={filters.year}
        month={filters.month}
        week={filters.week}
        weeklyShifts={weeklyShifts}
        onChange={handleSaveWeek}
      />

      {/* Preset list dialog */}
      <ShiftPresetList
        open={presetDialogOpen}
        onOpenChange={setPresetDialogOpen}
        onApply={handleApplyPreset}
      />

      {/* Save preset dialog (inline lightweight) */}
      {savePresetOpen && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Tên preset</Label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="VD: Ca tuần chuẩn lễ tân + kỹ thuật"
              />
            </div>
            <div className="space-y-1">
              <Label>Mô tả (tuỳ chọn)</Label>
              <Input
                value={presetDesc}
                onChange={(e) => setPresetDesc(e.target.value)}
                placeholder="Mô tả ngắn"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSavePresetOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handleSavePreset}>Lưu preset</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
