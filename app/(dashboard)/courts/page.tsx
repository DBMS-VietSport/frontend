"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { CourtFilterBar } from "@/components/courts/CourtFilterBar";
import { CourtCardGrid } from "@/components/courts/CourtCardGrid";
import { CourtFormDialog } from "@/components/courts/CourtFormDialog";
import type {
  Court,
  CourtCardData,
  CreateCourtPayload,
} from "@/lib/courts/types";
import { listCourts, addCourt } from "@/lib/courts/mockRepo";
import {
  searchCourts,
  filterByCourtType,
  makeCourtCard,
} from "@/lib/courts/selectors";
import { getCourtImageUrl } from "@/lib/courts/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CourtsPage() {
  const router = useRouter();
  const [courts, setCourts] = React.useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = React.useState<Court[]>([]);
  const [courtCards, setCourtCards] = React.useState<CourtCardData[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
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

  // Transform to cards
  React.useEffect(() => {
    const cards = filteredCourts.map((court) => {
      const imageUrl = getCourtImageUrl(court.court_type_name);
      return makeCourtCard(court, imageUrl);
    });
    setCourtCards(cards);
  }, [filteredCourts]);

  const loadCourts = async () => {
    setIsLoading(true);
    try {
      const data = await listCourts();
      setCourts(data);
    } catch (error) {
      console.error("Failed to load courts:", error);
      toast.error("Không thể tải danh sách sân");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCourt(null);
    setDialogOpen(true);
  };

  const handleEditClick = (court: Court) => {
    setEditingCourt(court);
    setDialogOpen(true);
  };

  const handleCardClick = (card: CourtCardData) => {
    router.push(`/courts/${card.id}`);
  };

  const handleSave = async (payload: CreateCourtPayload) => {
    try {
      if (editingCourt) {
        // Update existing (handled via dialog)
        toast.success("Cập nhật sân thành công");
      } else {
        await addCourt(payload);
        toast.success("Đã thêm sân mới thành công");
      }
      await loadCourts();
    } catch (error) {
      console.error("Failed to save court:", error);
      toast.error("Không thể lưu sân");
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

      {/* Court Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <CourtCardGrid courts={courtCards} onCourtClick={handleCardClick} />
      )}

      {/* Add/Edit Dialog */}
      <CourtFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        court={editingCourt}
        onSave={handleSave}
      />
    </div>
  );
}
