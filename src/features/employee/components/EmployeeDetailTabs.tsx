"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { ScrollArea } from "@/ui/scroll-area";
import { Badge } from "@/ui/badge";
import { Save, X } from "lucide-react";
import type {
  Employee,
  WorkShift,
  SalaryHistory,
  UpdateEmployeePayload,
} from "@/features/employee/types";
import { formatDate, formatVND, formatTime } from "@/features/employee/utils";
import { mockRoles } from "@/features/employee/mockRepo";
import { mockBranches as branches } from "@/features/booking/mock/mockRepo";
import { EmployeePerformanceChart } from "./EmployeePerformanceChart";
import type { PerformanceRecord } from "@/features/employee/types";
import { logger } from "@/utils/logger";

interface EmployeeDetailTabsProps {
  employee: Employee;
  workShifts: WorkShift[];
  salaryHistory: SalaryHistory[];
  performanceStats: PerformanceRecord[];
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (payload: UpdateEmployeePayload) => Promise<void>;
}

export function EmployeeDetailTabs({
  employee,
  workShifts,
  salaryHistory,
  performanceStats,
  isEditing,
  onEditToggle,
  onSave,
}: EmployeeDetailTabsProps) {
  const [editData, setEditData] = React.useState<UpdateEmployeePayload>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditData({
        full_name: employee.full_name,
        dob: employee.dob,
        gender: employee.gender,
        id_card_number: employee.id_card_number,
        address: employee.address,
        phone_number: employee.phone_number,
        email: employee.email,
        commission_rate: employee.commission_rate,
        base_salary: employee.base_salary,
        base_allowance: employee.base_allowance,
        branch_id: employee.branch_id,
        role_id: employee.role_id,
      });
    }
  }, [isEditing, employee]);

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

  // Filter shifts by month
  const filteredShifts = React.useMemo(() => {
    if (!selectedMonth) return workShifts;
    return workShifts.filter((shift) => shift.date.startsWith(selectedMonth));
  }, [workShifts, selectedMonth]);

  // Calculate salary summary
  const salarySummary = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const thisYearSalaries = salaryHistory.filter(
      (s) => s.year === currentYear
    );
    const total = thisYearSalaries.reduce((sum, s) => sum + s.net_pay, 0);
    const avg =
      thisYearSalaries.length > 0 ? total / thisYearSalaries.length : 0;
    const totalBonus = thisYearSalaries.reduce(
      (sum, s) => sum + s.commission_amount,
      0
    );

    return {
      totalYear: total,
      avgMonthly: avg,
      totalBonus,
    };
  }, [salaryHistory]);

  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="info">Thông tin chung</TabsTrigger>
        <TabsTrigger value="shifts">Ca trực</TabsTrigger>
        <TabsTrigger value="salary">Bảng lương</TabsTrigger>
        <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
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
                  <p className="font-semibold mt-1">{employee.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày sinh</p>
                  <p className="font-semibold mt-1">
                    {employee.dob ? formatDate(employee.dob) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giới tính</p>
                  <p className="font-semibold mt-1">{employee.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                  <p className="font-semibold mt-1">
                    {employee.id_card_number || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-semibold mt-1">
                    {employee.address || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-semibold mt-1">{employee.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold mt-1">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi nhánh</p>
                  <p className="font-semibold mt-1">{employee.branch_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chức vụ</p>
                  <p className="font-semibold mt-1">{employee.role_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lương cơ bản</p>
                  <p className="font-semibold mt-1">
                    {formatVND(employee.base_salary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phụ cấp</p>
                  <p className="font-semibold mt-1">
                    {formatVND(employee.base_allowance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tỷ lệ hoa hồng
                  </p>
                  <p className="font-semibold mt-1">
                    {employee.commission_rate}%
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
                  <Label>Chi nhánh</Label>
                  <Select
                    value={(
                      editData.branch_id || employee.branch_id
                    ).toString()}
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
                  <Label>Chức vụ</Label>
                  <Select
                    value={(editData.role_id || employee.role_id).toString()}
                    onValueChange={(value) =>
                      setEditData({ ...editData, role_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lương cơ bản</Label>
                  <Input
                    type="number"
                    value={editData.base_salary || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        base_salary: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phụ cấp</Label>
                  <Input
                    type="number"
                    value={editData.base_allowance || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        base_allowance: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tỷ lệ hoa hồng (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editData.commission_rate || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        commission_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="shifts" className="space-y-4 mt-6">
        <Card className="rounded-2xl overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Label>Lọc theo tháng:</Label>
              <Select
                value={selectedMonth || "all"}
                onValueChange={(value) =>
                  setSelectedMonth(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="2025-11">Tháng 11/2025</SelectItem>
                  <SelectItem value="2025-10">Tháng 10/2025</SelectItem>
                  <SelectItem value="2025-09">Tháng 9/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="h-[600px]">
            {filteredShifts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Không có ca trực</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Bắt đầu</TableHead>
                    <TableHead>Kết thúc</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        {formatDate(shift.date)}
                      </TableCell>
                      <TableCell>{formatTime(shift.start_time)}</TableCell>
                      <TableCell>{formatTime(shift.end_time)}</TableCell>
                      <TableCell>{shift.note || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shift.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            shift.status === "Completed" ? "bg-green-500" : ""
                          }
                        >
                          {shift.status === "Completed"
                            ? "Hoàn thành"
                            : "Đã phân ca"}
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

      <TabsContent value="salary" className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-2xl">
            <p className="text-sm text-muted-foreground">Tổng lương năm nay</p>
            <p className="text-2xl font-bold mt-2">
              {formatVND(salarySummary.totalYear)}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl">
            <p className="text-sm text-muted-foreground">Trung bình tháng</p>
            <p className="text-2xl font-bold mt-2">
              {formatVND(salarySummary.avgMonthly)}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl">
            <p className="text-sm text-muted-foreground">Tổng thưởng</p>
            <p className="text-2xl font-bold mt-2">
              {formatVND(salarySummary.totalBonus)}
            </p>
          </Card>
        </div>

        <Card className="rounded-2xl overflow-hidden">
          <ScrollArea className="h-[600px]">
            {salaryHistory.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Không có lịch sử lương</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng/Năm</TableHead>
                    <TableHead>Lương cơ bản</TableHead>
                    <TableHead>Phụ cấp</TableHead>
                    <TableHead>Hoa hồng</TableHead>
                    <TableHead>Tổng</TableHead>
                    <TableHead>Thực lãnh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryHistory.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell className="font-medium">
                        {salary.month}/{salary.year}
                      </TableCell>
                      <TableCell>{formatVND(salary.base_salary)}</TableCell>
                      <TableCell>{formatVND(salary.base_allowance)}</TableCell>
                      <TableCell>
                        {formatVND(salary.commission_amount)}
                      </TableCell>
                      <TableCell>{formatVND(salary.gross_pay)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatVND(salary.net_pay)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            salary.payment_status === "Paid"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            salary.payment_status === "Paid"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }
                        >
                          {salary.payment_status === "Paid"
                            ? "Đã thanh toán"
                            : "Chờ xử lý"}
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

      <TabsContent value="performance" className="space-y-4 mt-6">
        <EmployeePerformanceChart data={performanceStats} />
      </TabsContent>
    </Tabs>
  );
}
