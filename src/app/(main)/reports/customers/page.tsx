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
  subMonths,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  RefreshCcw,
  Search,
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
import { Input } from "@/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";

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

import { branches, customerLevels } from "@/mock";
import {
  getCustomerReportKPIs,
  getNewCustomersTrend,
  getTopCustomers,
  getLevelDistribution,
  getCustomerDetailsTable,
  CustomerReportFilter,
} from "@/features/customer/mock/reportCustomers";
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
          className="w-full justify-between"
        >
          {selectedBranchIds.length === 0
            ? "Tất cả chi nhánh"
            : `${selectedBranchIds.length} chi nhánh`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Tìm chi nhánh..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function CustomerReportPage() {
  // -- State --
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subMonths(new Date(), 12), // Default last 12 months for customer report to show trend
    to: new Date(),
  });
  const [selectedBranchIds, setSelectedBranchIds] = React.useState<number[]>(
    []
  );
  const [selectedLevelIds, setSelectedLevelIds] = React.useState<string>("all");
  const [gender, setGender] = React.useState<"All" | "Nam" | "Nữ">("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<any | null>(
    null
  );

  // -- Helpers for Presets --
  const applyPreset = (type: "month" | "quarter" | "year") => {
    const now = new Date();
    switch (type) {
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
    setDateRange({ from: subMonths(new Date(), 12), to: new Date() });
    setSelectedBranchIds([]);
    setSelectedLevelIds("all");
    setGender("All");
    setSearchTerm("");
  };

  // -- Data Fetching --
  const filter: CustomerReportFilter = React.useMemo(
    () => ({
      dateRange:
        dateRange?.from && dateRange?.to
          ? { from: dateRange.from, to: dateRange.to }
          : undefined,
      branchIds: selectedBranchIds,
      levelIds: selectedLevelIds === "all" ? [] : [parseInt(selectedLevelIds)],
      gender,
    }),
    [dateRange, selectedBranchIds, selectedLevelIds, gender]
  );

  const kpis = React.useMemo(() => getCustomerReportKPIs(filter), [filter]);
  const newCustomersData = React.useMemo(
    () => getNewCustomersTrend(filter),
    [filter]
  );
  const topCustomersData = React.useMemo(
    () => getTopCustomers(filter),
    [filter]
  );
  const levelDistributionData = React.useMemo(
    () => getLevelDistribution(filter),
    [filter]
  );

  const rawTableData = React.useMemo(
    () => getCustomerDetailsTable(filter),
    [filter]
  );

  const tableData = React.useMemo(() => {
    if (!searchTerm) return rawTableData;
    const lower = searchTerm.toLowerCase();
    return rawTableData.filter(
      (r) =>
        r.full_name.toLowerCase().includes(lower) ||
        r.email.toLowerCase().includes(lower) ||
        r.phone_number.includes(lower)
    );
  }, [rawTableData, searchTerm]);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Báo cáo khách hàng
          </h1>
          <p className="text-muted-foreground">
            Phân tích hành vi, xu hướng và giá trị trọn đời của khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("year")}
          >
            Năm nay
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filter Bar */}
      <Card className="p-4 rounded-xl bg-muted/40 border-none shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Hạng thành viên
            </label>
            <Select
              value={selectedLevelIds}
              onValueChange={setSelectedLevelIds}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả hạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hạng</SelectItem>
                {customerLevels.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Giới tính
            </label>
            <Select value={gender} onValueChange={(v: any) => setGender(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả</SelectItem>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khách hàng Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              trên tổng số {kpis.totalCustomersInFilter} khách
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khách hàng mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kpis.newCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              trong giai đoạn này
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu TB/Khách
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVND(kpis.arpc)}</div>
            <p className="text-xs text-muted-foreground mt-1">ARPC</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng điểm thưởng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              TB {Math.round(kpis.avgPoints)} điểm/khách
            </p>
          </CardContent>
        </Card>
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
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Số lượng khách mới</CardTitle>
            <CardDescription>
              Xu hướng phát triển khách hàng mới theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newCustomersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Khách mới"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top khách hàng (Doanh thu)</CardTitle>
            <CardDescription>Khách hàng chi tiêu nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCustomersData}
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
                <Tooltip formatter={(val: number) => formatVND(val)} />
                <Bar
                  dataKey="revenue"
                  name="Doanh thu"
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
            <CardTitle>Phân bổ hạng khách hàng</CardTitle>
            <CardDescription>Tỷ lệ khách theo hạng thành viên</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách khách hàng</CardTitle>
                <CardDescription>
                  Chi tiết hoạt động của từng khách
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm tên, email, sđt..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Hạng</TableHead>
                    <TableHead className="text-right">Lượt đặt</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                    <TableHead className="text-right">Điểm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCustomer(row)}
                    >
                      <TableCell className="font-medium">
                        {row.full_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.phone_number} <br />
                        <span className="text-muted-foreground text-xs">
                          {row.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.bookingCount}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatVND(row.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">{row.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedCustomer?.full_name}</SheetTitle>
            <SheetDescription>Thông tin chi tiết khách hàng</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="text-sm font-medium">
                    {selectedCustomer.phone_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p
                    className="text-sm font-medium truncate"
                    title={selectedCustomer.email}
                  >
                    {selectedCustomer.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Hạng thành viên
                  </p>
                  <Badge>{selectedCustomer.level}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedCustomer.points}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatVND(selectedCustomer.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Tổng giờ chơi</p>
                  <p className="text-lg font-bold">
                    {selectedCustomer.totalHours}h
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Đặt sân gần đây</h4>
                {selectedCustomer.lastBooking ? (
                  <div className="p-3 border rounded-md flex justify-between items-center bg-card">
                    <div>
                      <p className="text-sm font-medium">Lần cuối đặt sân</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(selectedCustomer.lastBooking),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    <Badge variant="outline">Đã hoàn thành</Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Chưa có lượt đặt sân nào.
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
