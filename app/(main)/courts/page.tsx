"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { CourtFilterBar } from "@/components/courts/CourtFilterBar";
import { CourtAccordionList } from "@/components/courts/CourtAccordionList";
import { CourtFormDialog } from "@/components/courts/CourtFormDialog";
import { CourtEditDialog } from "@/components/courts/CourtEditDialog";
import type {
  Court,
  CreateCourtPayload,
  UpdateCourtPayload,
} from "@/lib/courts/types";
import { courtRepo } from "@/lib/mock";
import { searchCourts, filterByCourtType } from "@/lib/courts/selectors";
import { toast } from "sonner";

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
    loadCourts();
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = searchCourts(courts, searchText);
    filtered = filterByCourtType(filtered, selectedType);
    setFilteredCourts(filtered);
  }, [courts, searchText, selectedType]);

  const loadCourts = async () => {
    setIsLoading(true);
    try {
      const data = await courtRepo.listCourts();
      setCourts(data);
    } catch (error) {
      console.error("Failed to load courts:", error);
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
      // payload mapping: UI payload aligns with Court sans id/display_name
      await courtRepo.addCourt(payload as any);
      toast.success("Đã thêm sân mới thành công");
      await loadCourts();
    } catch (error) {
      console.error("Failed to add court:", error);
      toast.error("Không thể thêm sân");
    }
  };

  const handleUpdateCourt = async (id: number, payload: UpdateCourtPayload) => {
    try {
      await courtRepo.updateCourt(id, payload as any);
      toast.success("Cập nhật sân thành công");
      await loadCourts();
    } catch (error) {
      console.error("Failed to update court:", error);
      toast.error("Không thể cập nhật sân");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý sân bãi</h1>
        <p className="text-muted-foreground">
          Xem và quản lý thông tin các sân thể thao
        </p>
      </div>

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
