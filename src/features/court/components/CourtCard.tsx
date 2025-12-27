"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { cn } from "@/utils";
import type { CourtCardData } from "@/features/court/types";
import {
  formatVND,
  getStatusBadgeColor,
  getStatusText,
} from "@/features/court/utils";

interface CourtCardProps {
  court: CourtCardData;
  onClick: () => void;
}

export function CourtCard({ court, onClick }: CourtCardProps) {
  const statusColor = getStatusBadgeColor(court.status);
  const statusText = getStatusText(court.status);

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md border-2 p-0 group",
        "hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="aspect-4/3 relative">
        <img
          src={court.image}
          alt={court.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300 group-hover:opacity-90" />
        <div className="absolute inset-0 border-2 border-transparent rounded-xl">
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={statusColor}>{statusText}</Badge>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h4 className="text-white font-semibold text-base drop-shadow-lg mb-2">
            {court.name}
          </h4>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{court.type}</p>
            <p className="text-xs opacity-90">
              Sức chứa: {court.capacity} người
            </p>
            <p className="text-xs opacity-90">
              Giá gốc:{" "}
              <span className="font-semibold">
                {formatVND(court.basePrice)}/giờ
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
