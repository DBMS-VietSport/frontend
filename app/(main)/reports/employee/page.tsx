"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  getEmployeeCountByRole,
  getTopActiveEmployees,
  getWorkHoursByPeriod,
  type EmployeeRoleCount,
  type EmployeeWorkHourRecord,
} from "@/lib/mock/employeeReportRepo";
import { branches } from "@/lib/mock";
import { toast } from "sonner";
import { Users, Layers, Clock3, Award, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type PeriodType = "month" | "quarter" | "year";

const formatHours = (value: number) =>
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} giờ`;

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

function EmployeeReportPage() {
  const [branchId, setBranchId] = React.useState<string>("0");
  const [period, setPeriod] = React.useState<PeriodType>("month");
  const [year, setYear] = React.useState<number>(currentYear);
  const [month, setMonth] = React.useState<number>(currentMonth);
  const [quarter, setQuarter] = React.useState<number>(currentQuarter);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [roleCounts, setRoleCounts] = React.useState<EmployeeRoleCount[]>([]);
  const [workHours, setWorkHours] = React.useState<EmployeeWorkHourRecord[]>(
    []
  );
  const [topEmployees, setTopEmployees] = React.useState<
    EmployeeWorkHourRecord[]
  >([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const availableYears = React.useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    []
  );

  const branchOptions = React.useMemo(
    () => [
      { id: "0", name: "Tất cả chi nhánh" },
      ...branches.map((b) => ({ id: b.id.toString(), name: b.name })),
    ],
    []
  );

  const query = React.useMemo(() => {
    const selectedBranch = branchId === "0" ? null : parseInt(branchId, 10);
    return {
      period,
      year,
      month: period === "month" ? month : undefined,
      quarter: period === "quarter" ? quarter : undefined,
      branchId: selectedBranch,
    };
  }, [branchId, period, year, month, quarter]);

  const loadReportData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [roleData, workData, topData] = await Promise.all([
        getEmployeeCountByRole({ branchId: query.branchId }),
        getWorkHoursByPeriod(query),
        getTopActiveEmployees({ ...query, limit: 5 }),
      ]);
      setRoleCounts(roleData);
      setWorkHours(workData);
      setTopEmployees(topData);
    } catch (error) {
      console.error("Failed to load employee report:", error);
      toast.error("Không thể tải dữ liệu báo cáo nhân viên");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const filteredWorkHours = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return workHours;
    return workHours.filter((record) =>
      record.employeeName.toLowerCase().includes(term)
    );
  }, [workHours, searchTerm]);

  const totalEmployees = React.useMemo(
    () => roleCounts.reduce((sum, item) => sum + item.count, 0),
    [roleCounts]
  );
  const roleUsedCount = React.useMemo(
    () => roleCounts.filter((item) => item.count > 0).length,
    [roleCounts]
  );
  const totalHours = React.useMemo(
    () => workHours.reduce((sum, item) => sum + item.totalHours, 0),
    [workHours]
  );
  const mostActiveEmployee = topEmployees[0];

  const workHourSummary = React.useMemo(() => {
    const summary = new Map<string, { roleName: string; totalHours: number }>();
    for (const record of workHours) {
      const current = summary.get(record.roleName) || {
        roleName: record.roleName,
        totalHours: 0,
      };
      current.totalHours += record.totalHours;
      summary.set(record.roleName, current);
    }
    return Array.from(summary.values()).map((item) => ({
      ...item,
      totalHours: Math.round(item.totalHours * 10) / 10,
    }));
  }, [workHours]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-screen-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo nhân viên
          </h1>
          <p className="text-muted-foreground">
            Thống kê theo vai trò và thời gian làm việc.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">
              Chi nhánh
            </Label>
            <Select
              value={branchId}
              onValueChange={(value) => setBranchId(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">
              Kỳ báo cáo
            </Label>
            <Select
              value={period}
              onValueChange={(value: PeriodType) => setPeriod(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="quarter">Theo quý</SelectItem>
                <SelectItem value="year">Theo năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === "month" && (
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">
                Tháng
              </Label>
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {period === "quarter" && (
            <div className="space-y-1">
              <Label className="text-xs uppercase text-muted-foreground">
                Quý
              </Label>
              <Select
                value={quarter.toString()}
                onValueChange={(value) => setQuarter(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chọn quý" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((q) => (
                    <SelectItem key={q} value={q.toString()}>
                      Quý {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">
              Năm
            </Label>
            <Select
              value={year.toString()}
              onValueChange={(value) => setYear(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng số nhân viên</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Số vai trò đang dùng
              </p>
              <p className="text-2xl font-bold">{roleUsedCount}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Tổng giờ làm kỳ này
              </p>
              <p className="text-2xl font-bold">{formatHours(totalHours)}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Nhân viên hoạt động nhiều nhất
              </p>
              <p className="text-lg font-semibold">
                {mostActiveEmployee ? mostActiveEmployee.employeeName : "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {mostActiveEmployee
                  ? formatHours(mostActiveEmployee.totalHours)
                  : "Chưa có dữ liệu"}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Số lượng nhân viên theo vai trò
              </h2>
              <p className="text-sm text-muted-foreground">
                Dữ liệu tổng hợp theo chi nhánh đã chọn.
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={roleCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="roleName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Nhân viên hoạt động tích cực
              </h2>
              <p className="text-sm text-muted-foreground">
                Top nhân viên có số giờ làm cao nhất.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {topEmployees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu trong kỳ được chọn.
              </p>
            )}
            {topEmployees.map((employee, index) => (
              <div
                key={employee.employeeId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">
                    {index + 1}. {employee.employeeName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employee.roleName} • {employee.branchName}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  {formatHours(employee.totalHours)}
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Số giờ làm theo thời gian</h2>
            <p className="text-sm text-muted-foreground">
              Tổng hợp theo vai trò cho kỳ đã chọn.
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vai trò</TableHead>
              <TableHead className="text-right">Tổng giờ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workHourSummary.map((item) => (
              <TableRow key={item.roleName}>
                <TableCell>{item.roleName}</TableCell>
                <TableCell className="text-right">
                  {formatHours(item.totalHours)}
                </TableCell>
              </TableRow>
            ))}
            {workHourSummary.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground"
                >
                  Chưa có dữ liệu cho kỳ đã chọn.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6 rounded-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Chi tiết nhân viên</h2>
            <p className="text-sm text-muted-foreground">
              Danh sách nhân viên theo bộ lọc hiện tại.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-[240px]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên nhân viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead className="text-right">Số giờ làm</TableHead>
                <TableHead className="text-right">Số ca</TableHead>
                <TableHead className="text-right">Ca vắng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkHours.map((record) => (
                <TableRow key={record.employeeId}>
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>{record.roleName}</TableCell>
                  <TableCell>{record.branchName}</TableCell>
                  <TableCell className="text-right">
                    {formatHours(record.totalHours)}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.shiftCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.absenceCount}
                  </TableCell>
                </TableRow>
              ))}
              {filteredWorkHours.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Không có nhân viên nào khớp với tìm kiếm.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {isLoading && (
          <div className="pt-4 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        )}
      </Card>
    </div>
  );
}

export default function EmployeeReportPageWithRoleGuard() {
  return (
    <RequireRole
      roles={["manager", "admin"]}
      fallback={
        <div className="container mx-auto py-12 max-w-3xl">
          <Card className="p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-2">Truy cập bị hạn chế</h2>
            <p className="text-muted-foreground">
              Bạn không có quyền xem báo cáo nhân viên.
            </p>
          </Card>
        </div>
      }
    >
      <EmployeeReportPage />
    </RequireRole>
  );
}
