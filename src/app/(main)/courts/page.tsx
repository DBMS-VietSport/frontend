"use client";

import * as React from "react";
import { Separator } from "@/ui/separator";
import { CourtFilterBar } from "@/features/court/components/CourtFilterBar";
import { CourtAccordionList } from "@/features/court/components/CourtAccordionList";
import { CourtFormDialog } from "@/features/court/components/CourtFormDialog";
import { CourtEditDialog } from "@/features/court/components/CourtEditDialog";
import type {
  Court,
  CreateCourtPayload,
  UpdateCourtPayload,
} from "@/features/court/types";
import {
  getCourts,
  createCourt as createCourtAPI,
  updateCourt as updateCourtAPI,
} from "@/lib/api/courts";
import { searchCourts, filterByCourtType } from "@/features/court/selectors";
import { toast } from "sonner";
import { LoadingSpinner, PageHeader } from "@/components";
import { logger } from "@/utils/logger";

export default function CourtsPage() {
  const [courts, setCourts] = React.useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = React.useState<Court[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingCourt, setEditingCourt] = React.useState<Court | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load courts on mount
  React.useEffect(() => {
    loadCourtsData();
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = searchCourts(courts, searchText);
    filtered = filterByCourtType(filtered, selectedType);
    setFilteredCourts(filtered);
  }, [courts, searchText, selectedType]);

  const loadCourtsData = async () => {
    setIsLoading(true);
    try {
      const response = await getCourts({ page: 1, limit: 1000 });
      setCourts(response.data);
    } catch (error) {
      logger.error("Failed to load courts:", error);
      toast.error("Không thể tải danh sách sân");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleCourtClick = (court: Court) => {
    setEditingCourt(court);
    setEditDialogOpen(true);
  };

  const handleAddCourt = async (payload: CreateCourtPayload) => {
    try {
      await createCourtAPI(payload);
      setAddDialogOpen(false);
      toast.success("Đã thêm sân mới thành công");
      await loadCourtsData();
    } catch (error) {
      logger.error("Failed to add court:", error);
      toast.error("Không thể thêm sân");
    }
  };

  const handleUpdateCourt = async (id: number, payload: UpdateCourtPayload) => {
    try {
      // Prepare data for sp_UpdateCourt
      const updateData = {
        name: payload.name || "",
        status: payload.status || "Available",
        capacity: payload.capacity || 0,
        base_hourly_price: payload.base_hourly_price || 0,
        maintenance_date: payload.maintenance_date,
      };
      
      await updateCourtAPI(id, updateData);
      setEditDialogOpen(false);
      toast.success("Cập nhật sân thành công");
      await loadCourtsData();
    } catch (error) {
      logger.error("Failed to update court:", error);
      toast.error("Không thể cập nhật sân");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <PageHeader
        title="Quản lý sân bãi"
        subtitle="Xem và quản lý thông tin các sân thể thao"
      />

      <Separator />

      {/* Filter Bar */}
      <CourtFilterBar
        searchText={searchText}
        selectedType={selectedType}
        onSearchChange={setSearchText}
        onTypeChange={setSelectedType}
        onAddClick={handleAddClick}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Đang tải..."
          ) : (
            <>
              Tìm thấy{" "}
              <span className="font-semibold">{filteredCourts.length}</span> sân
            </>
          )}
        </p>
      </div>

      {/* Court Accordion List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <CourtAccordionList
          courts={filteredCourts}
          onCourtClick={handleCourtClick}
        />
      )}

      {/* Add Dialog */}
      <CourtFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddCourt}
      />

      {/* Edit Dialog */}
      <CourtEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        court={editingCourt}
        onSave={handleUpdateCourt}
      />
    </div>
  );
}
