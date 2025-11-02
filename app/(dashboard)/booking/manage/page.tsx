"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { FilterBar } from "@/components/booking/manage/FilterBar";
import { BookingTable } from "@/components/booking/manage/BookingTable";
import { BookingDetailDialog } from "@/components/booking/manage/BookingDetailDialog";
import type { FilterValues } from "@/components/booking/manage/FilterBar";
import type { BookingRow, BookingDetailView } from "@/lib/booking/types";
import {
  listBookings,
  getInvoicesFor,
  getServicesFor,
} from "@/lib/booking/mockRepo";
import {
  makeBookingRow,
  makeBookingDetailView,
  applyFilters,
} from "@/lib/booking/selectors";

export default function BookingManagePage() {
  const [filters, setFilters] = React.useState<FilterValues>({
    date: new Date(),
    courtTypeId: null,
    paymentStatus: null,
    searchText: "",
  });

  const [allRows, setAllRows] = React.useState<BookingRow[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<BookingRow[]>([]);
  const [selectedBooking, setSelectedBooking] =
    React.useState<BookingDetailView | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load bookings on mount
  React.useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const bookings = await listBookings();

      // Transform to rows with invoices
      const rows = await Promise.all(
        bookings.map(async (booking) => {
          const invoices = await getInvoicesFor(booking.id);
          return makeBookingRow(booking, invoices);
        })
      );

      setAllRows(rows);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters when filters or data changes
  React.useEffect(() => {
    const filtered = applyFilters(allRows, filters);
    setFilteredRows(filtered);
  }, [allRows, filters]);

  const handleRowClick = async (row: BookingRow) => {
    try {
      // Fetch full booking details
      const bookings = await listBookings();
      const booking = bookings.find((b) => b.id === row.id);
      if (!booking) return;

      const invoices = await getInvoicesFor(booking.id);
      const { serviceBooking, items } = await getServicesFor(booking.id);

      const detailView = makeBookingDetailView(
        booking,
        invoices,
        items,
        serviceBooking?.id
      );

      setSelectedBooking(detailView);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to load booking details:", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đặt sân</h1>
        <p className="text-muted-foreground">
          Xem và chỉnh sửa thông tin các đơn đặt sân
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <BookingTable rows={filteredRows} onRowClick={handleRowClick} />
      )}

      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
