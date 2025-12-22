"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import type { InvoiceDetail } from "@/lib/mock/invoiceManagerRepo";
import { formatDateTime } from "@/lib/utils/date";
import { X, RefreshCw, ArrowLeftRight } from "lucide-react";
import { formatVND } from "@/lib/booking/pricing";

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
  onCancel: () => void;
  onRefund: () => void;
  onMarkAsPaid: () => void;
  onProcessRefund?: () => void;
  onRefresh?: () => void;
}

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  onCancel,
  onRefund,
  onMarkAsPaid,
  onProcessRefund,
  onRefresh,
}: InvoiceDetailDialogProps) {

  const canCancel = invoice.status === "Paid";
  const canRefund = invoice.status === "Paid";
  const canProcessRefund = invoice.status === "Paid" && !!onProcessRefund;
  const canMarkAsPaid =
    invoice.status === "Unpaid" || invoice.status === "Pending";
  const isRefunded =
    invoice.status === "Refunded" ||
    invoice.status === "PartiallyRefunded" ||
    invoice.status === "Partially Refunded";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết hóa đơn {invoice.code}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và lịch sử giao dịch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã hóa đơn</p>
              <p className="font-medium">{invoice.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <div className="mt-1"><StatusBadge status={invoice.status} category="payment" /></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="font-medium">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">
                {invoice.created_at
                  ? formatDateTime(invoice.created_at)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Hình thức thanh toán
              </p>
              <p className="font-medium">{invoice.payment_method}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thu ngân</p>
              <p className="font-medium">{invoice.cashierName || "-"}</p>
            </div>
          </div>

          <Separator />

          {/* Booking Info */}
          {invoice.bookingCode && (
            <>
              <div>
                <h4 className="font-semibold mb-3">Thông tin đặt sân</h4>
                <div className="grid grid-cols-2 gap-4">
                  {invoice.branchName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cơ sở</p>
                      <p className="font-medium">{invoice.branchName}</p>
                    </div>
                  )}
                  {invoice.courtName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sân</p>
                      <p className="font-medium">{invoice.courtName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đặt sân</p>
                    <p className="font-medium">{invoice.bookingCode}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Services */}
          {invoice.services && invoice.services.length > 0 && (
            <>
              <div>
                <h4 className="font-semibold mb-3">Dịch vụ</h4>
                <div className="space-y-2">
                  {invoice.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.quantity} x {formatVND(service.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium">{formatVND(service.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="font-medium">
                {formatVND(invoice.total_amount)}
              </span>
            </div>
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Giảm giá</span>
                <span>-{formatVND(invoice.discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Thành tiền</span>
              <span>{formatVND(invoice.total_amount)}</span>
            </div>
          </div>

          {/* Cancel Reason */}
          {invoice.cancelReason && (
            <>
              <Separator />
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-destructive mb-2">
                    Lý do hủy
                  </p>
                  <p className="text-sm">{invoice.cancelReason}</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Refund Info */}
          {isRefunded && invoice.refundAmount && invoice.refundAmount > 0 && (
            <>
              <Separator />
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Thông tin hoàn tiền
                    </p>
                    {onRefresh && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={onRefresh}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {invoice.refundReason && (
                      <p>
                        <span className="text-muted-foreground">Lý do:</span>{" "}
                        <span className="font-medium">
                          {invoice.refundReason}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Đã hoàn:</span>{" "}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatVND(invoice.refundAmount)}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Ghi chú</p>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex justify-end gap-2">
            {canMarkAsPaid && (
              <Button variant="outline" onClick={onMarkAsPaid}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Đánh dấu đã thanh toán
              </Button>
            )}
            {canProcessRefund && (
              <Button variant="default" onClick={onProcessRefund}>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Xử lý hoàn tiền
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Hủy hóa đơn
              </Button>
            )}
            {canRefund && !canProcessRefund && (
              <Button variant="outline" onClick={onRefund}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Hoàn tiền / Điều chỉnh
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
