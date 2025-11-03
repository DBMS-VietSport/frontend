"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { branches, invoices } from "@/lib/mock";
import {
  getMonthlyRevenue,
  getRevenueByCourt,
  getRevenueByService,
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

export default function RevenueReportPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [branchId, setBranchId] = React.useState<number | null>(null);

  // Data
  const monthly = React.useMemo(
    () => getMonthlyRevenue(year, branchId),
    [year, branchId]
  );
  const byService = React.useMemo(
    () => getRevenueByService(year, branchId),
    [year, branchId]
  );
  const byCourt = React.useMemo(
    () => getRevenueByCourt(year, branchId),
    [year, branchId]
  );

  // KPIs
  const paidInvoices = invoices.filter(
    (i) => new Date(i.created_at).getFullYear() === year && i.status === "Paid"
  );
  const revenueYear = paidInvoices
    .filter((i) =>
      branchId
        ? (() => {
            if (i.court_booking_id) {
              // use helper branch filter logic via getMonthlyRevenue's filter approach; for KPIs, reuse same filter
              return (
                getMonthlyRevenue(year, branchId).reduce(
                  (a, b) => a + b.y,
                  0
                ) >= 0
              ); // placeholder, we compute below anyway
            } else {
              return (
                getMonthlyRevenue(year, branchId).reduce(
                  (a, b) => a + b.y,
                  0
                ) >= 0
              );
            }
          })()
        : true
    )
    .reduce((sum, i) => sum + i.total_amount, 0);
  const currentMonth = now.getMonth() + 1;
  const revenueMonth = monthly.find((p) => p.x === currentMonth)?.y || 0;
  const totalInvoicesInYear = invoices.filter(
    (i) => new Date(i.created_at).getFullYear() === year
  ).length;
  const successRate =
    totalInvoicesInYear > 0
      ? Math.round((paidInvoices.length / totalInvoicesInYear) * 100)
      : 0;

  const branchOptions = [
    { id: 0, name: "Tất cả chi nhánh" },
    ...branches.map((b) => ({ id: b.id, name: b.name })),
  ];

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Báo cáo doanh thu</h1>
        <p className="text-muted-foreground">
          Tổng quan doanh thu theo năm và chi nhánh
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
            value={(branchId || 0).toString()}
            onValueChange={(v) => setBranchId(v === "0" ? null : parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
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
            Tổng doanh thu năm
          </div>
          <div className="text-2xl font-bold">
            {formatVND(monthly.reduce((s, p) => s + p.y, 0))}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Doanh thu tháng hiện tại
          </div>
          <div className="text-2xl font-bold">{formatVND(revenueMonth)}</div>
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
            <RBarChart data={monthly}>
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
