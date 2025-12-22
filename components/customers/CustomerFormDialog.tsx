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
import type { Customer, CreateCustomerPayload } from "@/lib/customers/types";
import { mockCustomerLevels } from "@/lib/customers/mockRepo";
import { logger } from "@/lib/utils/logger";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSave: (payload: CreateCustomerPayload) => Promise<void>;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerFormDialogProps) {
  const [formData, setFormData] = React.useState<CreateCustomerPayload>({
    full_name: "",
    dob: "",
    gender: "Nam",
    id_card_number: "",
    address: "",
    phone_number: "",
    email: "",
    customer_level_id: 4, // Default to "Thường"
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Initialize form data when customer changes
  React.useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name,
        dob: customer.dob,
        gender: customer.gender,
        id_card_number: customer.id_card_number,
        address: customer.address,
        phone_number: customer.phone_number,
        email: customer.email,
        customer_level_id: customer.customer_level_id,
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
        customer_level_id: 4,
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name.trim()) {
      return;
    }
    if (!formData.phone_number.trim()) {
      return;
    }
    if (!formData.email.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to save customer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Cập nhật thông tin khách hàng"
              : "Điền thông tin để thêm khách hàng mới"}
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

          <div className="space-y-2">
            <Label htmlFor="customer_level_id">Hạng thành viên</Label>
            <Select
              value={formData.customer_level_id.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
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
                    {level.name} ({level.discount_rate}% giảm giá)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isSaving ? "Đang lưu..." : customer ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
