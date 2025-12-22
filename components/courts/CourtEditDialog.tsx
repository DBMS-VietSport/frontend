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
  CourtStatus,
  UpdateCourtPayload,
} from "@/lib/courts/types";
import { courtTypes, branches } from "@/lib/mock";
import { logger } from "@/lib/utils/logger";

interface CourtEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court | null;
  onSave: (id: number, payload: UpdateCourtPayload) => Promise<void>;
}

export function CourtEditDialog({
  open,
  onOpenChange,
  court,
  onSave,
}: CourtEditDialogProps) {
  const [formData, setFormData] = React.useState<UpdateCourtPayload>({
    name: "",
    status: "Available",
    capacity: 4,
    base_hourly_price: 100000,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  // Initialize form data when court changes
  React.useEffect(() => {
    if (court) {
      setFormData({
        name: court.name || "",
        court_type_id: court.court_type_id,
        branch_id: court.branch_id,
        capacity: court.capacity,
        base_hourly_price: court.base_hourly_price,
        status: court.status,
        maintenance_date: court.maintenance_date,
      });
    }
  }, [court, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!court) return;

    // Validation
    if (formData.base_hourly_price && formData.base_hourly_price <= 0) return;
    if (formData.capacity && formData.capacity <= 0) return;

    setIsSaving(true);
    try {
      await onSave(court.id, formData);
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to update court:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!court) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sân</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sân {court.name || `Sân ${court.id}`}
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
              <Label htmlFor="court_type_id">Loại sân</Label>
              <Select
                value={
                  formData.court_type_id?.toString() ||
                  court.court_type_id.toString()
                }
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
              <Label htmlFor="branch_id">Chi nhánh</Label>
              <Select
                value={
                  formData.branch_id?.toString() || court.branch_id.toString()
                }
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
                value={formData.status || court.status}
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
                  <SelectItem value="Maintenance">Đang bảo trì</SelectItem>
                  <SelectItem value="InUse">Đang sử dụng</SelectItem>
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
                value={formData.capacity || court.capacity}
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
                value={formData.base_hourly_price || court.base_hourly_price}
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

          {(formData.status === "Maintenance" ||
            court.status === "Maintenance") && (
            <div className="space-y-2">
              <Label htmlFor="maintenance_date">Ngày bảo trì</Label>
              <Input
                id="maintenance_date"
                type="date"
                value={
                  formData.maintenance_date || court.maintenance_date || ""
                }
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
              {isSaving ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
