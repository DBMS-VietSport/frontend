"use client";

import * as React from "react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  RefreshCcw,
  Download,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/utils";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Separator } from "@/ui/separator";
import { ScrollArea } from "@/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getRevenueByBranchStacked,
  getRevenueByCourtTypeTable,
  getRevenueByServiceTable,
} from "@/features/reports/mock/reportRevenue";

import { branches } from "@/mock";
import {
  getRevenueKPIs,
  getRevenueOverTime,
  getRevenueByCourtType,
  getServiceRevenueShare,
  getRevenueByBranchTable,
  getCancellationStats,
  RevenueReportFilter,
} from "@/features/reports/mock/reportRevenue";
import { formatVND } from "@/features/booking/utils/pricing";

// --- Components ---

function DateRangePicker({
  date,
  setDate,
}: {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function RevenueReportPage() {
  // -- State --
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [branchId, setBranchId] = React.useState<string>("0");
  const [revenueSource, setRevenueSource] = React.useState<
    "All" | "Court" | "Service"
  >("All");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("All");
  const [status, setStatus] = React.useState<string>("All"); // Actually only Paid makes sense for Revenue, but filter allows others to see Potential revenue

  // -- Helpers --
  const applyPreset = (type: "today" | "month" | "quarter" | "year") => {
    const now = new Date();
    switch (type) {
      case "today":
        setDateRange({ from: now, to: now });
        break;
      case "month":
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "quarter":
        setDateRange({ from: startOfQuarter(now), to: endOfQuarter(now) });
        break;
      case "year":
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
    }
  };

  const handleReset = () => {
    setDateRange({ from: subDays(new Date(), 30), to: new Date() });
    setBranchId("0");
    setRevenueSource("All");
    setPaymentMethod("All");
    setStatus("All");
  };

  // -- Data Fetching --
  const filter: RevenueReportFilter = React.useMemo(
    () => ({
      branchId: branchId === "0" ? null : parseInt(branchId),
      dateRange:
        dateRange?.from && dateRange?.to
          ? { from: dateRange.from, to: dateRange.to }
          : undefined,
      revenueSource,
      paymentMethod,
      status: status as any,
    }),
    [branchId, dateRange, revenueSource, paymentMethod, status]
  );

  const kpis = React.useMemo(() => getRevenueKPIs(filter), [filter]);
  const revenueOverTime = React.useMemo(
    () => getRevenueOverTime(filter),
    [filter]
  );
  const revenueByCourtType = React.useMemo(
    () => getRevenueByCourtType(filter),
    [filter]
  );
  const serviceShare = React.useMemo(
    () => getServiceRevenueShare(filter),
    [filter]
  );
  const branchTableData = React.useMemo(
    () => getRevenueByBranchTable(filter),
    [filter]
  );
  const courtTypeTableData = React.useMemo(
    () => getRevenueByCourtTypeTable(filter),
    [filter]
  );
  const serviceTableData = React.useMemo(
    () => getRevenueByServiceTable(filter),
    [filter]
  );
  const branchStackedData = React.useMemo(
    () => getRevenueByBranchStacked(filter),
    [filter]
  );
  const cancelStats = React.useMemo(
    () => getCancellationStats(filter),
    [filter]
  );

  const [tableGroupMode, setTableGroupMode] = React.useState<
    "branch" | "courtType" | "service"
  >("branch");

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo doanh thu
          </h1>
          <p className="text-muted-foreground">
            Theo dõi dòng tiền, nguồn thu và hiệu quả kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("today")}
          >
            Hôm nay
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("month")}
          >
            Tháng này
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("quarter")}
          >
            Quý này
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filter Bar */}
      <Card className="p-4 rounded-xl bg-muted/40 border-none shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1 lg:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Thời gian
            </label>
            <DateRangePicker date={dateRange} setDate={setDateRange} />
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
              Nguồn thu
            </label>
            <Select
              value={revenueSource}
              onValueChange={(v: any) => setRevenueSource(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Court">Tiền sân</SelectItem>
                <SelectItem value="Service">Dịch vụ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Hình thức TT
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Cash">Tiền mặt</SelectItem>
                <SelectItem value="Transfer">Chuyển khoản</SelectItem>
                <SelectItem value="Card">Thẻ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t gap-2">
          <Button variant="ghost" onClick={handleReset} size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Đặt lại
          </Button>
          <Button size="sm">Áp dụng</Button>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatVND(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sau giảm giá: {formatVND(kpis.totalDiscount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu Sân / Dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatVND(kpis.courtRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              + {formatVND(kpis.serviceRevenue)} dịch vụ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hóa đơn thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(kpis.paidPercentage)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.totalInvoices} hóa đơn phát sinh
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hoàn tiền (Refund)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatVND(kpis.totalRefund)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Do hủy sân / sự cố
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>Theo thời gian đã chọn</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Doanh thu"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ trọng dịch vụ</CardTitle>
            <CardDescription>Theo nhóm dịch vụ</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceShare.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo chi nhánh (Stacked)</CardTitle>
            <CardDescription>Phân tích Tiền sân vs Dịch vụ</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchStackedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Legend />
                <Bar
                  dataKey="courtRevenue"
                  name="Tiền sân"
                  stackId="a"
                  fill="#3b82f6"
                />
                <Bar
                  dataKey="serviceRevenue"
                  name="Dịch vụ"
                  stackId="a"
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo loại sân</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={revenueByCourtType}
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
                <Tooltip formatter={(v: number) => formatVND(v)} />
                <Bar
                  dataKey="value"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê Hủy & No-show</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-red-600 font-medium">
                  Tổng lượt hủy
                </p>
                <p className="text-3xl font-bold text-red-700">
                  {cancelStats.cancelledCount}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Trong đó {cancelStats.noShowCount} no-show
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-600 font-medium">
                  Ước tính thất thoát
                </p>
                <p className="text-3xl font-bold text-orange-700">
                  {formatVND(cancelStats.lostRevenue)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiền đã hoàn lại khách:</span>
                <span className="font-medium">
                  {formatVND(cancelStats.refundAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tỷ lệ hủy trên tổng đơn:</span>
                <span className="font-medium">
                  {Math.round(
                    (cancelStats.cancelledCount / kpis.totalInvoices) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích chi tiết</CardTitle>
          <CardDescription>
            Xem dữ liệu theo nhiều góc độ khác nhau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tableGroupMode}
            onValueChange={(v: any) => setTableGroupMode(v)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="branch">Theo Chi nhánh</TabsTrigger>
              <TabsTrigger value="courtType">Theo Loại sân</TabsTrigger>
              <TabsTrigger value="service">Theo Dịch vụ</TabsTrigger>
            </TabsList>

            <TabsContent value="branch" className="mt-4">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chi nhánh</TableHead>
                      <TableHead className="text-right">
                        Tổng doanh thu
                      </TableHead>
                      <TableHead className="text-right">Tiền sân</TableHead>
                      <TableHead className="text-right">Dịch vụ</TableHead>
                      <TableHead className="text-right">Số hóa đơn</TableHead>
                      <TableHead className="text-right">Hoàn tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchTableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatVND(row.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatVND(row.courtRev)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatVND(row.serviceRev)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.invoiceCount}
                        </TableCell>
                        <TableCell className="text-right text-red-500">
                          {formatVND(row.refundAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="courtType" className="mt-4">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại sân</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                      <TableHead className="text-right">
                        Số lượt booking
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courtTypeTableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatVND(row.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.bookingCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="service" className="mt-4">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dịch vụ</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                      <TableHead className="text-right">Số lượt bán</TableHead>
                      <TableHead>Chi nhánh top</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceTableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatVND(row.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.quantity}
                        </TableCell>
                        <TableCell>{row.topBranch || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
