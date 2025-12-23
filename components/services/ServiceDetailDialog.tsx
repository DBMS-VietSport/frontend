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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import type {
  ServiceRow,
  ServiceRentalType,
  ServiceUnit,
  ServiceStatus,
  UpdateServicePayload,
  UpdateBranchServicePayload,
} from "@/lib/services/types";
import { isLowStock, formatPrice } from "@/lib/services/selectors";
import { logger } from "@/lib/utils/logger";

interface ServiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRow | null;
  onSave: (
    serviceId: number,
    branchServiceId: number,
    servicePayload: UpdateServicePayload,
    branchServicePayload: UpdateBranchServicePayload
  ) => Promise<void>;
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

export function ServiceDetailDialog({
  open,
  onOpenChange,
  service,
  onSave,
}: ServiceDetailDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    unit: "Lần" as ServiceUnit,
    rental_type: "Dụng cụ" as ServiceRentalType,
    unit_price: 0,
    current_stock: 0,
    min_stock_threshold: 10,
    status: "Available" as ServiceStatus,
  });

  // Initialize form data when service changes
  React.useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        unit: service.unit,
        rental_type: service.rental_type,
        unit_price: service.unit_price,
        current_stock: service.current_stock ?? 0,
        min_stock_threshold: service.min_stock_threshold ?? 10,
        status: service.status ?? "Available",
      });
      setIsEditing(false);
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service) return;

    setIsSaving(true);
    try {
      const servicePayload: UpdateServicePayload = {
        name: formData.name,
        unit: formData.unit,
        rental_type: formData.rental_type,
      };

      const branchServicePayload: UpdateBranchServicePayload = {
        unit_price: formData.unit_price,
        current_stock: formData.current_stock,
        min_stock_threshold: formData.min_stock_threshold,
        status: formData.status,
      };

      await onSave(
        service.id,
        service.branch_service_id,
        servicePayload,
        branchServicePayload
      );
      setIsEditing(false);
    } catch (error) {
      logger.error("Failed to update service:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!service) return null;

  const lowStock = isLowStock(service);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service.name}
            {lowStock && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cảnh báo tồn kho
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Chi tiết và chỉnh sửa thông tin dịch vụ
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin chung</TabsTrigger>
            <TabsTrigger value="inventory">Giá & Tồn kho</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin dịch vụ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên dịch vụ</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rental_type">Loại dịch vụ</Label>
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
                        <Label htmlFor="unit">Đơn vị</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              unit: value as ServiceUnit,
                            })
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

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form
                          if (service) {
                            setFormData({
                              name: service.name,
                              unit: service.unit,
                              rental_type: service.rental_type,
                              unit_price: service.unit_price,
                              current_stock: service.current_stock ?? 0,
                              min_stock_threshold: service.min_stock_threshold ?? 10,
                              status: service.status ?? "Available",
                            });
                          }
                        }}
                        disabled={isSaving}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Loại dịch vụ
                        </Label>
                        <p className="font-medium mt-1">
                          <Badge variant="outline">{service.rental_type}</Badge>
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Đơn vị</Label>
                        <p className="font-medium mt-1">{service.unit}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Chi nhánh</Label>
                      <p className="font-medium mt-1">{service.branch_name}</p>
                    </div>

                    <Separator />

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Chỉnh sửa thông tin
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Giá & Tồn kho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">
                        Giá (VNĐ/{formData.unit})
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_stock">Tồn kho hiện tại</Label>
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
                          Ngưỡng cảnh báo
                        </Label>
                        <Input
                          id="min_stock_threshold"
                          type="number"
                          min="0"
                          value={formData.min_stock_threshold}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              min_stock_threshold:
                                parseInt(e.target.value) || 0,
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
                          setFormData({
                            ...formData,
                            status: value as ServiceStatus,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Hoạt động</SelectItem>
                          <SelectItem value="Unavailable">
                            Không hoạt động
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          if (service) {
                            setFormData({
                              name: service.name,
                              unit: service.unit,
                              rental_type: service.rental_type,
                              unit_price: service.unit_price,
                              current_stock: service.current_stock ?? 0,
                              min_stock_threshold: service.min_stock_threshold ?? 10,
                              status: service.status ?? "Available",
                            });
                          }
                        }}
                        disabled={isSaving}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Giá</Label>
                      <p className="text-2xl font-bold">
                        {formatPrice(service.unit_price)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          / {service.unit}
                        </span>
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Tồn kho hiện tại
                        </Label>
                        <p className="text-xl font-semibold mt-1">
                          {service.current_stock}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Ngưỡng cảnh báo
                        </Label>
                        <p className="text-xl font-semibold mt-1">
                          {service.min_stock_threshold}
                        </p>
                      </div>
                    </div>

                    {lowStock && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                              Cảnh báo tồn kho thấp
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              Số lượng hiện tại ({service.current_stock}) đã
                              thấp hơn ngưỡng cảnh báo (
                              {service.min_stock_threshold}). Vui lòng bổ sung
                              thêm.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-muted-foreground">
                        Trạng thái
                      </Label>
                      <p className="mt-1">
                        <Badge
                          variant={
                            service.status === "Available"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            service.status === "Available"
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                        >
                          {service.status === "Available"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </p>
                    </div>

                    <Separator />

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Chỉnh sửa giá & tồn kho
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
