"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import type { ServiceBookingItemDetail, Invoice } from "@/lib/booking/types";
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
  service_booking_id?: number; // voucher ID (negative for new vouchers)
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
  invoices?: Invoice[];
  onChange: (items: ServiceItemEdit[], removedIds: number[]) => void;
  // Props for redirect to services page
  bookingId?: number;
  customerId?: number;
}

export function ServiceEditor({
  branchId,
  initialItems,
  defaultStartTime,
  defaultEndTime,
  invoices = [],
  onChange,
  bookingId,
  customerId,
}: ServiceEditorProps) {
  const router = useRouter();
  // Track next temporary voucher ID (negative numbers for new vouchers)
  const nextVoucherIdRef = React.useRef<number>(-1);

  // Track items being added in the dialog (temporary items for new voucher)
  const [tempVoucherItems, setTempVoucherItems] = React.useState<
    ServiceItemEdit[]
  >([]);

  const [items, setItems] = React.useState<ServiceItemEdit[]>(
    initialItems.map((item) => ({
      id: item.id,
      service_booking_id: item.service_booking_id,
      branch_service_id: item.branch_service_id,
      quantity: item.quantity,
      start_time: item.start_time,
      end_time: item.end_time,
      trainer_ids: item.trainer_ids,
    }))
  );
  const [removedIds, setRemovedIds] = React.useState<number[]>([]);
  const [removedVoucherIds, setRemovedVoucherIds] = React.useState<number[]>(
    []
  );
  // Track vouchers that have been confirmed (locked from editing)
  const [lockedVoucherIds, setLockedVoucherIds] = React.useState<number[]>([]);
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

  // Get services that are not yet added (in current voucher being created)
  const availableServicesToAdd = React.useMemo(() => {
    const addedBranchServiceIds = new Set(
      tempVoucherItems.map((item) => item.branch_service_id)
    );
    return availableBranchServices.filter(
      (bs) => !addedBranchServiceIds.has(bs.id)
    );
  }, [availableBranchServices, tempVoucherItems]);

  // Check if a voucher is paid (locked)
  const isVoucherPaid = React.useCallback(
    (voucherId: number): boolean => {
      if (voucherId <= 0) return false; // New vouchers are not paid
      return invoices.some(
        (inv) => inv.service_booking_id === voucherId && inv.status === "Paid"
      );
    },
    [invoices]
  );

  // Check if a voucher is locked (confirmed or paid)
  const isVoucherLocked = React.useCallback(
    (voucherId: number): boolean => {
      return isVoucherPaid(voucherId) || lockedVoucherIds.includes(voucherId);
    },
    [isVoucherPaid, lockedVoucherIds]
  );

  // Group items by service_booking_id (voucher)
  const itemsByVoucher = React.useMemo(() => {
    const grouped: Record<
      number,
      Array<{ item: ServiceItemEdit; index: number }>
    > = {};

    items.forEach((item, index) => {
      // Skip items that belong to removed vouchers
      if (
        item.service_booking_id &&
        removedVoucherIds.includes(item.service_booking_id)
      ) {
        return;
      }

      const voucherId = item.service_booking_id || 0; // Use 0 for items without voucher
      if (!grouped[voucherId]) {
        grouped[voucherId] = [];
      }
      grouped[voucherId].push({ item, index });
    });

    return grouped;
  }, [items, removedVoucherIds]);

  // Notify parent of changes
  React.useEffect(() => {
    // Filter out items from removed vouchers
    const activeItems = items.filter(
      (item) =>
        !item.service_booking_id ||
        !removedVoucherIds.includes(item.service_booking_id)
    );
    onChange(activeItems, removedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, removedIds, removedVoucherIds]);

  const handleAddItemToTempVoucher = () => {
    if (!selectedBranchServiceId) return;

    const branchServiceId = parseInt(selectedBranchServiceId);
    setTempVoucherItems([
      ...tempVoucherItems,
      {
        branch_service_id: branchServiceId,
        quantity: 1,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      },
    ]);
    setSelectedBranchServiceId("");
  };

  const handleRemoveItemFromTempVoucher = (index: number) => {
    setTempVoucherItems(tempVoucherItems.filter((_, i) => i !== index));
  };

  const handleUpdateTempItemQuantity = (index: number, delta: number) => {
    const newItems = [...tempVoucherItems];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setTempVoucherItems(newItems);
  };

  const handleConfirmAddVoucher = () => {
    if (tempVoucherItems.length === 0) return;

    // Create a new voucher for all items
    const newVoucherId = nextVoucherIdRef.current;
    nextVoucherIdRef.current -= 1; // Decrement for next new voucher

    // Add all temp items to the main items list with the same voucher ID
    const itemsWithVoucherId = tempVoucherItems.map((item) => ({
      ...item,
      service_booking_id: newVoucherId,
    }));

    setItems([...items, ...itemsWithVoucherId]);
    // Lock the voucher after confirmation
    setLockedVoucherIds((prev) => [...prev, newVoucherId]);
    setTempVoucherItems([]);
    setSelectedBranchServiceId("");
    setAddServiceDialogOpen(false);
  };

  const handleCancelAddVoucher = () => {
    setTempVoucherItems([]);
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

  const handleRemoveVoucher = (voucherId: number) => {
    // Don't allow removing paid or locked vouchers
    if (isVoucherLocked(voucherId)) {
      return;
    }

    // Mark all items in this voucher for removal
    const voucherItems = items.filter(
      (item) => item.service_booking_id === voucherId
    );

    const itemIdsToRemove = voucherItems
      .map((item) => item.id)
      .filter((id): id is number => id !== undefined);

    if (itemIdsToRemove.length > 0) {
      setRemovedIds((prev) => [...prev, ...itemIdsToRemove]);
    }

    // Remove items from this voucher
    setItems(items.filter((item) => item.service_booking_id !== voucherId));

    // Track removed voucher (for existing vouchers)
    if (voucherId > 0) {
      setRemovedVoucherIds((prev) => [...prev, voucherId]);
    }
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

  const voucherIds = Object.keys(itemsByVoucher)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending (newest first)
  const hasItems = voucherIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Dịch vụ bổ sung</Label>
        {bookingId && customerId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              router.push(
                `/booking/services?bookingId=${bookingId}&customerId=${customerId}`
              );
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phiếu dịch vụ
          </Button>
        ) : (
          <Dialog
            open={addServiceDialogOpen}
            onOpenChange={(open) => {
              setAddServiceDialogOpen(open);
              if (!open) {
                // Reset temp items when dialog closes
                setTempVoucherItems([]);
                setSelectedBranchServiceId("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm phiếu dịch vụ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm phiếu dịch vụ</DialogTitle>
                <DialogDescription>
                  Thêm các dịch vụ vào phiếu mới. Bạn có thể thêm nhiều dịch vụ
                  trước khi xác nhận.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Add service section */}
                <div className="space-y-2">
                  <Label>Chọn dịch vụ</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedBranchServiceId}
                      onValueChange={setSelectedBranchServiceId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServicesToAdd.map((bs) => {
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
                    <Button
                      onClick={handleAddItemToTempVoucher}
                      disabled={!selectedBranchServiceId}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm vào phiếu
                    </Button>
                  </div>
                </div>

                {/* List of items in temp voucher */}
                {tempVoucherItems.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <Label className="text-sm font-semibold">
                      Dịch vụ trong phiếu ({tempVoucherItems.length})
                    </Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {tempVoucherItems.map((item, index) => {
                        const { branchService, service } = getServiceInfo(
                          item.branch_service_id
                        );
                        if (!branchService || !service) return null;

                        const itemTotal = calculateItemTotal(item);

                        return (
                          <Card key={index} className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {service.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatVND(branchService.unit_price)}/
                                  {service.unit}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      handleUpdateTempItemQuantity(index, -1)
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      handleUpdateTempItemQuantity(index, 1)
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-sm font-semibold text-primary w-24 text-right">
                                  {formatVND(itemTotal)}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() =>
                                    handleRemoveItemFromTempVoucher(index)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-semibold">Tổng phiếu:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatVND(
                          tempVoucherItems.reduce(
                            (sum, item) => sum + calculateItemTotal(item),
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={handleCancelAddVoucher}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleConfirmAddVoucher}
                    disabled={tempVoucherItems.length === 0}
                  >
                    Xác nhận tạo phiếu
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!hasItems ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Chưa có phiếu dịch vụ nào. Nhấn &quot;Thêm phiếu dịch vụ&quot; để
            bắt đầu.
          </div>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={voucherIds.map(String)}>
          {voucherIds.map((voucherId) => {
            const voucherItems = itemsByVoucher[voucherId];
            if (!voucherItems || voucherItems.length === 0) return null;

            // Calculate voucher summary
            const voucherTotal = voucherItems.reduce((sum, { item }) => {
              return sum + calculateItemTotal(item);
            }, 0);

            return (
              <AccordionItem key={voucherId} value={String(voucherId)}>
                <div className="flex items-center border-b">
                  <AccordionTrigger className="flex-1 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold">
                        Phiếu dịch vụ #{Math.abs(voucherId)}
                      </span>
                      {isVoucherPaid(voucherId) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Đã thanh toán
                        </span>
                      )}
                      {!isVoucherPaid(voucherId) &&
                        isVoucherLocked(voucherId) && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Đã xác nhận
                          </span>
                        )}
                    </div>
                  </AccordionTrigger>
                  {!isVoucherLocked(voucherId) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVoucher(voucherId)}
                      className="text-destructive hover:text-destructive mr-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hủy phiếu
                    </Button>
                  )}
                </div>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {voucherItems.map(({ item, index }) => {
                      const { branchService, service } = getServiceInfo(
                        item.branch_service_id
                      );
                      if (!branchService || !service) return null;

                      const itemTotal = calculateItemTotal(item);
                      const isHourBased = service.unit === "Giờ";
                      const isLocked = isVoucherLocked(voucherId);
                      const isExistingVoucher = voucherId > 0;

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
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-base">
                                    {service.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-medium text-primary">
                                      {formatVND(branchService.unit_price)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      / {service.unit}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">
                                    Số lượng:{" "}
                                    <span className="font-semibold">
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold text-primary mt-1">
                                    {formatVND(itemTotal)}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm font-medium">
                                  Số lượng:
                                </span>
                                {isExistingVoucher ? (
                                  <span className="text-base font-semibold">
                                    {item.quantity}
                                  </span>
                                ) : (
                                  <>
                                    {isLocked ? (
                                      <span className="text-base font-semibold">
                                        {item.quantity}
                                      </span>
                                    ) : (
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
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Time Controls for Hour-based Services */}
                              {isHourBased && (
                                <div className="space-y-2 pt-2 border-t">
                                  <Label className="text-xs text-muted-foreground">
                                    Thời gian sử dụng
                                  </Label>
                                  {isLocked ? (
                                    <div className="text-sm">
                                      {getStartTimeValue()} -{" "}
                                      {getEndTimeValue()}
                                    </div>
                                  ) : (
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
                                  )}
                                </div>
                              )}

                              {/* Trainer Selector for Personnel Services */}
                              {service.rental_type === "Nhân sự" && (
                                <div className="space-y-2 pt-2 border-t">
                                  <Label className="text-xs text-muted-foreground">
                                    Người thực hiện (tùy chọn)
                                  </Label>
                                  {isLocked ? (
                                    <div className="text-sm text-muted-foreground">
                                      {item.trainer_ids?.[0]
                                        ? mockEmployees.find(
                                            (e) =>
                                              e.id === item.trainer_ids?.[0]
                                          )?.full_name || "Không chỉ định"
                                        : "Không chỉ định"}
                                    </div>
                                  ) : (
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
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Voucher Total */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          Tổng phiếu:
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {formatVND(voucherTotal)}
                        </span>
                      </div>
                    </div>
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
