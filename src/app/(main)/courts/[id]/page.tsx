"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/ui/separator";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CourtInfoCard } from "@/features/court/components/CourtInfoCard";
import { CourtDetailTabs } from "@/features/court/components/CourtDetailTabs";
import { CourtEditDialog } from "@/features/court/components/CourtEditDialog";
import type {
  Court,
  MaintenanceReport,
  CourtBookingSummary,
  UpdateCourtPayload,
  CreateMaintenanceReportPayload,
} from "@/features/court/types";
import {
  getCourt,
  getMaintenanceReports,
  getBookingsForCourt,
  updateCourt,
  addMaintenanceReport,
} from "@/features/court/mockRepo";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

export default function CourtDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courtId = parseInt(params.id as string);

  const [court, setCourt] = React.useState<Court | null>(null);
  const [maintenanceReports, setMaintenanceReports] = React.useState<
    MaintenanceReport[]
  >([]);
  const [bookings, setBookings] = React.useState<CourtBookingSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Load court data
  React.useEffect(() => {
    loadCourtData();
  }, [courtId]);

  const loadCourtData = async () => {
    setIsLoading(true);
    try {
      const [courtData, maintenanceData, bookingsData] = await Promise.all([
        getCourt(courtId),
        getMaintenanceReports(courtId),
        getBookingsForCourt(courtId),
      ]);

      if (!courtData) {
        toast.error("Không tìm thấy sân");
        router.push("/courts");
        return;
      }

      setCourt(courtData);
      setMaintenanceReports(maintenanceData);
      setBookings(bookingsData);
    } catch (error) {
      logger.error("Failed to load court data:", error);
      toast.error("Không thể tải thông tin sân");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleSave = async (payload: UpdateCourtPayload) => {
    if (!court) return;

    try {
      const updated = await updateCourt(court.id, payload);
      setCourt(updated);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update court:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleSaveFromDialog = async (
    id: number,
    payload: UpdateCourtPayload
  ) => {
    try {
      const updated = await updateCourt(id, payload);
      setCourt(updated);
      setDialogOpen(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update court:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleAddMaintenance = async (
    payload: CreateMaintenanceReportPayload
  ) => {
    try {
      const newReport = await addMaintenanceReport(payload);
      setMaintenanceReports([...maintenanceReports, newReport]);

      // Refresh court data to get updated status
      const updatedCourt = await getCourt(courtId);
      if (updatedCourt) {
        setCourt(updatedCourt);
      }
    } catch (error) {
      logger.error("Failed to add maintenance:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!court) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/courts")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết sân</h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết và lịch sử hoạt động
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Court Info Card */}
      <CourtInfoCard court={court} onEdit={handleEditClick} />

      {/* Tabs */}
      <CourtDetailTabs
        court={court}
        maintenanceReports={maintenanceReports}
        bookings={bookings}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
        onAddMaintenance={handleAddMaintenance}
      />

      {/* Edit Dialog */}
      <CourtEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        court={court}
        onSave={handleSaveFromDialog}
      />
    </div>
  );
}
