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
import type {
  CreateServicePayload,
  ServiceRentalType,
  ServiceUnit,
  ServiceStatus,
} from "@/lib/services/types";
import { branches } from "@/lib/mock";
import { logger } from "@/lib/utils/logger";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CreateServicePayload) => Promise<void>;
}

const rentalTypes: ServiceRentalType[] = ["Dụng cụ", "Nhân sự", "Tiện ích"];
const serviceUnits: ServiceUnit[] = [
  "Lần",
  "Giờ",
  "Trận",
  "Tháng",
  "Lượt",
  "Chai",
];

export function ServiceFormDialog({
  open,
  onOpenChange,
  onSave,
}: ServiceFormDialogProps) {
  const [formData, setFormData] = React.useState<CreateServicePayload>({
    name: "",
    unit: "Lần",
    rental_type: "Dụng cụ",
    branch_id: 1,
    unit_price: 0,
    current_stock: 0,
    min_stock_threshold: 10,
    status: "Available",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        unit: "Lần",
        rental_type: "Dụng cụ",
        branch_id: 1,
        unit_price: 0,
        current_stock: 0,
        min_stock_threshold: 10,
        status: "Available",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.trim() === "") {
      return;
    }
    if (formData.unit_price < 0 || formData.current_stock < 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to create service:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm dịch vụ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm dịch vụ mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">
                Tên dịch vụ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Thuê Bóng Đá, Huấn Luyện Viên..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rental_type">
                Loại dịch vụ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.rental_type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    rental_type: value as ServiceRentalType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rentalTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Đơn vị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value as ServiceUnit })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="unit_price">
                Giá (VNĐ/{formData.unit}){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="1000"
                value={formData.unit_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit_price: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">
                Tồn kho hiện tại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_stock: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_threshold">
                Ngưỡng cảnh báo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="min_stock_threshold"
                type="number"
                min="0"
                value={formData.min_stock_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_stock_threshold: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as ServiceStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Hoạt động</SelectItem>
                <SelectItem value="Unavailable">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
