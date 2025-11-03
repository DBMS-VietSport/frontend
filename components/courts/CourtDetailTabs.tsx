"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X, Plus } from "lucide-react";
import type {
  Court,
  MaintenanceReport,
  CourtBookingSummary,
  UpdateCourtPayload,
  CreateMaintenanceReportPayload,
  CourtStatus,
} from "@/lib/courts/types";
import {
  formatDate,
  formatVND,
  getStatusBadgeColor,
  getStatusText,
} from "@/lib/courts/utils";
import { courtTypes, branches, employeeRepo } from "@/lib/mock";
import { toast } from "sonner";

interface CourtDetailTabsProps {
  court: Court;
  maintenanceReports: MaintenanceReport[];
  bookings: CourtBookingSummary[];
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (payload: UpdateCourtPayload) => Promise<void>;
  onAddMaintenance: (payload: CreateMaintenanceReportPayload) => Promise<void>;
}

export function CourtDetailTabs({
  court,
  maintenanceReports,
  bookings,
  isEditing,
  onEditToggle,
  onSave,
  onAddMaintenance,
}: CourtDetailTabsProps) {
  const [editData, setEditData] = React.useState<UpdateCourtPayload>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] =
    React.useState(false);
  const [selectedBooking, setSelectedBooking] =
    React.useState<CourtBookingSummary | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = React.useState(false);

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] =
    React.useState<CreateMaintenanceReportPayload>({
      court_id: court.id,
      date: new Date().toISOString().split("T")[0],
      description: "",
      cost: 0,
      employee_id: 1,
      status_after: "Available",
    });

  React.useEffect(() => {
    if (isEditing) {
      setEditData({
        name: court.name,
        court_type_id: court.court_type_id,
        branch_id: court.branch_id,
        capacity: court.capacity,
        base_hourly_price: court.base_hourly_price,
        status: court.status,
        maintenance_date: court.maintenance_date,
      });
    }
  }, [isEditing, court]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editData);
      onEditToggle();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMaintenance = async () => {
    try {
      await onAddMaintenance(maintenanceForm);
      setMaintenanceDialogOpen(false);
      setMaintenanceForm({
        court_id: court.id,
        date: new Date().toISOString().split("T")[0],
        description: "",
        cost: 0,
        employee_id: 1,
        status_after: "Available",
      });
      toast.success("Đã thêm báo cáo bảo trì thành công");
    } catch (error) {
      console.error("Failed to add maintenance:", error);
      toast.error("Không thể thêm báo cáo bảo trì");
    }
  };

  const handleBookingClick = (booking: CourtBookingSummary) => {
    setSelectedBooking(booking);
    setBookingDialogOpen(true);
  };

  return (
    <>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="maintenance">Lịch bảo trì</TabsTrigger>
          <TabsTrigger value="bookings">Lịch đặt sân</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-6">
          <Card className="p-6 rounded-2xl">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Thông tin sân</h3>
                  <Button variant="outline" onClick={onEditToggle}>
                    <Save className="h-4 w-4 mr-2" />
                    Chỉnh sửa thông tin
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Loại sân</p>
                    <p className="font-semibold mt-1">
                      {court.court_type_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sức chứa</p>
                    <p className="font-semibold mt-1">{court.capacity} người</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Giá gốc</p>
                    <p className="font-semibold mt-1">
                      {formatVND(court.base_hourly_price)}/giờ
                    </p>
                  </div>
                  {court.maintenance_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Ngày bảo trì gần nhất
                      </p>
                      <p className="font-semibold mt-1">
                        {formatDate(court.maintenance_date)}
                      </p>
                    </div>
                  )}
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
                    <Label>Tên sân</Label>
                    <Input
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại sân</Label>
                    <Select
                      value={(
                        editData.court_type_id || court.court_type_id
                      ).toString()}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          court_type_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCourtTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chi nhánh</Label>
                    <Select
                      value={(editData.branch_id || court.branch_id).toString()}
                      onValueChange={(value) =>
                        setEditData({ ...editData, branch_id: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.id}
                            value={branch.id.toString()}
                          >
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sức chứa</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editData.capacity || court.capacity}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá gốc (VNĐ/giờ)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={
                        editData.base_hourly_price || court.base_hourly_price
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          base_hourly_price: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                      value={editData.status || court.status}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          status: value as CourtStatus,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">
                          Đang hoạt động
                        </SelectItem>
                        <SelectItem value="InUse">Đang sử dụng</SelectItem>
                        <SelectItem value="Maintenance">Bảo trì</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editData.status === "Maintenance" && (
                    <div className="space-y-2">
                      <Label>Ngày bảo trì</Label>
                      <Input
                        type="date"
                        value={editData.maintenance_date || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            maintenance_date: e.target.value || undefined,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4 mt-6">
          <Card className="rounded-2xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Lịch sử bảo trì</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMaintenanceDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm báo cáo bảo trì
              </Button>
            </div>
            <ScrollArea className="h-[600px]">
              {maintenanceReports.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Không có lịch sử bảo trì
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Chi phí</TableHead>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Trạng thái sau</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {formatDate(report.date)}
                        </TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{formatVND(report.cost)}</TableCell>
                        <TableCell>{report.employee_name}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(report.status_after)}
                          >
                            {getStatusText(report.status_after)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
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
                      <TableHead>Mã booking</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Giờ</TableHead>
                      <TableHead>Trạng thái thanh toán</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer"
                        onClick={() => handleBookingClick(booking)}
                      >
                        <TableCell className="font-medium">
                          {booking.booking_code}
                        </TableCell>
                        <TableCell>{booking.customer_name}</TableCell>
                        <TableCell>{formatDate(booking.date)}</TableCell>
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
      </Tabs>

      {/* Add Maintenance Dialog */}
      <Dialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm báo cáo bảo trì</DialogTitle>
            <DialogDescription>
              Ghi nhận thông tin bảo trì cho sân này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ngày bảo trì</Label>
              <Input
                type="date"
                value={maintenanceForm.date}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    date: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input
                value={maintenanceForm.description}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Chi phí</Label>
              <Input
                type="number"
                min="0"
                value={maintenanceForm.cost}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    cost: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nhân viên thực hiện</Label>
              <Select
                value={maintenanceForm.employee_id.toString()}
                onValueChange={(value) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    employee_id: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái sau bảo trì</Label>
              <Select
                value={maintenanceForm.status_after}
                onValueChange={(value) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    status_after: value as CourtStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Đang hoạt động</SelectItem>
                  <SelectItem value="Maintenance">Tiếp tục bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setMaintenanceDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleAddMaintenance}>Thêm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đặt sân</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã booking</p>
                  <p className="font-semibold">
                    {selectedBooking.booking_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-semibold">
                    {selectedBooking.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày</p>
                  <p className="font-semibold">
                    {formatDate(selectedBooking.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giờ</p>
                  <p className="font-semibold">{selectedBooking.time_range}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái thanh toán
                  </p>
                  <Badge
                    variant={
                      selectedBooking.payment_status === "Đã thanh toán"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedBooking.payment_status === "Đã thanh toán"
                        ? "bg-green-500"
                        : ""
                    }
                  >
                    {selectedBooking.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p className="font-semibold">
                    {formatVND(selectedBooking.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
