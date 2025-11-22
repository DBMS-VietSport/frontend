"use client";

import * as React from "react";
import { format } from "date-fns";
import { RefreshCcw, Search, ArrowUpDown, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { branches, roles } from "@/lib/mock";
import {
  getEmployeeReportKPIs,
  getTopEmployeesByHours,
  getDailyWorkHours,
  getEmployeeDetailsTable,
  EmployeeReportFilter,
} from "@/lib/mock/employeeReportRepo";

// --- Components ---

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function EmployeeReportPage() {
  // -- State --
  const [month, setMonth] = React.useState<number>(currentMonth);
  const [year, setYear] = React.useState<number>(currentYear);
  const [branchId, setBranchId] = React.useState<string>("0");
  const [roleId, setRoleId] = React.useState<string>("0");
  const [status, setStatus] = React.useState<
    "All" | "Working" | "Inactive" | "OnLeave"
  >("All");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Sort state
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleReset = () => {
    setMonth(currentMonth);
    setYear(currentYear);
    setBranchId("0");
    setRoleId("0");
    setStatus("All");
    setSearchTerm("");
    setSortConfig(null);
  };

  // -- Data Fetching --
  const filter: EmployeeReportFilter = React.useMemo(
    () => ({
      branchId: branchId === "0" ? null : parseInt(branchId),
      roleId: roleId === "0" ? null : parseInt(roleId),
      month,
      year,
      status,
    }),
    [branchId, roleId, month, year, status]
  );

  const kpis = React.useMemo(() => getEmployeeReportKPIs(filter), [filter]);
  const topEmployeesData = React.useMemo(
    () => getTopEmployeesByHours(filter),
    [filter]
  );
  const dailyHoursData = React.useMemo(
    () => getDailyWorkHours(filter),
    [filter]
  );
  const rawTableData = React.useMemo(
    () => getEmployeeDetailsTable(filter),
    [filter]
  );

  const tableData = React.useMemo(() => {
    let data = [...rawTableData];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((r) => r.full_name.toLowerCase().includes(lower));
    }

    if (sortConfig) {
      data.sort((a, b) => {
        // @ts-ignore
        const aValue = a[sortConfig.key];
        // @ts-ignore
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [rawTableData, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" }; // Default desc for numbers usually
    });
  };

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo nhân viên
          </h1>
          <p className="text-muted-foreground">
            Quản lý hiệu suất, lương thưởng và lịch làm việc
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      <Separator />

      {/* Filter Bar */}
      <Card className="p-4 rounded-xl bg-muted/40 border-none shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Tháng / Năm
            </label>
            <div className="flex gap-2">
              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(parseInt(v))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Chi nhánh
            </label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả chi nhánh</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Chức vụ
            </label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả chức vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả chức vụ</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Trạng thái
            </label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Working">Đang làm việc</SelectItem>
                <SelectItem value="OnLeave">Đang nghỉ phép</SelectItem>
                <SelectItem value="Inactive">Đã nghỉ việc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={handleReset}
              size="sm"
              className="w-full"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Đặt lại
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalEmployees}</div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
              {kpis.roleDistribution.map((rd) => (
                <Badge
                  key={rd.name}
                  variant="secondary"
                  className="text-[10px] px-1 py-0"
                >
                  {rd.name}: {rd.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hiệu suất làm việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              từ {kpis.totalShifts} ca làm việc
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ngày nghỉ đã duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {kpis.totalLeaveDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ngày công</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quỹ lương thực trả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatVND(kpis.totalNetPay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              tháng {month}/{year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top nhân viên chăm chỉ</CardTitle>
            <CardDescription>Xếp hạng theo số giờ làm việc</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topEmployeesData}
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="hours"
                  name="Số giờ"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biến động giờ làm</CardTitle>
            <CardDescription>
              Tổng giờ làm theo ngày trong tháng
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={2} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="Giờ làm"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chi tiết nhân viên</CardTitle>
              <CardDescription>
                Bảng lương và hiệu suất chi tiết
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên nhân viên..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Chi nhánh / Vai trò</TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("shiftsCount")}
                  >
                    <div className="flex items-center justify-end">
                      Ca làm <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("hours")}
                  >
                    <div className="flex items-center justify-end">
                      Giờ làm <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-red-500">
                    Vắng/Nghỉ
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("gross_pay")}
                  >
                    <div className="flex items-center justify-end">
                      Lương Gross <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("commission")}
                  >
                    <div className="flex items-center justify-end">
                      Hoa hồng <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("net_pay")}
                  >
                    <div className="flex items-center justify-end">
                      Thực nhận <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.full_name}</div>
                      <Badge
                        variant={
                          row.status === "Active" ? "default" : "secondary"
                        }
                        className="mt-1 text-[10px]"
                      >
                        {row.status === "Active" ? "Working" : row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.branch_name} <br />
                      <span className="text-muted-foreground text-xs">
                        {row.role_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.shiftsCount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Math.round(row.hours)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.absences} / {row.leaves}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatVND(row.gross_pay)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {row.commission > 0 ? formatVND(row.commission) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatVND(row.net_pay)}
                    </TableCell>
                  </TableRow>
                ))}
                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy dữ liệu phù hợp
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
