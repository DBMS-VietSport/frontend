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
  Court,
  CreateCourtPayload,
  CourtStatus,
} from "@/lib/courts/types";
import { courtTypes, branches } from "@/lib/mock";
import { logger } from "@/lib/utils/logger";

interface CourtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CreateCourtPayload) => Promise<void>;
}

export function CourtFormDialog({
  open,
  onOpenChange,
  onSave,
}: CourtFormDialogProps) {
  const [formData, setFormData] = React.useState<CreateCourtPayload>({
    name: "",
    court_type_id: 1,
    branch_id: 1,
    capacity: 4,
    base_hourly_price: 100000,
    status: "Available",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        court_type_id: 1,
        branch_id: 1,
        capacity: 4,
        base_hourly_price: 100000,
        status: "Available",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.base_hourly_price || formData.base_hourly_price <= 0) return;
    if (!formData.capacity || formData.capacity <= 0) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to save court:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm sân mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để thêm sân mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sân</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ví dụ: Sân 1, Sân Futsal A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="court_type_id">
                Loại sân <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.court_type_id.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    court_type_id: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courtTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
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
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as CourtStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Đang hoạt động</SelectItem>
                  <SelectItem value="Maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Sức chứa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_hourly_price">
                Giá gốc (VNĐ/giờ) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="base_hourly_price"
                type="number"
                min="0"
                value={formData.base_hourly_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_hourly_price: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          {formData.status === "Maintenance" && (
            <div className="space-y-2">
              <Label htmlFor="maintenance_date">Ngày bảo trì</Label>
              <Input
                id="maintenance_date"
                type="date"
                value={formData.maintenance_date || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenance_date: e.target.value || undefined,
                  })
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
