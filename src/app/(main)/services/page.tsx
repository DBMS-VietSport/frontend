"use client";

import * as React from "react";
import { Separator } from "@/ui/separator";
import { PageHeader } from "@/components";
import { ServiceFilterBar } from "@/features/services/components/ServiceFilterBar";
import { ServiceTable } from "@/features/services/components/ServiceTable";
import { ServiceFormDialog } from "@/features/services/components/ServiceFormDialog";
import { ServiceDetailDialog } from "@/features/services/components/ServiceDetailDialog";
import type {
  ServiceRow,
  ServiceRentalType,
  CreateServicePayload,
  UpdateServicePayload,
  UpdateBranchServicePayload,
} from "@/features/services/types";
import {
  getServices,
  createService as createServiceAPI,
  updateServiceBase,
  updateBranchService as updateBranchServiceAPI,
} from "@/lib/api/services";
import {
  searchServices,
  filterByRentalType,
  getLowStockServices,
} from "@/features/services/selectors";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

export default function ServicesPage() {
  const [services, setServices] = React.useState<ServiceRow[]>([]);
  const [filteredServices, setFilteredServices] = React.useState<ServiceRow[]>(
    []
  );
  const [searchText, setSearchText] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<
    ServiceRentalType | "Tất cả"
  >("Tất cả");
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedService, setSelectedService] =
    React.useState<ServiceRow | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load services on mount
  React.useEffect(() => {
    loadServicesData();
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = searchServices(services, searchText);
    filtered = filterByRentalType(filtered, selectedType);
    setFilteredServices(filtered);
  }, [services, searchText, selectedType]);

  // Update selected service when services data changes (for dialog refresh)
  React.useEffect(() => {
    if (selectedService && detailDialogOpen) {
      const updatedService = services.find(
        s => s.branch_service_id === selectedService.branch_service_id
      );
      if (updatedService) {
        setSelectedService(updatedService);
      }
    }
  }, [services, selectedService?.branch_service_id, detailDialogOpen]);

  const loadServicesData = async () => {
    setIsLoading(true);
    try {
      const response = await getServices({ page: 1, limit: 1000 });
      setServices(response.data);
    } catch (error) {
      logger.error("Failed to load services:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleServiceClick = (service: ServiceRow) => {
    setSelectedService(service);
    setDetailDialogOpen(true);
  };

  const handleCreateService = async (payload: CreateServicePayload) => {
    try {
      await createServiceAPI(payload);
      toast.success("Đã thêm dịch vụ mới thành công");
      await loadServicesData();
    } catch (error) {
      logger.error("Failed to create service:", error);
      toast.error("Không thể thêm dịch vụ");
    }
  };

  const handleUpdateService = async (
    serviceId: number,
    branchServiceId: number,
    servicePayload: UpdateServicePayload,
    branchServicePayload: UpdateBranchServicePayload
  ) => {
    try {
      // Update service base info if any fields are provided
      if (servicePayload.name || servicePayload.unit || servicePayload.rental_type) {
        await updateServiceBase(serviceId, servicePayload);
      }
      
      // Update branch service with stock adjustment
      // Convert current_stock to stock_adjustment format
      const updatePayload: any = {};
      
      if (branchServicePayload.unit_price !== undefined) {
        updatePayload.unit_price = branchServicePayload.unit_price;
      }
      
      if (branchServicePayload.current_stock !== undefined && selectedService) {
        // Calculate the adjustment needed
        const adjustment = branchServicePayload.current_stock - selectedService.current_stock!;
        updatePayload.stock_adjustment = adjustment;
      }
      
      if (branchServicePayload.min_stock_threshold !== undefined) {
        updatePayload.min_stock_threshold = branchServicePayload.min_stock_threshold;
      }
      
      if (branchServicePayload.status !== undefined) {
        updatePayload.status = branchServicePayload.status;
      }
      
      const result = await updateBranchServiceAPI(branchServiceId, updatePayload);
      
      // Refresh data to show updated values
      await loadServicesData();
      
      // Show warnings if any
      if (result.data?.warnings) {
        toast.warning(result.data.warnings);
      } else {
        toast.success("Cập nhật dịch vụ thành công");
      }
    } catch (error) {
      logger.error("Failed to update service:", error);
      toast.error("Không thể cập nhật dịch vụ");
    }
  };

  const lowStockCount = getLowStockServices(services).length;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <PageHeader
        title="Quản lý dịch vụ"
        subtitle="Xem và quản lý thông tin các dịch vụ, giá cả và tồn kho"
      />

      <Separator />

      {/* Filter Bar */}
      <ServiceFilterBar
        searchText={searchText}
        selectedType={selectedType}
        onSearchChange={setSearchText}
        onTypeChange={setSelectedType}
        onAddClick={handleAddClick}
        lowStockCount={lowStockCount}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Đang tải..."
          ) : (
            <>
              Tìm thấy{" "}
              <span className="font-semibold">{filteredServices.length}</span>{" "}
              dịch vụ
            </>
          )}
        </p>
      </div>

      {/* Service Table */}
      <ServiceTable
        services={filteredServices}
        onServiceClick={handleServiceClick}
        isLoading={isLoading}
      />

      {/* Add Dialog */}
      <ServiceFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleCreateService}
      />

      {/* Detail/Edit Dialog */}
      <ServiceDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        service={selectedService}
        onSave={handleUpdateService}
      />
    </div>
  );
}
