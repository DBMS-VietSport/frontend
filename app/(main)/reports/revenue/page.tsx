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
import {
  getMonthlyRevenue,
  getRevenueByCourt,
  getRevenueByService,
  getInvoicesByPeriod,
  getPaidInvoices,
  RevenueFilterOptions,
} from "@/lib/mock/reportRevenue";
import {
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );

const isMonthInQuarter = (month: number, quarter: number) => {
  const start = (quarter - 1) * 3 + 1;
  const end = start + 2;
  return month >= start && month <= end;
};

export default function RevenueReportPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [quarter, setQuarter] = React.useState<number | null>(null);
  const [month, setMonth] = React.useState<number | null>(null);

  const filters = React.useMemo<RevenueFilterOptions>(
    () => ({
      month,
      quarter,
    }),
    [month, quarter]
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

  // Data
  const monthly = React.useMemo(
    () => getMonthlyRevenue(year, filters),
    [year, filters]
  );
  const byService = React.useMemo(
    () => getRevenueByService(year, filters),
    [year, filters]
  );
  const byCourt = React.useMemo(
    () => getRevenueByCourt(year, filters),
    [year, filters]
  );

  // KPIs
  const paidInvoices = React.useMemo(
    () => getPaidInvoices(year, filters),
    [year, filters]
  );
  const invoicesInPeriod = React.useMemo(
    () => getInvoicesByPeriod(year, filters),
    [year, filters]
  );
  const revenueTotal = monthly.reduce((s, p) => s + p.y, 0);
  const currentMonth = now.getMonth() + 1;
  const quarterRevenue = React.useMemo(() => {
    if (!quarter) return 0;
    return monthly
      .filter((p) => isMonthInQuarter(p.x, quarter))
      .reduce((sum, point) => sum + point.y, 0);
  }, [monthly, quarter]);
  const highlightMonth = React.useMemo(() => {
    if (month) return month;
    if (quarter) {
      const start = (quarter - 1) * 3 + 1;
      const end = start + 2;
      if (currentMonth >= start && currentMonth <= end) {
        return currentMonth;
      }
      return start;
    }
    return currentMonth;
  }, [currentMonth, month, quarter]);
  const revenueMonth = highlightMonth
    ? monthly.find((p) => p.x === highlightMonth)?.y || 0
    : 0;
  const totalInvoicesInPeriod = invoicesInPeriod.length;
  const successRate =
    totalInvoicesInPeriod > 0
      ? Math.round((paidInvoices.length / totalInvoicesInPeriod) * 100)
      : 0;

  const chartData = React.useMemo(() => {
    if (month) {
      return monthly.filter((p) => p.x === month);
    }
    if (quarter) {
      return monthly.filter((p) => isMonthInQuarter(p.x, quarter));
    }
    return monthly;
  }, [month, monthly, quarter]);

  const periodRevenueLabel = month
    ? `Doanh thu tháng ${month}`
    : quarter
    ? `Doanh thu quý ${quarter}`
    : "Doanh thu tháng hiện tại";
  const periodRevenueValue = month
    ? revenueMonth
    : quarter
    ? quarterRevenue
    : revenueMonth;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Báo cáo doanh thu</h1>
        <p className="text-muted-foreground">
          Tổng quan doanh thu theo năm, quý và tháng
        </p>
      </div>
      <Separator />

      {/* Filters */}
      <Card className="p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Tổng doanh thu theo bộ lọc
          </div>
          <div className="text-2xl font-bold">{formatVND(revenueTotal)}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            {periodRevenueLabel}
          </div>
          <div className="text-2xl font-bold">
            {formatVND(periodRevenueValue)}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Số hóa đơn đã thanh toán
          </div>
          <div className="text-2xl font-bold">{paidInvoices.length}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Tỷ lệ thanh toán thành công
          </div>
          <div className="text-2xl font-bold">{successRate}%</div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">Doanh thu theo tháng</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tickFormatter={(v) => `Th ${v}`} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(value: number) => formatVND(value)}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Bar
                dataKey="y"
                name="Doanh thu"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="text-lg font-semibold mb-2">
            Doanh thu theo dịch vụ
          </div>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byService.map((row) => (
                  <TableRow key={row.service_id}>
                    <TableCell>{row.service_name}</TableCell>
                    <TableCell className="text-right">
                      {row.total_quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatVND(row.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="text-lg font-semibold mb-2">Doanh thu theo sân</div>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sân</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCourt.map((row) => (
                  <TableRow key={row.court_id}>
                    <TableCell>{row.court_name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatVND(row.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
