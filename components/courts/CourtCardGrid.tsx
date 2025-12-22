"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";
import { CourtCard } from "./CourtCard";
import { EmptyState } from "@/components/shared";
import type { CourtCardData } from "@/lib/courts/types";

interface CourtCardGridProps {
  courts: CourtCardData[];
  onCourtClick: (court: CourtCardData) => void;
}

export function CourtCardGrid({ courts, onCourtClick }: CourtCardGridProps) {
  if (courts.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <EmptyState
          icon={LayoutGrid}
          title="Không tìm thấy sân phù hợp"
          description="Thử tìm kiếm với từ khóa khác hoặc thêm sân mới"
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          onClick={() => onCourtClick(court)}
        />
      ))}
    </div>
  );
}
