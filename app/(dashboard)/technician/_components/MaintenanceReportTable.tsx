"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/useAuth";
import {
  maintenanceRepo,
  type MaintenanceReport,
} from "@/lib/mock/maintenanceRepo";
import { formatVND } from "@/lib/booking/pricing";

interface Props {
  refreshKey?: number;
}

export function MaintenanceReportTable({ refreshKey }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = React.useState<MaintenanceReport | null>(
    null
  );
  const [open, setOpen] = React.useState(false);

  const reports = maintenanceRepo.listReports(user?.username);

  const handleRowClick = (rep: MaintenanceReport) => {
    setSelected(rep);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày báo cáo</TableHead>
                <TableHead>Sân</TableHead>
                <TableHead>Cơ sở</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead>Trạng thái sau bảo trì</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(r)}
                >
                  <TableCell className="whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{r.courtName}</TableCell>
                  <TableCell>{r.branch}</TableCell>
                  <TableCell
                    className="max-w-[340px] truncate"
                    title={r.work_description}
                  >
                    {r.work_description}
                  </TableCell>
                  <TableCell>{formatVND(r.cost)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.post_maintenance_status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Chưa có báo cáo nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Chi tiết báo cáo bảo trì</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sân</p>
                  <p className="font-medium">{selected.courtName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cơ sở</p>
                  <p className="font-medium">{selected.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày báo cáo</p>
                  <p className="font-medium">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chi phí</p>
                  <p className="font-medium">{formatVND(selected.cost)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Nội dung bảo trì
                </p>
                <p className="font-medium whitespace-pre-line">
                  {selected.work_description}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vật tư sử dụng</p>
                <p className="font-medium whitespace-pre-line">
                  {selected.material_used}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Trạng thái sau bảo trì
                </p>
                <Badge variant="outline">
                  {selected.post_maintenance_status}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
