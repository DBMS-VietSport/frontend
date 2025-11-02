"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  mockServices,
  mockBranchServices,
  mockEmployees,
} from "@/lib/booking/mockRepo";
import type { ServiceBookingItemDetail } from "@/lib/booking/types";
import { formatVND } from "@/lib/booking/pricing";

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

  // Get branch services for this branch
  const availableBranchServices = React.useMemo(() => {
    return mockBranchServices.filter((bs) => bs.branch_id === branchId);
  }, [branchId]);

  // Notify parent of changes
  React.useEffect(() => {
    onChange(items, removedIds);
  }, [items, removedIds]);

  const handleAddItem = () => {
    if (availableBranchServices.length === 0) return;

    setItems([
      ...items,
      {
        branch_service_id: availableBranchServices[0].id,
        quantity: 1,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      },
    ]);
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

  const getServiceInfo = (branchServiceId: number) => {
    const branchService = mockBranchServices.find(
      (bs) => bs.id === branchServiceId
    );
    const service = branchService
      ? mockServices.find((s) => s.id === branchService.service_id)
      : null;
    return { branchService, service };
  };

  const formatTimeForInput = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5);
  };

  const handleTimeChange = (
    index: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    const item = items[index];
    const baseDate = new Date(item[field]);
    const [hours, minutes] = value.split(":").map(Number);
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

  if (availableBranchServices.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Không có dịch vụ nào khả dụng cho chi nhánh này
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Dịch vụ bổ sung</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Chưa có dịch vụ nào. Nhấn &quot;Thêm dịch vụ&quot; để bắt đầu.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const { branchService, service } = getServiceInfo(
              item.branch_service_id
            );

            return (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  {/* Service Selector */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Dịch vụ</Label>
                      <Select
                        value={item.branch_service_id.toString()}
                        onValueChange={(value) =>
                          handleItemChange(
                            index,
                            "branch_service_id",
                            parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBranchServices.map((bs) => {
                            const svc = mockServices.find(
                              (s) => s.id === bs.service_id
                            );
                            return (
                              <SelectItem key={bs.id} value={bs.id.toString()}>
                                {svc?.name} - {formatVND(bs.unit_price)}/
                                {svc?.unit}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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

                  {/* Quantity and Time */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Số lượng</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>

                    {service?.unit === "Giờ" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Giờ bắt đầu</Label>
                          <Input
                            type="time"
                            value={formatTimeForInput(item.start_time)}
                            onChange={(e) =>
                              handleTimeChange(
                                index,
                                "start_time",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Giờ kết thúc</Label>
                          <Input
                            type="time"
                            value={formatTimeForInput(item.end_time)}
                            onChange={(e) =>
                              handleTimeChange(
                                index,
                                "end_time",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Trainer selector for personnel services */}
                  {service?.rental_type === "Nhân sự" && (
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Người thực hiện (tùy chọn)
                      </Label>
                      <Select
                        value={item.trainer_ids?.[0]?.toString() || "none"}
                        onValueChange={(value) =>
                          handleItemChange(
                            index,
                            "trainer_ids",
                            value === "none" ? undefined : [parseInt(value)]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Không chỉ định</SelectItem>
                          {mockEmployees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Thành tiền
                    </span>
                    <span className="font-semibold">
                      {formatVND(calculateItemTotal(item))}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
