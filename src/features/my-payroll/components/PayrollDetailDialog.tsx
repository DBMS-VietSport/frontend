"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { Calendar, Clock, FileText, Calculator } from "lucide-react";
import type { PayrollRecord } from "@/features/employee/mock/payrollRepo";
import { formatVND, formatMonthYear, formatDate } from "../utils";

interface PayrollDetailDialogProps {
  record: PayrollRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollDetailDialog({
  record,
  open,
  onOpenChange,
}: PayrollDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bảng lương</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Kỳ lương:</span>
              <span>{formatMonthYear(record.year, record.month)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Trạng thái:</span>
              <Badge
                variant={
                  record.payment_status === "Paid" ? "default" : "secondary"
                }
                className={
                  record.payment_status === "Paid"
                    ? "bg-green-600"
                    : "bg-amber-500"
                }
              >
                {record.payment_status === "Paid" ? "Đã trả" : "Chờ xử lý"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Shift Count */}
          {record.shift_count !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Ca trực được tính:</span>
              </div>
              <p className="text-lg font-semibold ml-6">
                {record.shift_count} ca
              </p>
            </div>
          )}

          {/* Note */}
          {record.note && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Ghi chú:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {record.note}
              </p>
            </div>
          )}

          {/* Payment Info */}
          {record.paid_at && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Thời gian đã chi trả:</span>
              </div>
              <p className="text-sm ml-6">{formatDate(record.paid_at)}</p>
              {record.payment_method && (
                <p className="text-sm text-muted-foreground ml-6">
                  Hình thức: {record.payment_method}
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Calculation Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Công thức tính lương:</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2 ml-6">
              <div className="flex justify-between items-center">
                <span className="text-sm">Lương cơ bản:</span>
                <span className="font-medium">
                  {formatVND(record.base_salary)}
                </span>
              </div>

              {record.base_allowance && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Phụ cấp:</span>
                  <span className="font-medium text-green-600">
                    + {formatVND(record.base_allowance)}
                  </span>
                </div>
              )}

              {record.commission_amount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Hoa hồng
                    {record.commission_rate
                      ? ` (${record.commission_rate}%)`
                      : ""}
                    :
                  </span>
                  <span className="font-medium text-green-600">
                    + {formatVND(record.commission_amount)}
                  </span>
                </div>
              )}

              {record.deduction_penalty && record.deduction_penalty > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Khấu trừ:</span>
                  <span className="font-medium text-red-600">
                    - {formatVND(record.deduction_penalty)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Tổng thu nhập (Gross):</span>
                <span className="font-semibold text-lg">
                  {formatVND(record.gross_pay)}
                </span>
              </div>

              {record.deduction_penalty && record.deduction_penalty > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trừ khấu trừ:</span>
                    <span className="text-sm text-red-600">
                      - {formatVND(record.deduction_penalty)}
                    </span>
                  </div>
                  <Separator />
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                <span className="font-bold text-lg">Thực nhận (Net):</span>
                <span className="font-bold text-xl text-primary">
                  {formatVND(record.net_pay)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
