"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText } from "lucide-react";
import type { LeaveRequest } from "@/lib/mock/leaveRequestRepo";

interface RecentLeaveRequestsProps {
  requests: LeaveRequest[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: LeaveRequest["approval_status"]) {
  switch (status) {
    case "Pending":
      return (
        <Badge variant="secondary" className="bg-amber-500">
          Chờ duyệt
        </Badge>
      );
    case "Approved":
      return (
        <Badge variant="default" className="bg-green-600">
          Đã duyệt
        </Badge>
      );
    case "Rejected":
      return <Badge variant="destructive">Từ chối</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function RecentLeaveRequests({ requests }: RecentLeaveRequestsProps) {
  const recentRequests = requests.slice(0, 5); // Last 5 requests

  if (recentRequests.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xl border bg-background/50">
      <CardHeader>
        <CardTitle className="text-lg">Yêu cầu nghỉ phép gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(request.start_date)} -{" "}
                    {formatDate(request.end_date)}
                  </span>
                  {getStatusBadge(request.approval_status)}
                </div>
                {request.reason && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
