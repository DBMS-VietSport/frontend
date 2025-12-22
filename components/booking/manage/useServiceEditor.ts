"use client";

import * as React from "react";
import {
  mockServices,
  mockBranchServices,
} from "@/lib/booking/mockRepo";
import type { ServiceBookingItemDetail, Invoice } from "@/lib/types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ServiceItemEdit {
  id?: number;
  service_booking_id?: number;
  branch_service_id: number;
  quantity: number;
  start_time: string;
  end_time: string;
  trainer_ids?: number[];
}

export interface UseServiceEditorProps {
  branchId: number;
  initialItems: ServiceBookingItemDetail[];
  defaultStartTime: string;
  defaultEndTime: string;
  invoices?: Invoice[];
  onChange: (items: ServiceItemEdit[], removedIds: number[]) => void;
}

// -----------------------------------------------------------------------------
// Time Options Generator
// -----------------------------------------------------------------------------

export const generateTimeOptions = () => {
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

export const timeOptions = generateTimeOptions();

// -----------------------------------------------------------------------------
// Service Info Helper
// -----------------------------------------------------------------------------

export const getServiceInfo = (branchServiceId: number) => {
  const branchService = mockBranchServices.find(
    (bs) => bs.id === branchServiceId
  );
  const service = branchService
    ? mockServices.find((s) => s.id === branchService.service_id)
    : null;
  return { branchService, service };
};

// -----------------------------------------------------------------------------
// Custom Hook: useServiceEditor
// -----------------------------------------------------------------------------

export function useServiceEditor({
  branchId,
  initialItems,
  defaultStartTime,
  defaultEndTime,
  invoices = [],
  onChange,
}: UseServiceEditorProps) {
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
  const [removedVoucherIds, setRemovedVoucherIds] = React.useState<number[]>([]);
  const [lockedVoucherIds, setLockedVoucherIds] = React.useState<number[]>([]);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = React.useState(false);
  const [selectedBranchServiceId, setSelectedBranchServiceId] = React.useState<string>("");

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
      if (voucherId <= 0) return false;
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
      if (
        item.service_booking_id &&
        removedVoucherIds.includes(item.service_booking_id)
      ) {
        return;
      }

      const voucherId = item.service_booking_id || 0;
      if (!grouped[voucherId]) {
        grouped[voucherId] = [];
      }
      grouped[voucherId].push({ item, index });
    });

    return grouped;
  }, [items, removedVoucherIds]);

  // Notify parent of changes
  React.useEffect(() => {
    const activeItems = items.filter(
      (item) =>
        !item.service_booking_id ||
        !removedVoucherIds.includes(item.service_booking_id)
    );
    onChange(activeItems, removedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, removedIds, removedVoucherIds]);

  // Calculate item total
  const calculateItemTotal = React.useCallback((item: ServiceItemEdit): number => {
    const { branchService, service } = getServiceInfo(item.branch_service_id);
    if (!branchService || !service) return 0;

    if (service.unit === "Giờ") {
      const start = new Date(item.start_time);
      const end = new Date(item.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return branchService.unit_price * item.quantity * hours;
    }

    return branchService.unit_price * item.quantity;
  }, []);

  // Handlers
  const handleAddItemToTempVoucher = React.useCallback(() => {
    if (!selectedBranchServiceId) return;

    const branchServiceId = parseInt(selectedBranchServiceId);
    setTempVoucherItems((prev) => [
      ...prev,
      {
        branch_service_id: branchServiceId,
        quantity: 1,
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      },
    ]);
    setSelectedBranchServiceId("");
  }, [selectedBranchServiceId, defaultStartTime, defaultEndTime]);

  const handleRemoveItemFromTempVoucher = React.useCallback((index: number) => {
    setTempVoucherItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateTempItemQuantity = React.useCallback((index: number, delta: number) => {
    setTempVoucherItems((prev) => {
      const newItems = [...prev];
      newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
      return newItems;
    });
  }, []);

  const handleConfirmAddVoucher = React.useCallback(() => {
    if (tempVoucherItems.length === 0) return;

    const newVoucherId = nextVoucherIdRef.current;
    nextVoucherIdRef.current -= 1;

    const itemsWithVoucherId = tempVoucherItems.map((item) => ({
      ...item,
      service_booking_id: newVoucherId,
    }));

    setItems((prev) => [...prev, ...itemsWithVoucherId]);
    setLockedVoucherIds((prev) => [...prev, newVoucherId]);
    setTempVoucherItems([]);
    setSelectedBranchServiceId("");
    setAddServiceDialogOpen(false);
  }, [tempVoucherItems]);

  const handleCancelAddVoucher = React.useCallback(() => {
    setTempVoucherItems([]);
    setSelectedBranchServiceId("");
    setAddServiceDialogOpen(false);
  }, []);

  const handleRemoveItem = React.useCallback((index: number) => {
    const item = items[index];
    if (item.id) {
      setRemovedIds((prev) => [...prev, item.id!]);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, [items]);

  const handleRemoveVoucher = React.useCallback((voucherId: number) => {
    if (isVoucherLocked(voucherId)) {
      return;
    }

    const voucherItems = items.filter(
      (item) => item.service_booking_id === voucherId
    );

    const itemIdsToRemove = voucherItems
      .map((item) => item.id)
      .filter((id): id is number => id !== undefined);

    if (itemIdsToRemove.length > 0) {
      setRemovedIds((prev) => [...prev, ...itemIdsToRemove]);
    }

    setItems((prev) => prev.filter((item) => item.service_booking_id !== voucherId));

    if (voucherId > 0) {
      setRemovedVoucherIds((prev) => [...prev, voucherId]);
    }
  }, [items, isVoucherLocked]);

  const handleItemChange = React.useCallback((
    index: number,
    field: keyof ServiceItemEdit,
    value: unknown
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = newItems[index];
      newItems[index] = { ...item, [field]: value };
      return newItems;
    });
  }, []);

  const handleQuantityChange = React.useCallback((index: number, delta: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = newItems[index];
      const newQuantity = Math.max(1, item.quantity + delta);
      newItems[index] = { ...item, quantity: newQuantity };
      return newItems;
    });
  }, []);

  const handleTimeChange = React.useCallback((
    index: number,
    field: "start_time" | "end_time",
    hours: number,
    minutes: number
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = newItems[index];
      const baseDate = new Date(item[field]);
      baseDate.setHours(hours, minutes, 0, 0);
      newItems[index] = { ...item, [field]: baseDate.toISOString() };
      return newItems;
    });
  }, []);

  const handleDialogOpenChange = React.useCallback((open: boolean) => {
    setAddServiceDialogOpen(open);
    if (!open) {
      setTempVoucherItems([]);
      setSelectedBranchServiceId("");
    }
  }, []);

  // Derived state
  const voucherIds = Object.keys(itemsByVoucher)
    .map(Number)
    .sort((a, b) => b - a);
  const hasItems = voucherIds.length > 0;

  return {
    // State
    items,
    tempVoucherItems,
    removedIds,
    addServiceDialogOpen,
    selectedBranchServiceId,
    availableBranchServices,
    availableServicesToAdd,
    itemsByVoucher,
    voucherIds,
    hasItems,
    
    // Setters
    setSelectedBranchServiceId,
    
    // Computed
    isVoucherPaid,
    isVoucherLocked,
    calculateItemTotal,
    
    // Handlers
    handleAddItemToTempVoucher,
    handleRemoveItemFromTempVoucher,
    handleUpdateTempItemQuantity,
    handleConfirmAddVoucher,
    handleCancelAddVoucher,
    handleRemoveItem,
    handleRemoveVoucher,
    handleItemChange,
    handleQuantityChange,
    handleTimeChange,
    handleDialogOpenChange,
  };
}
