"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { ScrollArea } from "@/ui/scroll-area";
import { Badge } from "@/ui/badge";
import { Save, X } from "lucide-react";
import type {
  Customer,
  BookingSummary,
  InvoiceSummary,
  UpdateCustomerPayload,
} from "@/features/customer/types";
import { formatDate, formatVND, calculateAge } from "@/features/customer/utils";
import { mockCustomerLevels } from "@/features/customer/mockRepo";
import { logger } from "@/utils/logger";

interface CustomerDetailTabsProps {
  customer: Customer;
  bookings: BookingSummary[];
  invoices: InvoiceSummary[];
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (payload: UpdateCustomerPayload) => Promise<void>;
}

export function CustomerDetailTabs({
  customer,
  bookings,
  invoices,
  isEditing,
  onEditToggle,
  onSave,
}: CustomerDetailTabsProps) {
  const [editData, setEditData] = React.useState<UpdateCustomerPayload>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditData({
        full_name: customer.full_name,
        dob: customer.dob,
        gender: customer.gender,
        id_card_number: customer.id_card_number,
        address: customer.address,
        phone_number: customer.phone_number,
        email: customer.email,
        customer_level_id: customer.customer_level_id,
      });
    }
  }, [isEditing, customer]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editData);
      onEditToggle();
    } catch (error) {
      logger.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredInvoices = React.useMemo(() => {
    if (!invoiceStatusFilter) return invoices;
    return invoices.filter((inv) => inv.status === invoiceStatusFilter);
  }, [invoices, invoiceStatusFilter]);

  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Thông tin chung</TabsTrigger>
        <TabsTrigger value="bookings">Lịch sử đặt sân</TabsTrigger>
        <TabsTrigger value="invoices">Hóa đơn</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4 mt-6">
        <Card className="p-6 rounded-2xl">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
                <Button variant="outline" onClick={onEditToggle}>
                  <Save className="h-4 w-4 mr-2" />
                  Chỉnh sửa thông tin
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-semibold mt-1">{customer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-semibold mt-1">
                    {customer.dob
                      ? `${formatDate(customer.dob)} (${calculateAge(
                          customer.dob
                        )} tuổi)`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-semibold mt-1">{customer.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                  <p className="font-semibold mt-1">
                    {customer.id_card_number || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-semibold mt-1">
                    {customer.address || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-semibold mt-1">{customer.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold mt-1">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hạng thành viên
                  </p>
                  <p className="font-semibold mt-1">
                    {customer.customer_level_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
                  <p className="font-semibold mt-1">
                    {customer.bonus_point.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Chỉnh sửa thông tin</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onEditToggle}>
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ tên</Label>
                  <Input
                    value={editData.full_name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={editData.dob || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, dob: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={editData.gender || "Nam"}
                    onValueChange={(value) =>
                      setEditData({
                        ...editData,
                        gender: value as "Nam" | "Nữ" | "Khác",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CMND/CCCD</Label>
                  <Input
                    value={editData.id_card_number || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        id_card_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={editData.address || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={editData.phone_number || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, phone_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hạng thành viên</Label>
                  <Select
                    value={(
                      editData.customer_level_id || customer.customer_level_id
                    ).toString()}
                    onValueChange={(value) =>
                      setEditData({
                        ...editData,
                        customer_level_id: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomerLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-4 mt-6">
        <Card className="rounded-2xl overflow-hidden">
          <ScrollArea className="h-[600px]">
            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  Không có lịch sử đặt sân
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đặt sân</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Loại sân</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Trạng thái thanh toán</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.booking_code}
                      </TableCell>
                      <TableCell>{formatDate(booking.date)}</TableCell>
                      <TableCell>{booking.court_name}</TableCell>
                      <TableCell>{booking.time_range}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.payment_status === "Đã thanh toán"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            booking.payment_status === "Đã thanh toán"
                              ? "bg-green-500"
                              : ""
                          }
                        >
                          {booking.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatVND(booking.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </Card>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-4 mt-6">
        <Card className="rounded-2xl overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Label>Lọc theo trạng thái:</Label>
              <Select
                value={invoiceStatusFilter || "all"}
                onValueChange={(value) =>
                  setInvoiceStatusFilter(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Paid">Đã thanh toán</SelectItem>
                  <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  <SelectItem value="Refund">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="h-[600px]">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Không có hóa đơn</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HĐ</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Hình thức TT</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        #{invoice.id}
                      </TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>{invoice.invoice_type}</TableCell>
                      <TableCell>{invoice.payment_method}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid"
                              ? "default"
                              : invoice.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            invoice.status === "Paid"
                              ? "bg-green-500"
                              : invoice.status === "Pending"
                              ? "bg-yellow-500"
                              : ""
                          }
                        >
                          {invoice.status === "Paid"
                            ? "Đã thanh toán"
                            : invoice.status === "Pending"
                            ? "Chờ xử lý"
                            : "Hoàn tiền"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatVND(invoice.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
