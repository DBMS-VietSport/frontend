"use client";

import * as React from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { trainerScheduleRepo } from "../../../lib/mock/trainerScheduleRepo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function MonthSwitcher({
  date,
  onDateChange,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
}) {
  const handlePrev = () =>
    onDateChange(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const handleNext = () =>
    onDateChange(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  const monthLabel = date.toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-40 text-center font-semibold">{monthLabel}</span>
      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SummaryCards({
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

function DayScheduleList({ schedule }: { schedule: Array<any> }) {
  if (schedule.length === 0) {
    return (
      <Card className="p-12 rounded-xl border flex items-center justify-center">
        <p className="text-muted-foreground">Không có lịch trong tháng này.</p>
      </Card>
    );
  }
  const groupedByDate = schedule.reduce(
    (acc: Record<string, any[]>, item: any) => {
      (acc[item.date] = acc[item.date] || []).push(item);
      return acc;
    },
    {}
  );
  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">
            {new Date(date).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </h3>
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className={
                  item.type === "booking"
                    ? "p-4 bg-primary/10 border-primary/40 rounded-xl border"
                    : "p-4 bg-muted rounded-xl border"
                }
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base">
                    {item.start_time} - {item.end_time}
                  </div>
                  <Badge
                    variant={item.type === "booking" ? "default" : "secondary"}
                  >
                    {item.type === "booking" ? "Đặt từ khách" : "Ca trực"}
                  </Badge>
                </div>
                <div className="text-sm mt-2 space-y-1 text-muted-foreground">
                  {item.type === "booking" ? (
                    <>
                      <p>
                        <span className="font-medium text-foreground">
                          Khách hàng:
                        </span>{" "}
                        {item.customer_name}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Dịch vụ:
                        </span>{" "}
                        {item.service_name}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Tại:
                        </span>{" "}
                        {item.court_name}, {item.branch}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>{item.branch}</p>
                      <p>{item.note}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

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
