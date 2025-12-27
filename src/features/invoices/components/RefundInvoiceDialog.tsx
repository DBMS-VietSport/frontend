"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import type { InvoiceDetail } from "@/features/invoices/mock/invoiceManagerRepo";
import { formatVND } from "@/features/booking/utils/pricing";

interface RefundInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
  onConfirm: (amount: number, reason: string) => void;
}

export function RefundInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: RefundInvoiceDialogProps) {
  const [amount, setAmount] = React.useState(invoice.total_amount.toString());
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0 || amountNum > invoice.total_amount) {
      return;
    }
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(amountNum, reason);
      setAmount(invoice.total_amount.toString());
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAmount(invoice.total_amount.toString());
    setReason("");
    onOpenChange(false);
  };

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount =
    amountNum > 0 && amountNum <= invoice.total_amount && reason.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Hoàn tiền / Điều chỉnh hóa đơn {invoice.code}
          </DialogTitle>
          <DialogDescription>
            Nhập số tiền hoàn lại và lý do. Có thể hoàn một phần hoặc toàn bộ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền hoàn lại (VND) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Nhập số tiền"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              max={invoice.total_amount}
            />
            <p className="text-xs text-muted-foreground">
              Tối đa: {formatVND(invoice.total_amount)}
            </p>
            {amountNum > invoice.total_amount && (
              <p className="text-xs text-destructive">
                Số tiền không được vượt quá tổng hóa đơn
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do hoàn tiền *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do hoàn tiền..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Thông tin hóa đơn</p>
            <div className="text-sm space-y-1">
              <p>
                Khách hàng:{" "}
                <span className="font-medium">{invoice.customerName}</span>
              </p>
              <p>
                Tổng tiền:{" "}
                <span className="font-medium">
                  {formatVND(invoice.total_amount)}
                </span>
              </p>
              {amountNum > 0 && (
                <p>
                  Số tiền hoàn lại:{" "}
                  <span className="font-medium text-blue-600">
                    {formatVND(amountNum)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidAmount || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
