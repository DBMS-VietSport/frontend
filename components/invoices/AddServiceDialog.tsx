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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockServices, mockBranchServices } from "@/lib/booking/mockRepo";

export interface ServiceItem {
  branch_service_id: number;
  service_id: number;
  name: string;
  unit_price: number;
  quantity: number;
  unit: string;
}

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: number;
  existingServices: ServiceItem[];
  onAdd: (services: ServiceItem[]) => void;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  branchId,
  existingServices,
  onAdd,
}: AddServiceDialogProps) {
  const [selectedServices, setSelectedServices] = React.useState<
    Map<number, ServiceItem>
  >(new Map());

  // Get available services for this branch
  const availableServices = React.useMemo(() => {
    const branchServices = mockBranchServices.filter(
      (bs) => bs.branch_id === branchId
    );

    return branchServices
      .map((bs) => {
        const service = mockServices.find((s) => s.id === bs.service_id);
        if (!service) return null;

        // Check if already in existing services
        const existing = existingServices.find(
          (es) => es.branch_service_id === bs.id
        );

        return {
          branch_service_id: bs.id,
          service_id: service.id,
          name: service.name,
          unit_price: bs.unit_price,
          quantity: existing?.quantity || 1,
          unit: service.unit as string,
        };
      })
      .filter((s): s is ServiceItem => s !== null);
  }, [branchId, existingServices]);

  const handleQuantityChange = (serviceId: number, delta: number) => {
    const service = availableServices.find(
      (s) => s.branch_service_id === serviceId
    );
    if (!service) return;

    setSelectedServices((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(serviceId);
      const baseQuantity = current?.quantity || service.quantity;
      const newQuantity = Math.max(1, baseQuantity + delta);

      if (newMap.has(serviceId)) {
        // Update existing
        newMap.set(serviceId, {
          ...current!,
          quantity: newQuantity,
        });
      } else {
        // Add new
        newMap.set(serviceId, {
          ...service,
          quantity: newQuantity,
        });
      }

      return newMap;
    });
  };

  const handleAdd = () => {
    const services = Array.from(selectedServices.values());
    onAdd(services);
    setSelectedServices(new Map());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedServices(new Map());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Thêm dịch vụ</DialogTitle>
          <DialogDescription>
            Chọn dịch vụ và số lượng để thêm vào hóa đơn
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {availableServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Không có dịch vụ nào
              </p>
            ) : (
              availableServices.map((service) => {
                const selected = selectedServices.get(
                  service.branch_service_id
                );
                // If service is selected, use its quantity, otherwise use base quantity from existing or 1
                const quantity =
                  selected?.quantity ||
                  existingServices.find(
                    (es) => es.branch_service_id === service.branch_service_id
                  )?.quantity ||
                  1;
                const isSelected = selectedServices.has(
                  service.branch_service_id
                );

                return (
                  <div
                    key={service.branch_service_id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.unit_price.toLocaleString("vi-VN")} VND /{" "}
                        {service.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(service.branch_service_id, -1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(service.branch_service_id, 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {selectedServices.has(service.branch_service_id) ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedServices((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(service.branch_service_id);
                              return newMap;
                            });
                          }}
                        >
                          Bỏ chọn
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedServices((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(service.branch_service_id, {
                                ...service,
                                quantity,
                              });
                              return newMap;
                            });
                          }}
                        >
                          Chọn
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleAdd} disabled={selectedServices.size === 0}>
            Thêm ({selectedServices.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
