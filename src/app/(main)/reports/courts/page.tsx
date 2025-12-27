"use client";

import * as React from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Filter,
  RefreshCcw,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { ScrollArea } from "@/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { branches, courtTypes } from "@/mock";
import {
  getReportKPIs,
  getRevenueOverTime,
  getTopCourts,
  getStatusDistribution,
  getCourtDetailsTable,
  CourtReportFilter,
} from "@/features/court/mock/reportCourts";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
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
              "w-[260px] justify-start text-left font-normal",
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

function MultiSelectBranch({
  selectedBranchIds,
  setSelectedBranchIds,
}: {
  selectedBranchIds: number[];
  setSelectedBranchIds: (ids: number[]) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const toggleBranch = (id: number) => {
    if (selectedBranchIds.includes(id)) {
      setSelectedBranchIds(selectedBranchIds.filter((i) => i !== id));
    } else {
      setSelectedBranchIds([...selectedBranchIds, id]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          {selectedBranchIds.length === 0
            ? "Tất cả chi nhánh"
            : `${selectedBranchIds.length} chi nhánh đã chọn`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Tìm chi nhánh..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy chi nhánh.</CommandEmpty>
            <CommandGroup>
              {branches.map((branch) => (
                <CommandItem
                  key={branch.id}
                  value={branch.name}
                  onSelect={() => toggleBranch(branch.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedBranchIds.includes(branch.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {branch.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Main Page ---

export default function CourtUsageReportPage() {
  // -- State --
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedBranchIds, setSelectedBranchIds] = React.useState<number[]>(
    []
  );
  const [selectedCourtTypeId, setSelectedCourtTypeId] = React.useState<
    number | null
  >(null);
  const [bookingMethod, setBookingMethod] = React.useState<
    "All" | "Online" | "Direct"
  >("All");
  const [bookingStatus, setBookingStatus] = React.useState<
    "All" | "Paid" | "Held" | "Cancelled" | "NoShow"
  >("All");

  const [selectedCourtForDetail, setSelectedCourtForDetail] = React.useState<
    any | null
  >(null);

  // -- Helpers for Presets --
  const applyPreset = (
    type: "today" | "week" | "month" | "quarter" | "year"
  ) => {
    const now = new Date();
    switch (type) {
      case "today":
        setDateRange({ from: now, to: now });
        break;
      case "week":
        setDateRange({ from: subDays(now, 7), to: now });
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
    setSelectedBranchIds([]);
    setSelectedCourtTypeId(null);
    setBookingMethod("All");
    setBookingStatus("All");
  };

  // -- Data Fetching (Mock) --
  const filter: CourtReportFilter = React.useMemo(
    () => ({
      dateRange:
        dateRange?.from && dateRange?.to
          ? { from: dateRange.from, to: dateRange.to }
          : undefined,
      branchIds: selectedBranchIds,
      courtTypeId: selectedCourtTypeId,
      bookingMethod,
      bookingStatus,
    }),
    [
      dateRange,
      selectedBranchIds,
      selectedCourtTypeId,
      bookingMethod,
      bookingStatus,
    ]
  );

  const kpis = React.useMemo(() => getReportKPIs(filter), [filter]);
  const revenueChartData = React.useMemo(
    () => getRevenueOverTime(filter),
    [filter]
  );
  const topCourtsData = React.useMemo(() => getTopCourts(filter), [filter]);
  const statusDistributionData = React.useMemo(
    () => getStatusDistribution(filter),
    [filter]
  );
  const detailsTableData = React.useMemo(
    () => getCourtDetailsTable(filter),
    [filter]
  );
  const formatPercent = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo sử dụng sân
          </h1>
          <p className="text-muted-foreground">
            Thống kê chi tiết hiệu suất hoạt động, doanh thu và tình trạng đặt
            sân
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
            onClick={() => applyPreset("week")}
          >
            7 ngày
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("month")}
          >
            Tháng này
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filter Bar */}
      <Card className="p-4 rounded-xl bg-muted/40 border-none shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Thời gian
            </label>
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Chi nhánh
            </label>
            <MultiSelectBranch
              selectedBranchIds={selectedBranchIds}
              setSelectedBranchIds={setSelectedBranchIds}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Loại sân
            </label>
            <Select
              value={
                selectedCourtTypeId ? selectedCourtTypeId.toString() : "all"
              }
              onValueChange={(v) =>
                setSelectedCourtTypeId(v === "all" ? null : parseInt(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại sân</SelectItem>
                {courtTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Hình thức đặt
            </label>
            <Select
              value={bookingMethod}
              onValueChange={(v: any) => setBookingMethod(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Direct">Tại quầy (Direct)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Trạng thái
            </label>
            <Select
              value={bookingStatus}
              onValueChange={(v: any) => setBookingStatus(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Paid">Đã thanh toán</SelectItem>
                <SelectItem value="Held">Giữ chỗ</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
                <SelectItem value="NoShow">Vắng mặt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t gap-2">
          <Button variant="ghost" onClick={handleReset} size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Đặt lại
          </Button>
          {/* Apply is automatic with state changes, but we can keep a button if needed for UX specific requirements */}
          <Button size="sm">Áp dụng</Button>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <span className="text-xs text-muted-foreground">VNĐ</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatVND(kpis.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Từ {kpis.totalBookings} lượt đặt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giờ đặt</CardTitle>
            <span className="text-xs text-muted-foreground">Giờ</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalBookedHours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tỷ lệ lấp đầy:{" "}
              <span className="font-medium text-foreground">
                {formatPercent(kpis.occupancyRate)}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online / Direct
            </CardTitle>
            <span className="text-xs text-muted-foreground">Tỷ lệ</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.onlineCount} / {kpis.directCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Online chiếm{" "}
              {kpis.totalBookings > 0
                ? Math.round((kpis.onlineCount / kpis.totalBookings) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Hủy / No-show
            </CardTitle>
            <span className="text-xs text-muted-foreground">Lượt</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {kpis.cancelledCount} / {kpis.noShowCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mất khoảng {formatVND(kpis.lostRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
            <CardDescription>
              Biểu đồ doanh thu dựa trên hóa đơn
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "dd/MM")}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `${value / 1000}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => formatVND(value)}
                  labelFormatter={(label) =>
                    format(new Date(label), "dd/MM/yyyy")
                  }
                />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sân được đặt nhiều nhất</CardTitle>
            <CardDescription>Xếp hạng theo số giờ đặt</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCourtsData}
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="hours"
                  name="Số giờ"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Trạng thái đặt sân</CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Chi tiết từng sân</CardTitle>
            <CardDescription>
              Danh sách sân và hiệu suất hoạt động
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sân</TableHead>
                    <TableHead>Chi nhánh</TableHead>
                    <TableHead className="text-right">Số lượt</TableHead>
                    <TableHead className="text-right">Giờ đặt</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                    <TableHead className="text-right">Hủy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailsTableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCourtForDetail(row)}
                    >
                      <TableCell className="font-medium">
                        {row.name} <br />{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          {row.typeName}
                        </span>
                      </TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell className="text-right">
                        {row.bookingCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.totalHours}h
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatVND(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {row.cancelled}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!selectedCourtForDetail}
        onOpenChange={(open) => !open && setSelectedCourtForDetail(null)}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedCourtForDetail?.name}</SheetTitle>
            <SheetDescription>
              Chi tiết hiệu suất hoạt động của sân{" "}
              {selectedCourtForDetail?.branchName}
            </SheetDescription>
          </SheetHeader>

          {selectedCourtForDetail && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Tổng doanh thu
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatVND(selectedCourtForDetail.revenue)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Tỷ lệ lấp đầy</p>
                  <p className="text-lg font-bold">
                    {selectedCourtForDetail.occupancy}%
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Số lượt đặt</p>
                  <p className="text-lg font-bold">
                    {selectedCourtForDetail.bookingCount}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Tổng giờ</p>
                  <p className="text-lg font-bold">
                    {selectedCourtForDetail.totalHours}h
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">
                  Lịch sử gần đây (Mock)
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">Khách hàng #{1000 + i}</p>
                        <p className="text-xs text-muted-foreground">
                          Hôm nay, {8 + i}:00 - {9 + i}:00
                        </p>
                      </div>
                      <Badge variant="outline">Đã thanh toán</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
