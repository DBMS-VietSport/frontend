"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { CustomerDashboard, StaffDashboard } from "@/components/dashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  // Show customer dashboard if user is a customer
  if (user?.role === "customer") {
    return <CustomerDashboard />;
  }

  // Show staff/manager dashboard for other roles
  return <StaffDashboard />;
}
