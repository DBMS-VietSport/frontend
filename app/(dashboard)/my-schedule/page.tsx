"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { getMyShifts, type MyShift } from "@/lib/mock/scheduleRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { WeeklyScheduleView } from "../_components/WeeklyScheduleView";
import { ScheduleListView } from "../_components/ScheduleListView";
import { LeaveRequestDialogTrigger } from "../_components/LeaveRequestDialog";

export default function MySchedulePage() {
  const { user, loading } = useAuth();
  const [shifts, setShifts] = useState<MyShift[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [viewMode, setViewMode] = useState<"week" | "list">("week");

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthLabels = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Load shifts when user or filters change
  useEffect(() => {
    if (!loading && user && user.username) {
      const myShifts = getMyShifts(user.username, selectedMonth, selectedYear);
      setShifts(myShifts);
    }
  }, [user, loading, selectedMonth, selectedYear]);

  // Filter shifts for current week (for weekly view)
  const currentWeekShifts = useMemo(() => {
    if (viewMode !== "week") return [];

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= monday && shiftDate <= sunday;
    });
  }, [shifts, viewMode]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          Vui lòng đăng nhập để xem lịch làm việc
        </div>
      </div>
    );
  }

  // Don't show for customers
  if (user.role === "customer") {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Trang này chỉ dành cho nhân viên
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Lịch làm việc của tôi</h1>
          <p className="text-muted-foreground">
            Xem ca trực theo tuần/tháng. Dữ liệu lấy từ phân ca của quản lý.
          </p>
        </div>
        <LeaveRequestDialogTrigger />
      </div>

      {/* Filter Bar */}
      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lọc theo:</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {monthLabels[month - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "week" | "list")}
      >
        <TabsList>
          <TabsTrigger value="week">Xem theo tuần</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="mt-6">
          <WeeklyScheduleView shifts={currentWeekShifts} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ScheduleListView shifts={shifts} />
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {shifts.length > 0 && (
        <Card className="rounded-xl border bg-background/50">
          <CardHeader>
            <CardTitle className="text-lg">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tổng ca trực</p>
                <p className="text-2xl font-semibold">{shifts.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                <p className="text-2xl font-semibold text-green-600">
                  {shifts.filter((s) => s.status === "Assigned").length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {shifts.filter((s) => s.status === "Pending").length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Đã hủy</p>
                <p className="text-2xl font-semibold text-red-600">
                  {shifts.filter((s) => s.status === "Cancelled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
