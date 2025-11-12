"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { courtTypes, courts } from "@/lib/mock";
import {
  getCourtUsageByPeriod,
  getTopCourts,
  getLowCourts,
  getBookingTypeStats,
  getCancellationStats,
  getMostUsedServices,
  CourtFilterOptions,
} from "@/lib/mock/reportCourts";
import {
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatPercent = (n: number) => `${Math.round(n * 100)}%`;
const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

const isMonthInQuarter = (month: number, quarter: number) => {
  const start = (quarter - 1) * 3 + 1;
  const end = start + 2;
  return month >= start && month <= end;
};

export default function CourtUsageReportPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [quarter, setQuarter] = React.useState<number | null>(null);
  const [month, setMonth] = React.useState<number | null>(null);
  const [courtTypeId, setCourtTypeId] = React.useState<number | null>(null);

  const filters = React.useMemo<CourtFilterOptions>(
    () => ({
      month,
      quarter,
      courtTypeId,
    }),
    [month, quarter, courtTypeId]
  );

  const handleQuarterChange = React.useCallback(
    (value: string) => {
      const nextQuarter = value === "0" ? null : parseInt(value, 10);
      setQuarter(nextQuarter);
      if (nextQuarter && month && !isMonthInQuarter(month, nextQuarter)) {
        setMonth(null);
      }
    },
    [month]
  );

  const handleMonthChange = React.useCallback((value: string) => {
    const nextMonth = value === "0" ? null : parseInt(value, 10);
    setMonth(nextMonth);
    if (nextMonth) {
      setQuarter(Math.ceil(nextMonth / 3));
    }
  }, []);

  const usage = React.useMemo(
    () => getCourtUsageByPeriod(year, filters),
    [year, filters]
  );
  const top5 = React.useMemo(
    () => getTopCourts(year, filters, 5),
    [year, filters]
  );
  const low3 = React.useMemo(
    () => getLowCourts(year, filters, 3),
    [year, filters]
  );
  const bookingTypeStats = React.useMemo(
    () => getBookingTypeStats(year, filters),
    [year, filters]
  );
  const cancellationStats = React.useMemo(
    () => getCancellationStats(year, filters),
    [year, filters]
  );
  const mostUsedServices = React.useMemo(
    () => getMostUsedServices(year, filters, 5),
    [year, filters]
  );

  // KPIs
  const totalBookedMinutes = usage.reduce((s, r) => s + r.booked_minutes, 0);
  const totalCapacityMinutes = usage.reduce(
    (s, r) => s + r.capacity_minutes,
    0
  );
  const overallUsageRate =
    totalCapacityMinutes > 0 ? totalBookedMinutes / totalCapacityMinutes : 0;
  const avgOccupancy = usage.length
    ? usage.reduce((s, r) => s + r.occupancy, 0) / usage.length
    : 0;
  const totalSlots = usage.reduce((s, r) => s + r.slot_count, 0);
  const mostBooked = top5[0]?.court_name || "-";
  const maintenanceCount = usage.filter(
    (r) => courts.find((c) => c.id === r.court_id)?.status === "Maintenance"
  ).length;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Báo cáo sử dụng sân
        </h1>
        <p className="text-muted-foreground">
          Phân tích mức độ sử dụng sân theo năm, quý và tháng
        </p>
      </div>
      <Separator />

      {/* Filters */}
      <Card className="p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: 6 },
                (_, i) => new Date().getFullYear() - i
              ).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(quarter || 0).toString()}
            onValueChange={handleQuarterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quý" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả quý</SelectItem>
              {[1, 2, 3, 4].map((q) => (
                <SelectItem key={q} value={q.toString()}>
                  Quý {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(month || 0).toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả tháng</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem
                  key={m}
                  value={m.toString()}
                  disabled={quarter ? !isMonthInQuarter(m, quarter) : false}
                >
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(courtTypeId || 0).toString()}
            onValueChange={(v) =>
              setCourtTypeId(v === "0" ? null : parseInt(v))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại sân" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả loại sân</SelectItem>
              {courtTypes.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">Tỷ lệ sử dụng sân</div>
          <div className="text-2xl font-bold">
            {formatPercent(overallUsageRate)}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Tổng số lượt đặt sân
          </div>
          <div className="text-2xl font-bold">{totalSlots}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Đặt online / Đặt trực tiếp
          </div>
          <div className="text-2xl font-bold">
            {bookingTypeStats.online} / {bookingTypeStats.direct}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Số sân đang bảo trì
          </div>
          <div className="text-2xl font-bold">{maintenanceCount}</div>
        </Card>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">Số lượt hủy sân</div>
          <div className="text-2xl font-bold">
            {cancellationStats.cancelledCount}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">Số lượt no-show</div>
          <div className="text-2xl font-bold">
            {cancellationStats.noShowCount}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Số tiền bị mất do hủy
          </div>
          <div className="text-2xl font-bold">
            {formatVND(cancellationStats.lostRevenue)}
          </div>
        </Card>
      </div>

      {/* Chart Top 5 */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">
          Lượt đặt theo sân (Top 5)
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart
              data={top5.map((r) => ({
                name: r.court_name,
                slots: r.slot_count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="slots"
                name="Lượt đặt"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table Details */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">Chi tiết sử dụng sân</div>
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sân</TableHead>
                <TableHead>Loại sân</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead className="text-right">Số lượt đặt</TableHead>
                <TableHead className="text-right">Tỷ lệ lấp đầy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.map((r) => (
                <TableRow key={r.court_id}>
                  <TableCell>{r.court_name}</TableCell>
                  <TableCell>{r.court_type_name}</TableCell>
                  <TableCell>{r.branch_name}</TableCell>
                  <TableCell className="text-right">{r.slot_count}</TableCell>
                  <TableCell className="text-right">
                    {formatPercent(r.occupancy)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Low usage section */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">Sân ít được đặt</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {low3.map((r) => (
            <Card key={r.court_id} className="p-4">
              <div className="font-semibold">{r.court_name}</div>
              <div className="text-sm text-muted-foreground">
                {r.branch_name} • {r.court_type_name}
              </div>
              <div className="mt-1 text-sm">
                Lượt đặt: <span className="font-medium">{r.slot_count}</span>
              </div>
              <div className="text-sm">
                Lấp đầy:{" "}
                <span className="font-medium">
                  {formatPercent(r.occupancy)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Most used services */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">
          Dịch vụ kèm theo được sử dụng nhiều nhất
        </div>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead className="text-right">Số lần sử dụng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mostUsedServices.length > 0 ? (
                mostUsedServices.map((service) => (
                  <TableRow key={service.service_id}>
                    <TableCell>{service.service_name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {service.usage_count}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
