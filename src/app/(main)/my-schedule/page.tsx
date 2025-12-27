"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/features/auth/lib/useAuth";
import { getMyShifts, type MyShift } from "@/features/shifts/mock/scheduleRepo";
import {
  leaveRequestRepo,
  type LeaveRequest,
} from "@/features/employee/mock/leaveRequestRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Calendar, Clock, FileText } from "lucide-react";
import {
  WeeklyScheduleView,
  ScheduleListView,
  LeaveRequestDialogTrigger,
} from "@/features/my-schedule/components";

export default function MySchedulePage() {
  const { user, loading } = useAuth();
  const [shifts, setShifts] = useState<MyShift[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedWeek, setSelectedWeek] = useState<Date>(
    (() => {
      const now = new Date();
      const currentDay = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      monday.setHours(0, 0, 0, 0);
      return monday;
    })()
  );
  const [viewMode, setViewMode] = useState<"week" | "list" | "leave">("week");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

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

  // Determine month/year to load based on view mode
  const loadMonth = useMemo(() => {
    if (viewMode === "week") {
      return selectedWeek.getMonth() + 1;
    }
    return selectedMonth;
  }, [viewMode, selectedWeek, selectedMonth]);

  const loadYear = useMemo(() => {
    if (viewMode === "week") {
      return selectedWeek.getFullYear();
    }
    return selectedYear;
  }, [viewMode, selectedWeek, selectedYear]);

  // Load all shifts for the selected month/year
  useEffect(() => {
    if (!loading && user && user.username) {
      const myShifts = getMyShifts(user.username, loadMonth, loadYear);
      setShifts(myShifts);
    }
  }, [user, loading, loadMonth, loadYear]);

  // Load leave requests when user changes
  useEffect(() => {
    if (!loading && user && user.username) {
      const requests = leaveRequestRepo.listByUser(user.username);
      setLeaveRequests(requests);
    }
  }, [user, loading]);

  // Handle leave request success
  const handleLeaveRequestSuccess = () => {
    if (user && user.username) {
      const requests = leaveRequestRepo.listByUser(user.username);
      setLeaveRequests(requests);
    }
  };

  // Filter shifts for selected week (for weekly view)
  const currentWeekShifts = useMemo(() => {
    if (viewMode !== "week") return [];

    const monday = new Date(selectedWeek);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= monday && shiftDate <= sunday;
    });
  }, [shifts, viewMode, selectedWeek]);

  // Filter shifts for selected month/year (for list view)
  const filteredShifts = useMemo(() => {
    if (viewMode !== "list") return shifts;
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() + 1 === selectedMonth &&
        shiftDate.getFullYear() === selectedYear
      );
    });
  }, [shifts, viewMode, selectedMonth, selectedYear]);

  // Generate week options (current week ± 4 weeks)
  const generateWeekOptions = () => {
    const weeks: Array<{ value: string; label: string; date: Date }> = [];
    const now = new Date();
    const currentDay = now.getDay();
    const currentMonday = new Date(now);
    currentMonday.setDate(
      now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );
    currentMonday.setHours(0, 0, 0, 0);

    for (let i = -4; i <= 4; i++) {
      const weekDate = new Date(currentMonday);
      weekDate.setDate(currentMonday.getDate() + i * 7);
      const sunday = new Date(weekDate);
      sunday.setDate(weekDate.getDate() + 6);

      const formatWeekLabel = (monday: Date, sunday: Date) => {
        const formatDate = (date: Date) => {
          return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
        };
        return `${formatDate(monday)} - ${formatDate(
          sunday
        )}, ${monday.getFullYear()}`;
      };

      weeks.push({
        value: weekDate.toISOString(),
        label: formatWeekLabel(weekDate, sunday),
        date: weekDate,
      });
    }
    return weeks;
  };

  const weekOptions = useMemo(() => generateWeekOptions(), []);

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
        <LeaveRequestDialogTrigger onSuccess={handleLeaveRequestSuccess} />
      </div>

      {/* View Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "week" | "list" | "leave")}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="week">Xem theo tuần</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="leave">Đơn nghỉ phép</TabsTrigger>
          </TabsList>

          {/* Filter for week and list views */}
          {viewMode !== "leave" && (
            <div className="flex gap-3 flex-wrap items-center">
              {viewMode === "week" && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={selectedWeek.toISOString()}
                    onValueChange={(value) => {
                      setSelectedWeek(new Date(value));
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOptions.map((week) => (
                        <SelectItem key={week.value} value={week.value}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === "list" && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) =>
                        setSelectedMonth(parseInt(value))
                      }
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
                  </div>

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
                </>
              )}
            </div>
          )}
        </div>

        <TabsContent value="week" className="mt-6">
          <WeeklyScheduleView shifts={currentWeekShifts} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <ScheduleListView shifts={filteredShifts} />
        </TabsContent>

        <TabsContent value="leave" className="mt-6">
          <LeaveRequestsList requests={leaveRequests} />
        </TabsContent>
      </Tabs>

      {/* Summary Stats - Only show for week and list views */}
      {viewMode !== "leave" && shifts.length > 0 && (
        <Card className="rounded-xl border bg-background/50">
          <CardHeader>
            <CardTitle className="text-lg">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tổng ca trực</p>
                <p className="text-2xl font-semibold">
                  {viewMode === "week"
                    ? currentWeekShifts.length
                    : filteredShifts.length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                <p className="text-2xl font-semibold text-green-600">
                  {
                    (viewMode === "week"
                      ? currentWeekShifts
                      : filteredShifts
                    ).filter((s) => s.status === "Assigned").length
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                <p className="text-2xl font-semibold text-amber-600">
                  {
                    (viewMode === "week"
                      ? currentWeekShifts
                      : filteredShifts
                    ).filter((s) => s.status === "Pending").length
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Đã hủy</p>
                <p className="text-2xl font-semibold text-red-600">
                  {
                    (viewMode === "week"
                      ? currentWeekShifts
                      : filteredShifts
                    ).filter((s) => s.status === "Cancelled").length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Leave Requests List Component
function LeaveRequestsList({ requests }: { requests: LeaveRequest[] }) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: LeaveRequest["approval_status"]) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary" className="bg-amber-500">
            Chờ duyệt
          </Badge>
        );
      case "Approved":
        return (
          <Badge variant="default" className="bg-green-600">
            Đã duyệt
          </Badge>
        );
      case "Rejected":
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Group requests by status
  const pendingRequests = requests.filter(
    (r) => r.approval_status === "Pending"
  );
  const approvedRequests = requests.filter(
    (r) => r.approval_status === "Approved"
  );
  const rejectedRequests = requests.filter(
    (r) => r.approval_status === "Rejected"
  );

  if (requests.length === 0) {
    return (
      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">
                Chưa có đơn nghỉ phép nào
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Nhấn nút &quot;Xin nghỉ phép&quot; ở trên để tạo đơn nghỉ phép
                mới
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card className="rounded-xl border bg-background/50">
        <CardHeader>
          <CardTitle className="text-lg">Tổng quan đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tổng đơn</p>
              <p className="text-2xl font-semibold">{requests.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-2xl font-semibold text-amber-600">
                {pendingRequests.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl font-semibold text-green-600">
                {approvedRequests.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Từ chối</p>
              <p className="text-2xl font-semibold text-red-600">
                {rejectedRequests.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Requests List */}
      <Card className="rounded-xl border bg-background/50">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatDate(request.start_date)} -{" "}
                        {formatDate(request.end_date)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({calculateDays(request.start_date, request.end_date)}{" "}
                        ngày)
                      </span>
                      {getStatusBadge(request.approval_status)}
                    </div>
                    {request.reason && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                  <Clock className="w-3 h-3" />
                  <span>Gửi vào: {formatDate(request.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
