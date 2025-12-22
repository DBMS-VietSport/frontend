"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { FilterBar } from "@/components/booking/manage/FilterBar";
import { BookingTable } from "@/components/booking/manage/BookingTable";
import { BookingDetailDialog } from "@/components/booking/manage/BookingDetailDialog";
import type { FilterValues } from "@/components/booking/manage/FilterBar";
import type { BookingRow } from "@/lib/types";
import {
  useBookingsQuery,
  useBookingDetailQuery,
} from "@/lib/api/booking";
import { applyFilters } from "@/lib/booking/selectors";
import { useAuth } from "@/lib/auth/useAuth";
import { LoadingSpinner, PageHeader } from "@/components/shared";

export default function BookingManagePage() {
  const { user } = useAuth();

  // Filter state
  const [filters, setFilters] = React.useState<FilterValues>({
    date: new Date(),
    courtTypeId: null,
    paymentStatus: null,
    searchText: "",
  });

  // Dialog state
  const [selectedBookingId, setSelectedBookingId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fetch bookings using React Query
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useBookingsQuery();

  // Fetch selected booking detail using React Query
  const { data: selectedBooking } = useBookingDetailQuery(
    selectedBookingId ?? undefined,
    {
      enabled: !!selectedBookingId,
    }
  );

  // Filter bookings based on user role and filters
  const filteredRows = React.useMemo(() => {
    let rows = bookings;

    // If customer, restrict to own bookings
    if (user?.role === "customer") {
      rows = rows.filter((r) => r.customerName === user.fullName);
    }

    // Apply UI filters
    return applyFilters(rows, filters);
  }, [bookings, filters, user]);

  const handleRowClick = (row: BookingRow) => {
    setSelectedBookingId(row.id);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedBookingId(null);
    }
  };

  const isCustomer = user?.role === "customer";

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-screen-2xl">
        <div className="text-center py-12 text-destructive">
          Không thể tải danh sách booking. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header - using shared component */}
      <PageHeader
        title={isCustomer ? "Đặt sân của tôi" : "Quản lý đặt sân"}
        subtitle={
          isCustomer
            ? "Xem và chỉnh sửa các đơn đặt sân của bạn"
            : "Xem và chỉnh sửa thông tin các đơn đặt sân"
        }
      />

      <Separator />

      {/* Filters (hidden for customers) */}
      {!isCustomer && (
        <FilterBar filters={filters} onFiltersChange={setFilters} />
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Đang tải..."
          ) : (
            <>
              Tìm thấy{" "}
              <span className="font-semibold">{filteredRows.length}</span>{" "}
              booking
            </>
          )}
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <BookingTable rows={filteredRows} onRowClick={handleRowClick} />
      )}

      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking ?? null}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
