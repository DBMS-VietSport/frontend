"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Edit } from "lucide-react";
import type { Court } from "@/features/court/types";
import {
  formatVND,
  formatDate,
  getStatusBadgeColor,
  getStatusText,
  getCourtImageUrl,
} from "@/features/court/utils";
import { getCourtName } from "@/features/court/selectors";

interface CourtInfoCardProps {
  court: Court;
  onEdit: () => void;
}

export function CourtInfoCard({ court, onEdit }: CourtInfoCardProps) {
  const imageUrl = getCourtImageUrl(court.court_type_name);
  const courtName = getCourtName(court);
  const statusColor = getStatusBadgeColor(court.status);
  const statusText = getStatusText(court.status);

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        {/* Image Section */}
        <div className="relative aspect-[4/3] md:aspect-auto md:max-h-[300px] min-h-[200px]">
          <img
            src={imageUrl}
            alt={courtName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-bold mb-1">{courtName}</h2>
            <p className="text-xs opacity-90">{court.court_type_name}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="md:col-span-4 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Thông tin cơ bản</h3>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Loại sân</p>
              <p className="font-semibold mt-1">{court.court_type_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chi nhánh</p>
              <p className="font-semibold mt-1">{court.branch_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sức chứa</p>
              <p className="font-semibold mt-1">{court.capacity} người</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá gốc</p>
              <p className="font-semibold mt-1">
                {formatVND(court.base_hourly_price)}/giờ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge className={`${statusColor} mt-1`}>{statusText}</Badge>
            </div>
            {court.maintenance_date && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Ngày bảo trì gần nhất
                </p>
                <p className="font-semibold mt-1">
                  {formatDate(court.maintenance_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
