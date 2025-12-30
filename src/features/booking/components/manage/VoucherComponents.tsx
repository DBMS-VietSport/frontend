"use client";

import * as React from "react";
import { Card, CardContent } from "@/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { Plus, Minus, Trash2 } from "lucide-react";
import { mockEmployees } from "@/features/booking/mock/mockRepo";
import { formatVND } from "@/features/booking/utils/pricing";
import { StatusBadge } from "@/components/StatusBadge";
import {
  timeOptions,
  type ServiceItemEdit,
} from "./useServiceEditor";
import { QuantityControl } from "./ServiceEditorComponents";

// -----------------------------------------------------------------------------
// VoucherList Component
// -----------------------------------------------------------------------------

interface VoucherListProps {
  voucherIds: number[];
  itemsByVoucher: Record<number, Array<{ item: ServiceItemEdit; index: number }>>;
  isVoucherPaid: (id: number) => boolean;
  isVoucherLocked: (id: number) => boolean;
  calculateItemTotal: (item: ServiceItemEdit) => number;
  onRemoveVoucher: (id: number) => void;
  onQuantityChange: (index: number, delta: number) => void;
  onTimeChange: (index: number, field: "start_time" | "end_time", hours: number, minutes: number) => void;
  onItemChange: (index: number, field: keyof ServiceItemEdit, value: unknown) => void;
  getServiceInfo: (branchServiceId: number) => { branchService: any; service: any };
}

export function VoucherList({
  voucherIds,
  itemsByVoucher,
  isVoucherPaid,
  isVoucherLocked,
  calculateItemTotal,
  onRemoveVoucher,
  onQuantityChange,
  onTimeChange,
  onItemChange,
  getServiceInfo,
}: VoucherListProps) {
  return (
    <Accordion type="multiple" defaultValue={voucherIds.map(String)}>
      {voucherIds.map((voucherId) => {
        const voucherItems = itemsByVoucher[voucherId];
        if (!voucherItems || voucherItems.length === 0) return null;

        const voucherTotal = voucherItems.reduce(
          (sum, { item }) => sum + calculateItemTotal(item),
          0
        );

        return (
          <VoucherAccordionItem
            key={voucherId}
            voucherId={voucherId}
            voucherItems={voucherItems}
            voucherTotal={voucherTotal}
            isVoucherPaid={isVoucherPaid}
            isVoucherLocked={isVoucherLocked}
            calculateItemTotal={calculateItemTotal}
            onRemoveVoucher={onRemoveVoucher}
            onQuantityChange={onQuantityChange}
            onTimeChange={onTimeChange}
            onItemChange={onItemChange}
            getServiceInfo={getServiceInfo}
          />
        );
      })}
    </Accordion>
  );
}

// -----------------------------------------------------------------------------
// VoucherAccordionItem Component
// -----------------------------------------------------------------------------

interface VoucherAccordionItemProps {
  voucherId: number;
  voucherItems: Array<{ item: ServiceItemEdit; index: number }>;
  voucherTotal: number;
  isVoucherPaid: (id: number) => boolean;
  isVoucherLocked: (id: number) => boolean;
  calculateItemTotal: (item: ServiceItemEdit) => number;
  onRemoveVoucher: (id: number) => void;
  onQuantityChange: (index: number, delta: number) => void;
  onTimeChange: (index: number, field: "start_time" | "end_time", hours: number, minutes: number) => void;
  onItemChange: (index: number, field: keyof ServiceItemEdit, value: unknown) => void;
  getServiceInfo: (branchServiceId: number) => { branchService: any; service: any };
}

function VoucherAccordionItem({
  voucherId,
  voucherItems,
  voucherTotal,
  isVoucherPaid,
  isVoucherLocked,
  calculateItemTotal,
  onRemoveVoucher,
  onQuantityChange,
  onTimeChange,
  onItemChange,
  getServiceInfo,
}: VoucherAccordionItemProps) {
  const isPaid = isVoucherPaid(voucherId);
  const isLocked = isVoucherLocked(voucherId);

  return (
    <AccordionItem value={String(voucherId)}>
      <div className="flex items-center border-b">
        <AccordionTrigger className="flex-1 hover:no-underline">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">
              Phiếu dịch vụ #{Math.abs(voucherId)}
            </span>
            {isPaid && (
              <StatusBadge status="Paid" category="payment" />
            )}
            {!isPaid && isLocked && (
              <StatusBadge status="Confirmed" category="booking" />
            )}
          </div>
        </AccordionTrigger>
        {!isLocked && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveVoucher(voucherId)}
            className="text-destructive hover:text-destructive mr-2"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hủy phiếu
          </Button>
        )}
      </div>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          {voucherItems.map(({ item, index }) => (
            <VoucherServiceItem
              key={index}
              item={item}
              index={index}
              voucherId={voucherId}
              isLocked={isLocked}
              itemTotal={calculateItemTotal(item)}
              onQuantityChange={onQuantityChange}
              onTimeChange={onTimeChange}
              onItemChange={onItemChange}
              getServiceInfo={getServiceInfo}
            />
          ))}

          {/* Voucher Total */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Tổng phiếu:</span>
              <span className="text-lg font-bold text-primary">
                {formatVND(voucherTotal)}
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// -----------------------------------------------------------------------------
// VoucherServiceItem Component
// -----------------------------------------------------------------------------

interface VoucherServiceItemProps {
  item: ServiceItemEdit;
  index: number;
  voucherId: number;
  isLocked: boolean;
  itemTotal: number;
  onQuantityChange: (index: number, delta: number) => void;
  onTimeChange: (index: number, field: "start_time" | "end_time", hours: number, minutes: number) => void;
  onItemChange: (index: number, field: keyof ServiceItemEdit, value: unknown) => void;
  getServiceInfo: (branchServiceId: number) => { branchService: any; service: any };
}

function VoucherServiceItem({
  item,
  index,
  voucherId,
  isLocked,
  itemTotal,
  onQuantityChange,
  onTimeChange,
  onItemChange,
  getServiceInfo,
}: VoucherServiceItemProps) {
  const { branchService, service } = getServiceInfo(item.branch_service_id);
  if (!branchService || !service) return null;

  const isHourBased = service.unit === "Giờ";
  const isExistingVoucher = voucherId > 0;

  const getTimeValue = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Service Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-base">{service.name}</h4>
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
                Số lượng: <span className="font-semibold">{item.quantity}</span>
              </div>
              <div className="text-sm font-bold text-primary mt-1">
                {formatVND(itemTotal)}
              </div>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Số lượng:</span>
            {isExistingVoucher || isLocked ? (
              <span className="text-base font-semibold">{item.quantity}</span>
            ) : (
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => onQuantityChange(index, 1)}
                onDecrease={() => onQuantityChange(index, -1)}
              />
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
                  {getTimeValue(item.start_time)} - {getTimeValue(item.end_time)}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Giờ bắt đầu</Label>
                    <Select
                      value={getTimeValue(item.start_time)}
                      onValueChange={(value) => {
                        const option = timeOptions.find((opt) => opt.value === value);
                        if (option) {
                          onTimeChange(index, "start_time", option.hours, option.minutes);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Giờ kết thúc</Label>
                    <Select
                      value={getTimeValue(item.end_time)}
                      onValueChange={(value) => {
                        const option = timeOptions.find((opt) => opt.value === value);
                        if (option) {
                          onTimeChange(index, "end_time", option.hours, option.minutes);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                    ? mockEmployees.find((e) => e.id === item.trainer_ids?.[0])?.full_name ||
                    "Không chỉ định"
                    : "Không chỉ định"}
                </div>
              ) : (
                <Select
                  value={item.trainer_ids?.[0]?.toString() || "none"}
                  onValueChange={(value) =>
                    onItemChange(
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
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
