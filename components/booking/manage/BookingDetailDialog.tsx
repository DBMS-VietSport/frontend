"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BookingDetailView } from "@/lib/booking/types";
import { formatVND, formatTimeRange, formatDate } from "@/lib/booking/pricing";

interface BookingDetailDialogProps {
  booking: BookingDetailView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết đặt sân</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Booking Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã booking</p>
                  <p className="font-semibold">{booking.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-semibold">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-semibold">{booking.branchName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại sân</p>
                  <p className="font-semibold">{booking.courtType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-semibold">{booking.courtName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge
                    className={
                      booking.courtStatus === "Paid"
                        ? "bg-green-500"
                        : booking.courtStatus === "Held"
                        ? "bg-blue-500"
                        : ""
                    }
                  >
                    {booking.courtStatus}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tên khách hàng
                  </p>
                  <p className="font-semibold">{booking.customer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-semibold">
                    {booking.customer.phone_number}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{booking.customer.email}</p>
                </div>
                {booking.employee && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Nhân viên xử lý
                    </p>
                    <p className="font-semibold">
                      {booking.employee.full_name}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Time Slots */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Khung giờ đặt</h3>
              <div className="space-y-2">
                {booking.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="font-medium">
                      {formatTimeRange(slot.start_time, slot.end_time)}
                    </span>
                    <Badge variant="outline">{slot.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Services */}
            {booking.serviceItems.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4">Dịch vụ bổ sung</h3>
                <div className="space-y-3">
                  {booking.serviceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity} {item.service.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatVND(
                            item.branchService.unit_price * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Payment Summary */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">
                Chi tiết thanh toán
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phí sân</span>
                  <span className="font-medium">
                    {formatVND(booking.courtFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-medium">
                    {formatVND(booking.serviceFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-primary">
                    {formatVND(booking.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Invoices */}
              {booking.invoices.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-semibold mb-3">Hóa đơn</h4>
                  <div className="space-y-2">
                    {booking.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-2 text-sm"
                      >
                        <div>
                          <span className="text-muted-foreground">
                            #{invoice.id} - {invoice.payment_method}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {formatVND(invoice.total_amount)}
                          </span>
                          <Badge
                            variant={
                              invoice.status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              invoice.status === "Paid" ? "bg-green-500" : ""
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
