"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import {
  maintenanceRepo,
  type MaintenanceStatus,
} from "@/features/court/mock/maintenanceRepo";

const statusBadge = (status: MaintenanceStatus) => {
  switch (status) {
    case "Scheduled":
      return <Badge className="bg-blue-500">Đã lên lịch</Badge>;
    case "InProgress":
      return <Badge className="bg-amber-500">Đang thực hiện</Badge>;
    case "Done":
      return <Badge className="bg-green-600">Hoàn thành</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export function MaintenanceSchedule() {
  const branches = maintenanceRepo.listBranches();
  const [branch, setBranch] = React.useState<string | undefined>(undefined);
  const now = new Date();
  const [month, setMonth] = React.useState<number>(now.getMonth() + 1);
  const [year, setYear] = React.useState<number>(now.getFullYear());

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => year - 2 + i);

  const items = maintenanceRepo.listSchedule(branch, month, year);

  return (
    <div className="space-y-4">
      <Card className="p-4 rounded-xl border bg-background/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cơ sở</Label>
            <Select
              value={branch || "all"}
              onValueChange={(v) => setBranch(v === "all" ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn cơ sở" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tháng</Label>
            <Select
              value={month.toString()}
              onValueChange={(v) => setMonth(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    Tháng {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Năm</Label>
            <Select
              value={year.toString()}
              onValueChange={(v) => setYear(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl overflow-hidden">
        <div className="p-4 text-sm text-muted-foreground">
          Lịch bảo trì được tạo bởi quản lý. Kỹ thuật chỉ được xem và cập
          nhật báo cáo sau khi bảo trì.
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày bảo trì</TableHead>
                <TableHead>Sân</TableHead>
                <TableHead>Cơ sở</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {item.plannedDate}
                  </TableCell>
                  <TableCell>{item.courtName}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.note || "-"}
                  </TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không có lịch bảo trì trong bộ lọc hiện tại
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
