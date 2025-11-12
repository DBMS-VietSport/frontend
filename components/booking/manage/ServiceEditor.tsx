"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus, Trash2, ImageIcon } from "lucide-react";
import {
  mockServices,
  mockBranchServices,
  mockEmployees,
} from "@/lib/booking/mockRepo";
import type { ServiceBookingItemDetail } from "@/lib/booking/types";
import { formatVND } from "@/lib/booking/pricing";

// Generate time options for Select (6:00 - 22:30, every 30 minutes)
const generateTimeOptions = () => {
  const options: Array<{
    value: string;
    label: string;
    hours: number;
    minutes: number;
  }> = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const timeStr = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
      options.push({
        value: timeStr,
        label: timeStr,
        hours: h,
        minutes: m,
      });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

interface ServiceItemEdit {
  id?: number; // existing item ID
  branch_service_id: number;
  quantity: number;
  start_time: string;
  end_time: string;
  trainer_ids?: number[];
}

interface ServiceEditorProps {
  branchId: number;
  initialItems: ServiceBookingItemDetail[];
  defaultStartTime: string;
  defaultEndTime: string;
  onChange: (items: ServiceItemEdit[], removedIds: number[]) => void;
}

export function ServiceEditor({
  branchId,
  initialItems,
  defaultStartTime,
  defaultEndTime,
  onChange,
}: ServiceEditorProps) {
  const [items, setItems] = React.useState<ServiceItemEdit[]>(
    initialItems.map((item) => ({
      id: item.id,
      branch_service_id: item.branch_service_id,
      quantity: item.quantity,
      start_time: item.start_time,
      end_time: item.end_time,
      trainer_ids: item.trainer_ids,
    }))
  );
  const [removedIds, setRemovedIds] = React.useState<number[]>([]);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = React.useState(false);
  const [selectedBranchServiceId, setSelectedBranchServiceId] =
    React.useState<string>("");

  // Helper function to get service info (moved before useMemo hooks)
  const getServiceInfo = React.useCallback((branchServiceId: number) => {
    const branchService = mockBranchServices.find(
      (bs) => bs.id === branchServiceId
    );
    const service = branchService
      ? mockServices.find((s) => s.id === branchService.service_id)
      : null;
    return { branchService, service };
  }, []);

  // Get branch services for this branch
  const availableBranchServices = React.useMemo(() => {
    return mockBranchServices.filter((bs) => bs.branch_id === branchId);
  }, [branchId]);

  // Get services that are not yet added
  const availableServicesToAdd = React.useMemo(() => {
    const addedBranchServiceIds = new Set(
      items.map((item) => item.branch_service_id)
    );
    return availableBranchServices.filter(
      (bs) => !addedBranchServiceIds.has(bs.id)
    );
  }, [availableBranchServices, items]);

  // Group items by rental_type
  const itemsByRentalType = React.useMemo(() => {
    const grouped: Record<
      string,
      Array<{ item: ServiceItemEdit; index: number }>
    > = {
      "Nhân sự": [],
      "Dụng cụ": [],
      "Tiện ích": [],
    };

    items.forEach((item, index) => {
      const { service } = getServiceInfo(item.branch_service_id);
      if (service) {
        const type = service.rental_type;
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push({ item, index });
      }
    });

    return grouped;
  }, [items, getServiceInfo]);

  // Notify parent of changes
  React.useEffect(() => {
    onChange(items, removedIds);
  }, [items, removedIds, onChange]);

  const handleAddItem = () => {
    if (!selectedBranchServiceId) return;

    const branchServiceId = parseInt(selectedBranchServiceId);
    setItems([
      ...items,
      {
        branch_service_id: branchServiceId,
        quantity: 1,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      },
    ]);
    setSelectedBranchServiceId("");
    setAddServiceDialogOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    const item = items[index];
    if (item.id) {
      setRemovedIds([...removedIds, item.id]);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ServiceItemEdit,
    value: any
  ) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, delta: number) => {
    const item = items[index];
    const newQuantity = Math.max(1, item.quantity + delta);
    handleItemChange(index, "quantity", newQuantity);
  };

  const handleTimeChange = (
    index: number,
    field: "start_time" | "end_time",
    hours: number,
    minutes: number
  ) => {
    const item = items[index];
    const baseDate = new Date(item[field]);
    baseDate.setHours(hours, minutes, 0, 0);
    handleItemChange(index, field, baseDate.toISOString());
  };

  const calculateItemTotal = (item: ServiceItemEdit): number => {
    const { branchService, service } = getServiceInfo(item.branch_service_id);
    if (!branchService || !service) return 0;

    if (service.unit === "Giờ") {
      const start = new Date(item.start_time);
      const end = new Date(item.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return branchService.unit_price * item.quantity * hours;
    }

    return branchService.unit_price * item.quantity;
  };

  const getServiceImageUrl = (serviceName: string): string | null => {
    // Map service names to image URLs (if available)
    const imageMap: Record<string, string> = {
      "Thuê bóng cầu lông": "/badminton-racket.jpg",
      "Thuê vợt cầu lông": "/badminton-racket.jpg",
      "Thuê bóng Futsal": "/soccer-ball.jpg",
      "Nước suối": "/revive.jpg",
      "Thuê tủ đồ": "/locker.jpg",
    };
    return imageMap[serviceName] || null;
  };

  if (availableBranchServices.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Không có dịch vụ nào khả dụng cho chi nhánh này
        </div>
      </Card>
    );
  }

  const hasItems = items.length > 0;
  const rentalTypes = ["Nhân sự", "Dụng cụ", "Tiện ích"] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Dịch vụ bổ sung</Label>
        <Dialog
          open={addServiceDialogOpen}
          onOpenChange={setAddServiceDialogOpen}
        >
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm dịch vụ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm dịch vụ</DialogTitle>
              <DialogDescription>
                Chọn dịch vụ bạn muốn thêm vào booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dịch vụ</Label>
                <Select
                  value={selectedBranchServiceId}
                  onValueChange={setSelectedBranchServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServicesToAdd.map((bs) => {
                      const svc = mockServices.find(
                        (s) => s.id === bs.service_id
                      );
                      return (
                        <SelectItem key={bs.id} value={bs.id.toString()}>
                          {svc?.name} - {formatVND(bs.unit_price)}/{svc?.unit}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddServiceDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={!selectedBranchServiceId}
                >
                  Thêm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hasItems ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Chưa có dịch vụ nào. Nhấn &quot;Thêm dịch vụ&quot; để bắt đầu.
          </div>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={rentalTypes.filter(
            (type) => itemsByRentalType[type].length > 0
          )}
        >
          {rentalTypes.map((rentalType) => {
            const typeItems = itemsByRentalType[rentalType];
            if (typeItems.length === 0) return null;

            return (
              <AccordionItem key={rentalType} value={rentalType}>
                <AccordionTrigger className="text-xl font-bold">
                  {rentalType === "Nhân sự"
                    ? "Thuê nhân sự"
                    : rentalType === "Dụng cụ"
                    ? "Thuê dụng cụ"
                    : "Thuê tiện ích"}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {typeItems.map(({ item, index }) => {
                      const { branchService, service } = getServiceInfo(
                        item.branch_service_id
                      );
                      if (!branchService || !service) return null;

                      const imageUrl = getServiceImageUrl(service.name);
                      const itemTotal = calculateItemTotal(item);
                      const isHourBased = service.unit === "Giờ";

                      const getStartTimeValue = () => {
                        const date = new Date(item.start_time);
                        return `${date
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`;
                      };

                      const getEndTimeValue = () => {
                        const date = new Date(item.end_time);
                        return `${date
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${date
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`;
                      };

                      return (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="shrink-0">
                                {imageUrl ? (
                                  <div className="size-24 rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={imageUrl}
                                      alt={service.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="size-24 rounded-lg bg-muted flex items-center justify-center">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">
                                      {service.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-lg font-bold text-primary">
                                        {formatVND(branchService.unit_price)}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        / {service.unit}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(index)}
                                    className="shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>

                                {/* Quantity Controls */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      Số lượng:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          handleQuantityChange(index, -1)
                                        }
                                        disabled={item.quantity <= 1}
                                        className="size-8"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="text-base font-semibold w-12 text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          handleQuantityChange(index, 1)
                                        }
                                        className="size-8"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Time Controls for Hour-based Services */}
                                {isHourBased && (
                                  <div className="space-y-2 pt-2 border-t">
                                    <Label className="text-xs text-muted-foreground">
                                      Thời gian sử dụng
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label className="text-xs">
                                          Giờ bắt đầu
                                        </Label>
                                        <Select
                                          value={getStartTimeValue()}
                                          onValueChange={(value) => {
                                            const option = timeOptions.find(
                                              (opt) => opt.value === value
                                            );
                                            if (option) {
                                              handleTimeChange(
                                                index,
                                                "start_time",
                                                option.hours,
                                                option.minutes
                                              );
                                            }
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {timeOptions.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs">
                                          Giờ kết thúc
                                        </Label>
                                        <Select
                                          value={getEndTimeValue()}
                                          onValueChange={(value) => {
                                            const option = timeOptions.find(
                                              (opt) => opt.value === value
                                            );
                                            if (option) {
                                              handleTimeChange(
                                                index,
                                                "end_time",
                                                option.hours,
                                                option.minutes
                                              );
                                            }
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {timeOptions.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Trainer Selector for Personnel Services */}
                                {service.rental_type === "Nhân sự" && (
                                  <div className="space-y-2 pt-2 border-t">
                                    <Label className="text-xs text-muted-foreground">
                                      Người thực hiện (tùy chọn)
                                    </Label>
                                    <Select
                                      value={
                                        item.trainer_ids?.[0]?.toString() ||
                                        "none"
                                      }
                                      onValueChange={(value) =>
                                        handleItemChange(
                                          index,
                                          "trainer_ids",
                                          value === "none"
                                            ? undefined
                                            : [parseInt(value)]
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhân viên" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">
                                          Không chỉ định
                                        </SelectItem>
                                        {mockEmployees.map((emp) => (
                                          <SelectItem
                                            key={emp.id}
                                            value={emp.id.toString()}
                                          >
                                            {emp.full_name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Total */}
                                <div className="pt-2 border-t">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Tổng:
                                    </span>
                                    <span className="text-base font-bold text-primary">
                                      {formatVND(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
