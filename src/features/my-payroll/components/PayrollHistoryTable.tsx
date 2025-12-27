"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Badge } from "@/ui/badge";
import { ScrollArea } from "@/ui/scroll-area";
import type { PayrollRecord } from "@/features/employee/mock/payrollRepo";
import { formatVND, formatMonthYear } from "../utils";

interface PayrollHistoryTableProps {
  payroll: PayrollRecord[];
  onRecordClick: (record: PayrollRecord) => void;
}

export function PayrollHistoryTable({
  payroll,
  onRecordClick,
}: PayrollHistoryTableProps) {
  return (
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
                      onClick={() => onRecordClick(record)}
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
  );
}
