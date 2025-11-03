"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getWeekData, getWeekdayLabel } from "@/lib/shifts/utils";
import { WeeklyShift } from "@/lib/shifts/settingsRepo";
import {
  ShiftRoleRequirementForm,
  RoleReqDraft,
} from "./ShiftRoleRequirementForm";
import { toast } from "sonner";

interface WeeklyShiftEditorProps {
  year: number;
  month: number;
  week: number;
  weeklyShifts: WeeklyShift[];
  onChange: (next: WeeklyShift[]) => void;
}

export function WeeklyShiftEditor({
  year,
  month,
  week,
  weeklyShifts,
  onChange,
}: WeeklyShiftEditorProps) {
  const weekData = getWeekData(year, month, week);
  const [addingForDate, setAddingForDate] = useState<string | null>(null);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, WeeklyShift[]>();
    for (const s of weeklyShifts) {
      const arr = map.get(s.date) || [];
      arr.push(s);
      map.set(s.date, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) =>
        `${a.start_time}-${a.end_time}`.localeCompare(
          `${b.start_time}-${b.end_time}`
        )
      );
      map.set(k, arr);
    }
    return map;
  }, [weeklyShifts]);

  if (!weekData) return null;

  const addShift = (
    date: string,
    draft: {
      start_time: string;
      end_time: string;
      requirements: RoleReqDraft[];
    }
  ) => {
    const newShift: WeeklyShift = {
      id: `ws-${date}-${draft.start_time}-${draft.end_time}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      date,
      start_time: draft.start_time,
      end_time: draft.end_time,
      requirements: draft.requirements,
    };
    onChange([...weeklyShifts, newShift]);
    toast.success("Đã thêm ca");
  };

  const deleteShift = (id: string) => {
    onChange(weeklyShifts.filter((s) => s.id !== id));
    toast.success("Đã xóa ca");
  };

  const copyDayToAll = (date: string) => {
    const base = shiftsByDate.get(date) || [];
    const others = weekData.days.filter((d) => d !== date);
    const clones: WeeklyShift[] = [];
    for (const d of others) {
      for (const s of base) {
        clones.push({
          id: `ws-${d}-${s.start_time}-${s.end_time}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          date: d,
          start_time: s.start_time,
          end_time: s.end_time,
          requirements: s.requirements.map((r) => ({ ...r })),
        });
      }
    }
    // remove existing of other days then add clones
    const keep = weeklyShifts.filter((s) => s.date === date);
    onChange([...keep, ...clones]);
    toast.success("Đã áp dụng cho toàn bộ ngày trong tuần");
  };

  return (
    <Card className="p-4 space-y-4">
      <Accordion type="multiple" className="w-full">
        {weekData.days.map((date) => (
          <AccordionItem key={date} value={date}>
            <AccordionTrigger>
              <div className="text-left">
                <div className="font-medium">{getWeekdayLabel(date)}</div>
                <div className="text-xs text-gray-500">
                  {(shiftsByDate.get(date) || []).length} ca
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {(shiftsByDate.get(date) || []).map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border p-3 flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {s.start_time.substring(0, 5)} –{" "}
                        {s.end_time.substring(0, 5)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {s.requirements.map((r, idx) => (
                          <Badge key={idx} variant="secondary">
                            {r.role_name}: {r.required_count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* For brevity, only delete here; editing could reuse form in a more complex UI */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteShift(s.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}

                {addingForDate === date ? (
                  <ShiftRoleRequirementForm
                    onCancel={() => setAddingForDate(null)}
                    onSave={(draft) => {
                      addShift(date, draft);
                      setAddingForDate(null);
                    }}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAddingForDate(date)}
                    >
                      Thêm ca
                    </Button>
                    <Button onClick={() => copyDayToAll(date)}>
                      Áp dụng cho toàn bộ ngày trong tuần
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
