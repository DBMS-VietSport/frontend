"use client";

import { Card } from "@/ui/card";
import { CalendarClock, UserRound } from "lucide-react";

export function SummaryCards({
  schedule,
}: {
  schedule: Array<{ type: string; date: string }>;
}) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const bookedThisMonth = schedule.filter((s) => s.type === "booking").length;
  const shiftsThisMonth = schedule.filter((s) => s.type === "shift").length;
  const todaySessions = schedule.filter((s) => s.date === todayStr).length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 rounded-xl border bg-background/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Buổi dạy trong tháng
          </p>
          <UserRound className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mt-2">{bookedThisMonth}</p>
      </Card>
      <Card className="p-5 rounded-xl border bg-background/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Ca trực trong tháng
          </p>
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mt-2">{shiftsThisMonth}</p>
      </Card>
      <Card className="p-5 rounded-xl border bg-background/50">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Lịch hôm nay
          </p>
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mt-2">{todaySessions}</p>
      </Card>
    </div>
  );
}
