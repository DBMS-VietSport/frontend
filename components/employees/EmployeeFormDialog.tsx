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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Employee, CreateEmployeePayload } from "@/lib/employees/types";
import { mockRoles } from "@/lib/employees/mockRepo";
import { mockBranches as branches } from "@/lib/booking/mockRepo";
import { logger } from "@/lib/utils/logger";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (payload: CreateEmployeePayload) => Promise<void>;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSave,
}: EmployeeFormDialogProps) {
  const [formData, setFormData] = React.useState<CreateEmployeePayload>({
    full_name: "",
    dob: "",
    gender: "Nam",
    id_card_number: "",
    address: "",
    phone_number: "",
    email: "",
    commission_rate: 3,
    base_salary: 7000000,
    base_allowance: 1000000,
    branch_id: 1,
    role_id: 2,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Initialize form data when employee changes
  React.useEffect(() => {
    if (employee) {
      setFormData({
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
    } else {
      setFormData({
        full_name: "",
        dob: "",
        gender: "Nam",
        id_card_number: "",
        address: "",
        phone_number: "",
        email: "",
        commission_rate: 3,
        base_salary: 7000000,
        base_allowance: 1000000,
        branch_id: 1,
        role_id: 2,
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name.trim()) return;
    if (!formData.phone_number.trim()) return;
    if (!formData.email.trim()) return;
    if (!formData.base_salary || formData.base_salary <= 0) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to save employee:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? "Cập nhật thông tin nhân viên"
              : "Điền thông tin để thêm nhân viên mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Họ tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giới tính</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  gender: value as "Nam" | "Nữ" | "Khác",
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Nam" id="male" />
                <Label htmlFor="male">Nam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Nữ" id="female" />
                <Label htmlFor="female">Nữ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Khác" id="other" />
                <Label htmlFor="other">Khác</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_card_number">CMND/CCCD</Label>
              <Input
                id="id_card_number"
                value={formData.id_card_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_card_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch_id">
                Chi nhánh <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.branch_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, branch_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">
                Chức vụ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, role_id: parseInt(value) })
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary">
                Lương cơ bản <span className="text-destructive">*</span>
              </Label>
              <Input
                id="base_salary"
                type="number"
                min="0"
                value={formData.base_salary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_salary: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_allowance">Phụ cấp</Label>
              <Input
                id="base_allowance"
                type="number"
                min="0"
                value={formData.base_allowance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_allowance: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate">Tỷ lệ hoa hồng (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commission_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : employee ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
