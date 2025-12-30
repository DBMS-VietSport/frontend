"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Plus } from "lucide-react";
import { mockServices } from "@/features/booking/mock/mockRepo";
import type { ServiceBookingItemDetail, Invoice } from "@/types";
import { formatVND } from "@/features/booking/utils/pricing";

// Import extracted hook and components
import {
  useServiceEditor,
  type ServiceItemEdit,
} from "./useServiceEditor";
import { TempServiceItemCard, EmptyServiceState } from "./ServiceEditorComponents";
import { VoucherList } from "./VoucherComponents";

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface ServiceEditorProps {
  branchId: number;
  initialItems: ServiceBookingItemDetail[];
  defaultStartTime: string;
  defaultEndTime: string;
  invoices?: Invoice[];
  onChange: (items: ServiceItemEdit[], removedIds: number[]) => void;
  bookingId?: number;
  customerId?: number;
}

// -----------------------------------------------------------------------------
// ServiceEditor Component (Refactored)
// -----------------------------------------------------------------------------

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

  // Use extracted hook for all state and logic
  const {
    tempVoucherItems,
    addServiceDialogOpen,
    selectedBranchServiceId,
    availableBranchServices,
    availableServicesToAdd,
    itemsByVoucher,
    voucherIds,
    hasItems,
    setSelectedBranchServiceId,
    isVoucherPaid,
    isVoucherLocked,
    calculateItemTotal,
    handleAddItemToTempVoucher,
    handleRemoveItemFromTempVoucher,
    handleUpdateTempItemQuantity,
    handleConfirmAddVoucher,
    handleCancelAddVoucher,
    handleRemoveVoucher,
    handleItemChange,
    handleQuantityChange,
    handleTimeChange,
    handleDialogOpenChange,
    getServiceInfo,
  } = useServiceEditor({
    branchId,
    initialItems,
    defaultStartTime,
    defaultEndTime,
    invoices,
    onChange,
  });

  // Early return if no services available
  if (availableBranchServices.length === 0) {
    return (
      <EmptyServiceState message="Không có dịch vụ nào khả dụng cho chi nhánh này" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
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
          <AddServiceDialog
            open={addServiceDialogOpen}
            onOpenChange={handleDialogOpenChange}
            availableServicesToAdd={availableServicesToAdd}
            selectedBranchServiceId={selectedBranchServiceId}
            setSelectedBranchServiceId={setSelectedBranchServiceId}
            tempVoucherItems={tempVoucherItems}
            calculateItemTotal={calculateItemTotal}
            onAddItem={handleAddItemToTempVoucher}
            onRemoveItem={handleRemoveItemFromTempVoucher}
            onUpdateQuantity={handleUpdateTempItemQuantity}
            onConfirm={handleConfirmAddVoucher}
            onCancel={handleCancelAddVoucher}
            getServiceInfo={getServiceInfo}
          />
        )}
      </div>

      {/* Empty State or Voucher List */}
      {!hasItems ? (
        <EmptyServiceState message='Chưa có phiếu dịch vụ nào. Nhấn "Thêm phiếu dịch vụ" để bắt đầu.' />
      ) : (
        <VoucherList
          voucherIds={voucherIds}
          itemsByVoucher={itemsByVoucher}
          isVoucherPaid={isVoucherPaid}
          isVoucherLocked={isVoucherLocked}
          calculateItemTotal={calculateItemTotal}
          onRemoveVoucher={handleRemoveVoucher}
          onQuantityChange={handleQuantityChange}
          onTimeChange={handleTimeChange}
          onItemChange={handleItemChange}
          getServiceInfo={getServiceInfo}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// AddServiceDialog Sub-component
// -----------------------------------------------------------------------------

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableServicesToAdd: any[]; // Using any[] for now as types are being aligned
  selectedBranchServiceId: string;
  setSelectedBranchServiceId: (id: string) => void;
  tempVoucherItems: ServiceItemEdit[];
  calculateItemTotal: (item: ServiceItemEdit) => number;
  getServiceInfo: (branchServiceId: number) => { branchService: any; service: any };
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function AddServiceDialog({
  open,
  onOpenChange,
  availableServicesToAdd,
  selectedBranchServiceId,
  setSelectedBranchServiceId,
  tempVoucherItems,
  calculateItemTotal,
  getServiceInfo,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onConfirm,
  onCancel,
}: AddServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            Thêm các dịch vụ vào phiếu mới. Bạn có thể thêm nhiều dịch vụ trước khi xác nhận.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Service Selector */}
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
                  {availableServicesToAdd.map((bs) => (
                    <SelectItem key={bs.id} value={bs.id.toString()}>
                      {bs.name} - {formatVND(bs.unit_price)}/{bs.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={onAddItem} disabled={!selectedBranchServiceId} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm vào phiếu
              </Button>
            </div>
          </div>

          {/* Temp Items List */}
          {tempVoucherItems.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-semibold">
                Dịch vụ trong phiếu ({tempVoucherItems.length})
              </Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tempVoucherItems.map((item, index) => (
                  <TempServiceItemCard
                    key={index}
                    item={item}
                    index={index}
                    itemTotal={calculateItemTotal(item)}
                    onQuantityChange={onUpdateQuantity}
                    onRemove={onRemoveItem}
                    getServiceInfo={getServiceInfo}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-semibold">Tổng phiếu:</span>
                <span className="text-lg font-bold text-primary">
                  {formatVND(
                    tempVoucherItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button onClick={onConfirm} disabled={tempVoucherItems.length === 0}>
              Xác nhận tạo phiếu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
