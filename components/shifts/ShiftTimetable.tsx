"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShiftCellData } from "@/lib/shifts/types";
import {
  getWeekdayLabel,
  formatTime,
  isShiftFullyStaffed,
  getShiftStatusColor,
} from "@/lib/shifts/utils";

interface ShiftTimetableProps {
  weekDays: string[]; // Array of 7 ISO date strings
  shiftsData: ShiftCellData[];
  onCellClick: (shift: ShiftCellData) => void;
}

export function ShiftTimetable({
  weekDays,
  shiftsData,
  onCellClick,
}: ShiftTimetableProps) {
  // Group shifts by date
  const shiftsByDate = new Map<string, ShiftCellData[]>();
  shiftsData.forEach((shift) => {
    const existing = shiftsByDate.get(shift.date) || [];
    existing.push(shift);
    shiftsByDate.set(shift.date, existing);
  });

  // Sort shifts within each day by time
  shiftsByDate.forEach((shifts) => {
    shifts.sort((a, b) => a.timeRange.localeCompare(b.timeRange));
  });

  // Get all unique time slots (for row headers)
  const timeSlots = Array.from(
    new Set(shiftsData.map((s) => s.timeRange))
  ).sort();

  return (
    <Card className="p-4">
      <ScrollArea className="w-full">
        <div className="min-w-[800px]">
          {/* Header row with days */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="font-medium text-sm text-gray-600">Thời gian</div>
            {weekDays.map((date) => (
              <div key={date} className="font-medium text-sm text-center">
                {getWeekdayLabel(date)}
              </div>
            ))}
          </div>

          {/* Time slots rows */}
          {timeSlots.length > 0 ? (
            timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 gap-2 mb-2">
                {/* Time label */}
                <div className="flex items-start justify-center pt-2">
                  <Badge variant="outline" className="text-xs">
                    {timeSlot}
                  </Badge>
                </div>

                {/* Shift cells for each day */}
                {weekDays.map((date) => {
                  const dayShifts = shiftsByDate.get(date) || [];
                  const shift = dayShifts.find((s) => s.timeRange === timeSlot);

                  return (
                    <ShiftCell
                      key={`${date}-${timeSlot}`}
                      shift={shift}
                      onClick={() => shift && onCellClick(shift)}
                    />
                  );
                })}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có ca làm việc nào trong tuần này
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

interface ShiftCellProps {
  shift?: ShiftCellData;
  onClick: () => void;
}

function ShiftCell({ shift, onClick }: ShiftCellProps) {
  if (!shift) {
    return (
      <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gray-50" />
    );
  }

  const isFull = isShiftFullyStaffed(shift.required_per_role);
  const colorClass = getShiftStatusColor(isFull, true);

  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-[100px] rounded-lg border p-3 text-left transition-all hover:shadow-md hover:scale-[1.02]",
        colorClass
      )}
    >
      <div className="space-y-2">
        {shift.required_per_role.map(
          (roleReq: {
            role_id: number;
            role_name: string;
            required: number;
            assigned: number;
          }) => (
            <div key={roleReq.role_id} className="text-xs">
              <span className="font-medium">{roleReq.role_name}:</span>{" "}
              <span
                className={cn(
                  "font-semibold",
                  roleReq.assigned >= roleReq.required
                    ? "text-green-700"
                    : "text-red-700"
                )}
              >
                {roleReq.assigned}/{roleReq.required}
              </span>
            </div>
          )
        )}

        {shift.required_per_role.length === 0 && (
          <div className="text-xs text-gray-500 italic">Chưa có yêu cầu</div>
        )}
      </div>
    </button>
  );
}
