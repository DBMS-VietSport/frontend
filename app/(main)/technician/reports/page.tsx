"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { RequireRole } from "@/components/auth/RequireRole";
import { MaintenanceReportTable } from "@/components/technician/MaintenanceReportTable";
import { CreateMaintenanceReportDialog } from "@/components/technician/CreateMaintenanceReportDialog";

export default function TechnicianReportsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const handleCreated = () => setRefreshKey((k) => k + 1);

  return (
    <RequireRole
      roles={["technical", "manager"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo bảo trì</h1>
          <p className="text-muted-foreground">
            Xem và tạo báo cáo bảo trì sau khi hoàn thành công việc
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-end">
            <CreateMaintenanceReportDialog onCreated={handleCreated} />
          </div>
          <MaintenanceReportTable refreshKey={refreshKey} />
        </div>
      </div>
    </RequireRole>
  );
}
