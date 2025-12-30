"use client";

import * as React from "react";
import { Separator } from "@/ui/separator";
import { FilterBar } from "@/features/booking/components/manage/FilterBar";
import { BookingTable } from "@/features/booking/components/manage/BookingTable";
import { BookingDetailDialog } from "@/features/booking/components/manage/BookingDetailDialog";
import type { FilterValues } from "@/features/booking/components/manage/FilterBar";
import type { BookingRow } from "@/types";
import { useCourtBookings, useCourtBooking, useCourtTypes } from "@/lib/api";
import { applyFilters } from "@/features/booking/utils/selectors";
import { useAuth } from "@/features/auth/lib/useAuth";
import { LoadingSpinner, PageHeader } from "@/components";
import { isCustomer } from "@/lib/role-labels";

export default function BookingManagePage() {
  const { user } = useAuth();

  // Filter state - Default to showing ALL bookings, not just today's
  const [filters, setFilters] = React.useState<FilterValues>({
    date: null, // Changed from new Date() to show all bookings
    courtTypeId: null,
    paymentStatus: null,
    searchText: "",
  });

  // Dialog state
  const [selectedBookingId, setSelectedBookingId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Get branch ID from user (assuming user has branchId)
  const branchId = user?.branchId || 1; // Default to 1 if not available

  // Fetch bookings using React Query
  const {
    data: bookingsData = [],
    isLoading,
    error,
  } = useCourtBookings(branchId, {
    // Add filters if needed
  });

  // Fetch real data (Moved from JSX)
  const { data: courtTypes = [] } = useCourtTypes();

  // Add console logging to debug
  React.useEffect(() => {
    console.log('Raw bookings data:', bookingsData);
    console.log('User:', user);
  }, [bookingsData, user]);

  // Transform API data to BookingRow format
  const bookings: BookingRow[] = React.useMemo(() => {
    if (!Array.isArray(bookingsData)) {
      console.warn('bookingsData is not an array:', bookingsData);
      return [];
    }

    return bookingsData.map((booking: any) => {
      const row: BookingRow = {
        id: booking.id || 0,
        code: `BK-${booking.id || 0}`,
        branchName: booking.branch_name || '-',
        courtName: booking.court_name || '-',
        courtType: booking.court_type_name || '-',
        customerName: booking.customer_name || '-',
        employeeName: booking.employee_name || undefined,
        timeRange: booking.time_range || '-',
        paymentStatus: (booking.status === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán') as any,
        courtStatus: booking.status || 'Chưa xác nhận',
        bookingDate: booking.booking_date || new Date().toISOString(), // When they want to play
        createdAt: booking.created_at || new Date().toISOString(), // When booking was created
      };
      console.log('Transformed booking row:', row);
      return row;
    });
  }, [bookingsData]);

  // Fetch selected booking detail using React Query
  const { data: selectedBooking } = useCourtBooking(
    selectedBookingId ?? 0,
    {
      enabled: !!selectedBookingId,
    }
  );

  // Filter bookings based on user role and filters
  const filteredRows = React.useMemo(() => {
    console.log('=== FILTER DEBUG ===');
    console.log('Initial bookings count:', bookings.length);
    console.log('Filters:', filters);
    console.log('User:', user);
    console.log('isCustomer:', isCustomer(user));

    let rows = bookings;

    // If customer, restrict to own bookings
    if (isCustomer(user) && user) {
      console.log('Filtering for customer:', user.fullName);
      rows = rows.filter((r) => r.customerName === user.fullName);
      console.log('After customer filter:', rows.length);
    }

    // Apply UI filters
    const result = applyFilters(rows, filters, courtTypes);
    console.log('After applyFilters:', result.length);
    console.log('Filtered result:', result);
    return result;
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

  const isCustomerUser = isCustomer(user);

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
        title={isCustomerUser ? "Đặt sân của tôi" : "Quản lý đặt sân"}
        subtitle={
          isCustomerUser
            ? "Xem và chỉnh sửa các đơn đặt sân của bạn"
            : "Xem và chỉnh sửa thông tin các đơn đặt sân"
        }
      />

      <Separator />




      {/* Filters (hidden for customers) */}
      {!isCustomerUser && (
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          courtTypes={courtTypes}
        />
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
      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={React.useMemo(() => {
          if (!selectedBooking) return null;

          // Safe transformation of API response to BookingDetailView
          const raw = selectedBooking as any;

          // 1. Calculate fees (if not directly provided)
          const courtFee = Number(raw.booked_base_price) || 0;
          // Note: In a real app complexity, this might need summation of slots * price per slot.
          // Here we assume backend returns a base price or we sum invoices.

          const bookingSlots = raw.booking_slots || [];
          const serviceBooking = raw.service_booking?.[0]; // Assuming 1:1 or taking first
          const serviceItemsRaw = serviceBooking?.service_booking_item || [];

          // Transform service items
          const serviceItems: any[] = serviceItemsRaw.map((item: any) => ({
            ...item,
            service: item.branch_service?.service || {},
            branchService: item.branch_service || {},
            // Handle if trainers/referees are needed
          }));

          const serviceFee = serviceItems.reduce((sum: number, item: any) => {
            return sum + (Number(item.quantity) * Number(item.branchService?.unit_price || 0));
          }, 0);

          const totalAmount = courtFee + serviceFee; // Simplified calculation

          // 2. Map to BookingDetailView
          return {
            id: raw.id,
            code: `BK-${raw.id}`,
            branchName: raw.court?.branch?.name || raw.branch?.name || '-',
            // Extract nested properties safely
            courtName: raw.court?.name || '-',
            courtType: raw.court?.court_type?.name || '-',
            customerName: raw.customer?.full_name || '-',
            employeeName: raw.employee?.full_name || '-',
            timeRange: bookingSlots.length > 0
              ? `${formatTime(bookingSlots[0].start_time)} - ${formatTime(bookingSlots[bookingSlots.length - 1].end_time)}`
              : '-',
            paymentStatus: raw.status === 'Paid' || raw.status === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán',
            courtStatus: raw.status || 'Pending',
            bookingDate: raw.booking_date,
            createdAt: raw.created_at,

            // Full Objects
            customer: raw.customer || {},
            employee: raw.employee,
            court: raw.court || {},
            courtTypeData: raw.court?.court_type || {},
            branch: raw.court?.branch || {},

            // Arrays with fallbacks
            slots: bookingSlots.map((slot: any) => {
              let status = slot.status;
              if (status === "Đã đặt") status = "booked";
              else if (status === "Trống") status = "available";
              else if (status === "Đang giữ chỗ") status = "pending";

              return {
                ...slot,
                status: status || 'booked'
              };
            }),
            invoices: raw.invoice || [],
            serviceBooking: serviceBooking,

            // Calculated/Transformed
            serviceItems: serviceItems,
            courtFee: courtFee,
            serviceFee: serviceFee,
            totalAmount: totalAmount
          };
        }, [selectedBooking])}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}

// Helper for time formatting if not imported
function formatTime(dateStr: string) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) { return ''; }
}
