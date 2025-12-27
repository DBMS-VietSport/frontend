"use client";

import * as React from "react";
import { Separator } from "@/ui/separator";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { MaintenanceSchedule } from "@/features/technican/components/MaintenanceSchedule";

export default function TechnicianSchedulePage() {
  return (
    <RequireRole
      roles={["technical", "manager"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lịch bảo trì</h1>
          <p className="text-muted-foreground">
            Xem lịch bảo trì định kỳ được tạo bởi quản lý
          </p>
        </div>

        <Separator />

        <MaintenanceSchedule />
      </div>
    </RequireRole>
  );
}
