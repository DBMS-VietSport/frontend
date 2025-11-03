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
import { branches, courtTypes } from "@/lib/mock";
import {
  getCourtUsageByMonth,
  getTopCourts,
  getLowCourts,
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

export default function CourtUsageReportPage() {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [branchId, setBranchId] = React.useState<number | null>(null);
  const [courtTypeId, setCourtTypeId] = React.useState<number | null>(null);

  const usage = React.useMemo(
    () => getCourtUsageByMonth(year, month, branchId, courtTypeId),
    [year, month, branchId, courtTypeId]
  );
  const top5 = React.useMemo(
    () => getTopCourts(year, month, 5, branchId, courtTypeId),
    [year, month, branchId, courtTypeId]
  );
  const low3 = React.useMemo(
    () => getLowCourts(year, month, 3, branchId, courtTypeId),
    [year, month, branchId, courtTypeId]
  );

  // KPIs
  const avgOccupancy = usage.length
    ? usage.reduce((s, r) => s + r.occupancy, 0) / usage.length
    : 0;
  const totalSlots = usage.reduce((s, r) => s + r.slot_count, 0);
  const mostBooked = top5[0]?.court_name || "-";
  const maintenanceCount = 0; // not tracked here; if needed, join courts status

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Báo cáo sử dụng sân
        </h1>
        <p className="text-muted-foreground">
          Phân tích mức độ sử dụng sân theo tháng
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
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Tháng {m}
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
              <SelectItem value="0">Tất cả chi nhánh</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
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
          <div className="text-sm text-muted-foreground">
            Tỷ lệ lấp đầy trung bình
          </div>
          <div className="text-2xl font-bold">
            {formatPercent(avgOccupancy)}
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
            Sân được đặt nhiều nhất
          </div>
          <div className="text-2xl font-bold">{mostBooked}</div>
        </Card>
        <Card className="p-4 rounded-2xl">
          <div className="text-sm text-muted-foreground">
            Số sân đang bảo trì
          </div>
          <div className="text-2xl font-bold">{maintenanceCount}</div>
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
    </div>
  );
}
