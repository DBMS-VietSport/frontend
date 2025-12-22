"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared";
import { ServiceFilterBar } from "@/components/services/ServiceFilterBar";
import { ServiceTable } from "@/components/services/ServiceTable";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { ServiceDetailDialog } from "@/components/services/ServiceDetailDialog";
import type {
  ServiceRow,
  ServiceRentalType,
  CreateServicePayload,
  UpdateServicePayload,
  UpdateBranchServicePayload,
} from "@/lib/services/types";
import {
  listServices,
  createService,
  updateService,
  updateBranchService,
} from "@/lib/services/mockRepo";
import {
  searchServices,
  filterByRentalType,
  getLowStockServices,
} from "@/lib/services/selectors";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

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

  const loadServicesData = async () => {
    setIsLoading(true);
    try {
      const data = await listServices();
      setServices(data);
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
      await createService(payload);
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
      await updateService(serviceId, servicePayload);
      await updateBranchService(branchServiceId, branchServicePayload);
      toast.success("Cập nhật dịch vụ thành công");
      await loadServicesData();
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
