"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/lib/useAuth";
import { apiClient } from "@/lib/api/client";
import { CustomerStatsCards } from "./CustomerStatsCards";
import { UpcomingBookingsTable } from "./UpcomingBookingsTable";
import { MembershipInfoCard } from "./MembershipInfoCard";
import { logger } from "@/utils/logger";

interface CustomerBooking {
  id: number;
  court_name: string;
  branch_name: string;
  booking_date: string;
  total_amount: number;
  status: string;
  slots: Array<{
    start_time: string;
    end_time: string;
  }>;
}

interface CustomerStats {
  totalBookings: number;
  totalPlayHours: number;
  upcomingBookings: Array<{
    id: number;
    branch: string;
    courtName: string;
    date: string;
    timeRange: string;
    status: string;
  }>;
  membershipLevel: string;
  totalServiceSpending: number;
}

export function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = async () => {
    if (!user?.customerId) return;

    try {
      setLoadingStats(true);

      // Fetch customer bookings using apiClient
      const bookingsResponse = await apiClient.get<CustomerBooking[]>(
        `/booking/customers/${user.customerId}/court-bookings`
      );

      const bookings = bookingsResponse.data || [];

      // Calculate stats from real data
      const totalBookings = bookings.length;

      // Calculate total play hours
      let totalPlayHours = 0;
      const upcomingBookings: CustomerStats['upcomingBookings'] = [];

      const now = new Date();
      bookings.forEach(booking => {
        // Calculate hours from slots
        booking.slots?.forEach(slot => {
          const start = new Date(slot.start_time);
          const end = new Date(slot.end_time);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          totalPlayHours += hours;

          // Check if this is an upcoming booking
          if (start >= now) {
            upcomingBookings.push({
              id: booking.id,
              branch: booking.branch_name,
              courtName: booking.court_name,
              date: new Date(booking.booking_date).toLocaleDateString('vi-VN'),
              timeRange: `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
              status: booking.status,
            });
          }
        });
      });

      // Mock membership level and service spending for now
      // In production, these would come from customer profile API
      const membershipLevel = "Platinum"; // This should come from customer data
      const totalServiceSpending = 0; // This should be calculated from service bookings

      setStats({
        totalBookings,
        totalPlayHours: Math.round(totalPlayHours * 10) / 10,
        upcomingBookings,
        membershipLevel,
        totalServiceSpending,
      });

    } catch (error) {
      logger.error("Failed to load customer stats:", error);
      // Set empty stats instead of null to show the dashboard
      setStats({
        totalBookings: 0,
        totalPlayHours: 0,
        upcomingBookings: [],
        membershipLevel: "Thường",
        totalServiceSpending: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.customerId) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading || loadingStats) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trang khách hàng</h1>
        <p className="text-muted-foreground">
          Xem thống kê đặt sân và dịch vụ của bạn tại VietSport.
        </p>
      </div>

      {/* Stats Cards */}
      <CustomerStatsCards stats={stats} />

      {/* Upcoming Bookings */}
      <UpcomingBookingsTable bookings={stats.upcomingBookings} />

      {/* Membership Info */}
      <MembershipInfoCard membershipLevel={stats.membershipLevel} />
    </div>
  );
}
