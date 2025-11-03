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
import { branches, invoices } from "@/lib/mock";
import {
  getNewCustomersByMonth,
  getTopCustomersByRevenue,
  getCustomerLevelDistribution,
} from "@/lib/mock/reportCustomers";
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

export default function CustomerReportPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const newCustomers = React.useMemo(
    () => getNewCustomersByMonth(year),
    [year]
  );
  const topCustomers = React.useMemo(
    () => getTopCustomersByRevenue(year, 10, branchId),
    [year, branchId]
  );
  const levelDist = React.useMemo(() => getCustomerLevelDistribution(), []);

  // KPIs
  const newCount = newCustomers.reduce((s, p) => s + p.y, 0);
  const totalCustomers = levelDist.reduce((s, r) => s + r.count, 0);
  const totalRevenue = invoices
    .filter(
      (i) =>
        new Date(i.created_at).getFullYear() === year && i.status === "Paid"
    )
    .reduce((s, i) => s + i.total_amount, 0);
  const activeCustomers = topCustomers.length; // customers contributing revenue this year
  const arpc =
    activeCustomers > 0 ? Math.round(totalRevenue / activeCustomers) : 0;

  const branchOptions = [
    { id: 0, name: "Tất cả chi nhánh" },
    ...branches.map((b) => ({ id: b.id, name: b.name })),
  ];

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Báo cáo khách hàng
        </h1>
        <p className="text-muted-foreground">
          Phân tích hành vi và giá trị khách hàng
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
            Số khách mới trong năm
          </div>
          <div className="text-2xl font-bold">{newCount}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Tổng số khách hiện tại
          </div>
          <div className="text-2xl font-bold">{totalCustomers}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Tổng doanh thu từ khách hàng
          </div>
          <div className="text-2xl font-bold">{formatVND(totalRevenue)}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Giá trị khách hàng trung bình (ARPC)
          </div>
          <div className="text-2xl font-bold">{formatVND(arpc)}</div>
        </Card>
      </div>

      {/* New customers chart */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">Khách mới theo tháng</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart data={newCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tickFormatter={(v) => `Th ${v}`} />
              <YAxis />
              <Tooltip labelFormatter={(label) => `Tháng ${label}`} />
              <Bar
                dataKey="y"
                name="Khách mới"
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
              />
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top customers table */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">
          Top khách hàng theo doanh thu
        </div>
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên KH</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead className="text-right">Số hóa đơn</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((r) => (
                <TableRow key={r.customer_id}>
                  <TableCell>{r.full_name}</TableCell>
                  <TableCell>{r.phone_number}</TableCell>
                  <TableCell className="text-right">
                    {r.invoice_count}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatVND(r.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Level distribution */}
      <Card className="p-4 rounded-2xl">
        <div className="text-lg font-semibold mb-2">
          Phân bổ hạng khách hàng
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {levelDist.map((lvl) => (
            <Card key={lvl.level_id} className="p-4">
              <div className="text-sm text-muted-foreground">
                {lvl.level_name}
              </div>
              <div className="text-2xl font-bold">{lvl.count}</div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
