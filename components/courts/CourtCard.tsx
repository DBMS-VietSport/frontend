"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourtCardData } from "@/lib/courts/types";
import {
  formatVND,
  getStatusBadgeColor,
  getStatusText,
} from "@/lib/courts/utils";

interface CourtCardProps {
  court: CourtCardData;
  onClick: () => void;
}

export function CourtCard({ court, onClick }: CourtCardProps) {
  const statusColor = getStatusBadgeColor(court.status);
  const statusText = getStatusText(court.status);

  // Get card background tint based on status
  const cardTintClass =
    court.status === "Maintenance"
      ? "bg-yellow-50/50 dark:bg-yellow-950/20"
      : court.status === "InUse"
      ? "bg-gray-50/50 dark:bg-gray-950/20"
      : "";

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group",
        cardTintClass
      )}
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={statusColor}>{statusText}</Badge>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold mb-2">{court.name}</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{court.type}</p>
            <p className="text-xs opacity-90">
              {court.branch} • Sức chứa: {court.capacity} người
            </p>
            <p className="text-xs opacity-90">
              Giá gốc:{" "}
              <span className="font-semibold">
                {formatVND(court.basePrice)}/giờ
              </span>
            </p>
          </div>
        </div>

        {/* Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="secondary" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </Button>
        </div>
      </div>
    </Card>
  );
}
