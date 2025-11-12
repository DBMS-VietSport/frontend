"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  BookingForInvoice,
  UnpaidBookingItem,
} from "@/lib/mock/invoiceCashierRepo";
import { listUnpaidBookings } from "@/lib/mock/invoiceCashierRepo";
import { Search, List } from "lucide-react";

interface BookingInfoCardProps {
  bookingCode: string;
  onBookingCodeChange: (code: string) => void;
  onLoadBooking: (code?: string) => void;
  booking: BookingForInvoice | null;
  loading: boolean;
}

export function BookingInfoCard({
  bookingCode,
  onBookingCodeChange,
  onLoadBooking,
  booking,
  loading,
}: BookingInfoCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [unpaidBookings, setUnpaidBookings] = React.useState<
    UnpaidBookingItem[]
  >([]);
  const [loadingBookings, setLoadingBookings] = React.useState(false);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const loadUnpaidBookings = async () => {
    setLoadingBookings(true);
    try {
      const bookings = await listUnpaidBookings();
      setUnpaidBookings(bookings);
    } catch (error) {
      console.error("Failed to load unpaid bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    loadUnpaidBookings();
  };

  const handleSelectBooking = (selectedBooking: UnpaidBookingItem) => {
    onBookingCodeChange(selectedBooking.bookingCode);
    setDialogOpen(false);
    // Automatically load booking with the selected booking code
    onLoadBooking(selectedBooking.bookingCode);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đặt sân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã đặt sân (VD: VS-1-20251101)"
              value={bookingCode}
              onChange={(e) => onBookingCodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onLoadBooking();
                }
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleOpenDialog}
              disabled={loading}
            >
              <List className="h-4 w-4 mr-2" />
              Chọn đặt sân
            </Button>
            <Button
              onClick={() => onLoadBooking(bookingCode)}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              Tải thông tin
            </Button>
          </div>

          {booking && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cơ sở</p>
                  <p className="font-medium">{booking.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-medium">{booking.court}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khung giờ</p>
                  <p className="font-medium">{booking.timeRange}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Giá sân</p>
                  <p className="font-medium text-lg">
                    {formatVND(booking.basePrice)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unpaid Bookings Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn đặt sân chưa thanh toán</DialogTitle>
            <DialogDescription>
              Chọn một đặt sân từ danh sách để tự động điền thông tin
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {loadingBookings ? (
              <p className="text-center text-muted-foreground py-8">
                Đang tải danh sách...
              </p>
            ) : unpaidBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Không có đặt sân nào chưa thanh toán
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đặt sân</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sân</TableHead>
                    <TableHead>Khung giờ</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidBookings.map((item) => (
                    <TableRow key={item.bookingId}>
                      <TableCell className="font-medium">
                        {item.bookingCode}
                      </TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.court}</TableCell>
                      <TableCell>{item.timeRange}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectBooking(item)}
                        >
                          Chọn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
