"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceDetail } from "@/lib/mock/invoiceManagerRepo";

interface CancelInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
  onConfirm: (reason: string) => void;
}

export function CancelInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: CancelInvoiceDialogProps) {
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy hóa đơn {invoice.code}</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do hủy hóa đơn. Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do hủy *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do hủy hóa đơn..."
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
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.total_amount)}
                </span>
              </p>
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
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
