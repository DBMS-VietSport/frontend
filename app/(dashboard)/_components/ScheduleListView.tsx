"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, MapPin, User, FileText } from "lucide-react";
import type { MyShift } from "@/lib/mock/scheduleRepo";

interface ScheduleListViewProps {
  shifts: MyShift[];
}

export function ScheduleListView({ shifts }: ScheduleListViewProps) {
  const [selectedShift, setSelectedShift] = useState<MyShift | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned":
        return (
          <Badge variant="default" className="bg-green-600">
            Đã xác nhận
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="secondary" className="bg-amber-500">
            Chờ xác nhận
          </Badge>
        );
      case "Cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (shifts.length === 0) {
    return (
      <Card className="rounded-xl border bg-background/50">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Không có ca trực nào trong tháng này
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl border bg-background/50">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách ca trực</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Cơ sở</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedShift(shift)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(shift.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {shift.start_time} - {shift.end_time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{shift.branch}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{shift.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(shift.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {shift.note || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedShift}
        onOpenChange={(open) => !open && setSelectedShift(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết ca trực</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Ngày:</span>
                  <span>{formatDate(selectedShift.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Thời gian:</span>
                  <span>
                    {selectedShift.start_time} - {selectedShift.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cơ sở:</span>
                  <span>{selectedShift.branch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Chức vụ:</span>
                  <span>{selectedShift.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Trạng thái:</span>
                  {getStatusBadge(selectedShift.status)}
                </div>
                {selectedShift.note && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Ghi chú:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedShift.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
