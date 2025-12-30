"use client";

import { useAuth } from "@/features/auth/lib/useAuth";
import { CustomerDashboard, StaffDashboard } from "@/features/dashboard/components";
import { isCustomer } from "@/lib/role-labels";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center py-12">Vui lòng đăng nhập</div>;
  }

  // Show customer dashboard if user is a customer
  if (isCustomer(user)) {
    return <CustomerDashboard />;
  }

  // Show staff/manager dashboard for other roles
  return <StaffDashboard />;
}
