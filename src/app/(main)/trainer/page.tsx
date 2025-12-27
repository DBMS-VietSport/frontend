"use client";

import * as React from "react";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CalendarClock, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/lib/useAuth";
import { trainerScheduleRepo } from "../../../features/shifts/mock/trainerScheduleRepo";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

import { MonthSwitcher } from "@/features/trainer/components/MonthSwitcher";
import { SummaryCards } from "@/features/trainer/components/SummaryCards";
import { DayScheduleList } from "@/features/trainer/components/DayScheduleList";

export default function TrainerPage() {
  const { user } = useAuth();
  const [date, setDate] = React.useState(new Date());
  const [schedule, setSchedule] = React.useState<Array<any>>([]);

  React.useEffect(() => {
    if (user?.username) {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const data = trainerScheduleRepo.getAllForMonth(
        user.username,
        month,
        year
      );
      setSchedule(data);
    }
  }, [user, date]);

  return (
    <RequireRole
      roles={["trainer"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-6 w-6" />
              <h1 className="text-2xl font-semibold">
                Lịch huấn luyện của tôi
              </h1>
            </div>
            <p className="text-muted-foreground">
              Bao gồm ca trực cố định và các buổi dạy riêng khách hàng đã đặt.
            </p>
          </div>
          <MonthSwitcher date={date} onDateChange={setDate} />
        </div>
        <SummaryCards schedule={schedule} />
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Theo ngày</TabsTrigger>
            <TabsTrigger value="weekly" disabled>
              Theo tuần (sắp có)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4">
            <DayScheduleList schedule={schedule} />
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
}
