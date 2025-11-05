"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getMyPayroll, type PayrollRecord } from "@/lib/mock/payrollRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Calendar, Receipt } from "lucide-react";
import { PayrollDetailDialog } from "./_components/PayrollDetailDialog";

function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatMonthYear(year: number, month: number): string {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return `${monthNames[month - 1]}/${year}`;
}

export default function MyPayrollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(
    null
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user && user.username) {
      const myPayroll = getMyPayroll(user.username);
      setPayroll(myPayroll);
    }
  }, [user, loading, router]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (payroll.length === 0) {
      return {
        latestNetPay: 0,
        totalYearPay: 0,
        paidCount: 0,
      };
    }

    const currentYear = new Date().getFullYear();
    const currentYearPayroll = payroll.filter((p) => p.year === currentYear);
    const paidRecords = payroll.filter((p) => p.payment_status === "Paid");

    return {
      latestNetPay: payroll[0]?.net_pay || 0,
      totalYearPay: currentYearPayroll.reduce(
        (sum, p) => sum + (p.payment_status === "Paid" ? p.net_pay : 0),
        0
      ),
      paidCount: paidRecords.length,
    };
  }, [payroll]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Bảng lương của tôi</h1>
        <p className="text-muted-foreground">
          Xem chi tiết lương, phụ cấp, hoa hồng và khấu trừ theo tháng.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-xl border bg-background/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lương tháng gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <p className="text-2xl font-semibold">
                {formatVND(summary.latestNetPay)}
              </p>
            </div>
            {payroll.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatMonthYear(payroll[0].year, payroll[0].month)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-background/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng lương đã nhận trong năm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              <p className="text-2xl font-semibold text-green-600">
                {formatVND(summary.totalYearPay)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Năm {new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border bg-background/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số kỳ đã trả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <p className="text-2xl font-semibold text-blue-600">
                {summary.paidCount}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng {payroll.length} kỳ lương
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll History Table */}
      <Card className="rounded-xl border bg-background/50">
        <CardHeader>
          <CardTitle className="text-lg">Lịch sử lương</CardTitle>
        </CardHeader>
        <CardContent>
          {payroll.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Chưa có dữ liệu lương trong hệ thống
              </p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tháng</TableHead>
                      <TableHead className="text-right">Lương cơ bản</TableHead>
                      <TableHead className="text-right">Phụ cấp</TableHead>
                      <TableHead className="text-right">Hoa hồng</TableHead>
                      <TableHead className="text-right">Khấu trừ</TableHead>
                      <TableHead className="text-right font-semibold">
                        Thực nhận
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Hình thức</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payroll.map((record, idx) => (
                      <TableRow
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <TableCell className="font-medium">
                          {formatMonthYear(record.year, record.month)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatVND(record.base_salary)}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.base_allowance
                            ? formatVND(record.base_allowance)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.commission_amount
                            ? formatVND(record.commission_amount)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.deduction_penalty
                            ? formatVND(record.deduction_penalty)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatVND(record.net_pay)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.payment_status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              record.payment_status === "Paid"
                                ? "bg-green-600"
                                : "bg-amber-500"
                            }
                          >
                            {record.payment_status === "Paid"
                              ? "Đã trả"
                              : "Chờ xử lý"}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.payment_method || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedRecord && (
        <PayrollDetailDialog
          record={selectedRecord}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
