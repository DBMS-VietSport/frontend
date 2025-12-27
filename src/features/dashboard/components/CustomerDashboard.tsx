"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/lib/useAuth";
import { customerDashboardRepo } from "@/features/customer/mock/customerDashboardRepo";
import type { CustomerBookingStat } from "@/features/customer/mock/customerDashboardRepo";
import { CustomerStatsCards } from "./CustomerStatsCards";
import { UpcomingBookingsTable } from "./UpcomingBookingsTable";
import { MembershipInfoCard } from "./MembershipInfoCard";
import { logger } from "@/utils/logger";

export function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<CustomerBookingStat | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = async () => {
    if (!user?.username) return;
    try {
      setLoadingStats(true);
      const data = await customerDashboardRepo.getStats(user.username);
      setStats(data);
    } catch (error) {
      logger.error("Failed to load customer stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.username) {
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
