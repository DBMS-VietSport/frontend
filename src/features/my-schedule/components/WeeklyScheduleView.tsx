"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Clock, MapPin, User } from "lucide-react";
import type { MyShift } from "@/features/shifts/mock/scheduleRepo";

interface WeeklyScheduleViewProps {
  shifts: MyShift[];
}

const WEEKDAYS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

export function WeeklyScheduleView({ shifts }: WeeklyScheduleViewProps) {
  // Get current week dates
  const weekDates = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    const dates: { date: Date; dateStr: string; weekday: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push({
        date,
        dateStr: date.toISOString().split("T")[0],
        weekday: WEEKDAYS[i],
      });
    }
    return dates;
  }, []);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped: Record<string, MyShift[]> = {};
    shifts.forEach((shift) => {
      if (!grouped[shift.date]) {
        grouped[shift.date] = [];
      }
      grouped[shift.date].push(shift);
    });
    return grouped;
  }, [shifts]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <Card className="rounded-xl border bg-background/50">
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map(({ date, dateStr, weekday }) => {
            const dayShifts = shiftsByDate[dateStr] || [];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={dateStr}
                className={`min-h-[200px] rounded-lg border p-3 ${
                  isToday
                    ? "bg-primary/5 border-primary"
                    : "bg-background border-border"
                }`}
              >
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      {weekday}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {formatDate(date)}
                    </p>
                  </div>

                  <div className="space-y-2 mt-3">
                    {dayShifts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Không có ca
                      </p>
                    ) : (
                      dayShifts.map((shift, idx) => (
                        <div
                          key={idx}
                          className={`rounded-md p-2 text-xs space-y-1 ${
                            shift.status === "Assigned"
                              ? "bg-green-50 border border-green-200"
                              : shift.status === "Pending"
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">
                              {shift.start_time} - {shift.end_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="text-muted-foreground">
                              {shift.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-muted-foreground truncate">
                              {shift.branch}
                            </span>
                          </div>
                          <Badge
                            variant={
                              shift.status === "Assigned"
                                ? "default"
                                : shift.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs w-full justify-center"
                          >
                            {shift.status === "Assigned"
                              ? "Đã xác nhận"
                              : shift.status === "Pending"
                              ? "Chờ xác nhận"
                              : "Đã hủy"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
