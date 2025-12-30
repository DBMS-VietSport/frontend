"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/ui/separator";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { ArrowLeft, AlertTriangle, Edit } from "lucide-react";
import type {
  ServiceDetail,
  ServiceRentalType,
  ServiceUnit,
  BranchServiceStatus,
  UpdateServicePayload,
  UpdateBranchServicePayload,
} from "@/features/services/types";
import { serviceRepo } from "@/mock";
import { formatPrice } from "@/features/services/selectors";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

const rentalTypes: ServiceRentalType[] = ["Dụng cụ", "Nhân sự", "Tiện ích"];
const serviceUnits: ServiceUnit[] = [
  "Lần",
  "Giờ",
  "Trận",
  "Tháng",
  "Lượt",
  "Chai",
];

export default function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const serviceId = parseInt(params.id);

  const [serviceDetail, setServiceDetail] =
    React.useState<ServiceDetail | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    name: "",
    unit: "Lần" as ServiceUnit,
    rental_type: "Dụng cụ" as ServiceRentalType,
    unit_price: 0,
    current_stock: 0,
    min_stock_threshold: 10,
    status: "Còn" as BranchServiceStatus,
  });

  React.useEffect(() => {
    loadServiceDetail();
  }, [serviceId]);

  React.useEffect(() => {
    if (serviceDetail) {
      setFormData({
        name: serviceDetail.service.name,
        unit: serviceDetail.service.unit,
        rental_type: serviceDetail.service.rental_type,
        unit_price: serviceDetail.branchService.unit_price,
        current_stock: serviceDetail.branchService.current_stock ?? 0,
        min_stock_threshold: serviceDetail.branchService.min_stock_threshold ?? 10,
        status: serviceDetail.branchService.status ?? "Còn",
      });
    }
  }, [serviceDetail]);

  const loadServiceDetail = async () => {
    setIsLoading(true);
    try {
      const data = await serviceRepo.getServiceById(serviceId);
      if (data) {
        setServiceDetail(data as ServiceDetail);
      } else {
        toast.error("Không tìm thấy dịch vụ");
        router.push("/services");
      }
    } catch (error) {
      logger.error("Failed to load service detail:", error);
      toast.error("Không thể tải thông tin dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceDetail) return;

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

      await serviceRepo.updateService(serviceDetail.service.id, servicePayload);
      await serviceRepo.updateBranchService(
        serviceDetail.branchService.id,
        branchServicePayload
      );

      toast.success("Cập nhật dịch vụ thành công");
      setIsEditing(false);
      await loadServiceDetail();
    } catch (error) {
      logger.error("Failed to update service:", error);
      toast.error("Không thể cập nhật dịch vụ");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!serviceDetail) {
    return null;
  }

  const { service, branchService, branch_name } = serviceDetail;
  const lowStock =
    (branchService.current_stock ?? 0) < (branchService.min_stock_threshold ?? 10);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/services")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {service.name}
            </h1>
            {lowStock && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cảnh báo tồn kho
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Chi tiết và chỉnh sửa thông tin dịch vụ
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Separator />

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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        onValueChange={(value: string) =>
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
                        onValueChange={(value: string) =>
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
                        setFormData({
                          name: service.name,
                          unit: service.unit,
                          rental_type: service.rental_type,
                          unit_price: branchService.unit_price,
                          current_stock: branchService.current_stock ?? 0,
                          min_stock_threshold:
                            branchService.min_stock_threshold ?? 10,
                          status: branchService.status ?? "Còn",
                        });
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
                    <p className="font-medium mt-1">{branch_name}</p>
                  </div>
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                      onValueChange={(value: string) =>
                        setFormData({
                          ...formData,
                          status: value as BranchServiceStatus,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Còn">Còn hàng</SelectItem>
                        <SelectItem value="Hết">Hết hàng</SelectItem>
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
                        setFormData({
                          name: service.name,
                          unit: service.unit,
                          rental_type: service.rental_type,
                          unit_price: branchService.unit_price,
                          current_stock: branchService.current_stock ?? 0,
                          min_stock_threshold:
                            branchService.min_stock_threshold ?? 10,
                          status: branchService.status ?? "Còn",
                        });
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
                      {formatPrice(branchService.unit_price)}
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
                        {branchService.current_stock}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Ngưỡng cảnh báo
                      </Label>
                      <p className="text-xl font-semibold mt-1">
                        {branchService.min_stock_threshold}
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
                            Số lượng hiện tại ({branchService.current_stock}) đã
                            thấp hơn ngưỡng cảnh báo (
                            {branchService.min_stock_threshold}). Vui lòng bổ
                            sung thêm.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-muted-foreground">Trạng thái</Label>
                    <p className="mt-1">
                      <Badge
                        variant={
                          branchService.status === "Còn"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          branchService.status === "Còn"
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                      >
                        {branchService.status === "Còn"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </Badge>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
