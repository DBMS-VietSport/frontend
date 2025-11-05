"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RequireRole } from "@/components/auth/RequireRole";
import { Wrench } from "lucide-react";
import { MaintenanceSchedule } from "./_components/MaintenanceSchedule";
import { MaintenanceReportTable } from "./_components/MaintenanceReportTable";
import { CreateMaintenanceReportDialog } from "./_components/CreateMaintenanceReportDialog";

export default function TechnicianPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const handleCreated = () => setRefreshKey((k) => k + 1);
  return (
    <RequireRole
      roles={["technical", "manager"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Bảo trì kỹ thuật</h1>
          </div>
          <p className="text-muted-foreground">
            Xem lịch bảo trì định kỳ và gửi báo cáo sau khi bảo trì sân.
          </p>
        </div>

        <Separator />

        <Card className="rounded-xl border bg-background/50 p-0">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="schedule">Lịch bảo trì</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo bảo trì</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="p-4 md:p-6">
              <MaintenanceSchedule />
            </TabsContent>

            <TabsContent value="reports" className="p-4 md:p-6 space-y-4">
              <div className="flex justify-end">
                <CreateMaintenanceReportDialog onCreated={handleCreated} />
              </div>
              <MaintenanceReportTable refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </RequireRole>
  );
}
