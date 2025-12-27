"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { Badge } from "@/ui/badge";
import { CourtCard } from "./CourtCard";
import { TableEmptyState } from "@/components";
import type { Court } from "@/features/court/types";
import { groupCourtsByType } from "@/features/court/selectors";
import { getCourtImageUrl } from "@/features/court/utils";

interface CourtAccordionListProps {
  courts: Court[];
  onCourtClick: (court: Court) => void;
}

export function CourtAccordionList({
  courts,
  onCourtClick,
}: CourtAccordionListProps) {
  const groups = groupCourtsByType(courts);

  // Filter out empty groups
  const nonEmptyGroups = groups.filter((group) => group.courts.length > 0);

  if (nonEmptyGroups.length === 0) {
    return (
      <TableEmptyState entityName="sân phù hợp với bộ lọc" className="py-12" />
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={nonEmptyGroups.map((g) => g.typeId.toString())}
      className="space-y-4"
    >
      {nonEmptyGroups.map((group) => (
        <AccordionItem
          key={group.typeId}
          value={group.typeId.toString()}
          className="border rounded-2xl shadow-sm bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{group.typeName}</h3>
              <Badge variant="secondary" className="text-sm">
                {group.courts.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.courts.map((court) => {
                const imageUrl = getCourtImageUrl(court.court_type_name);
                return (
                  <CourtCard
                    key={court.id}
                    court={{
                      id: court.id,
                      name: court.name || `Sân ${court.id}`,
                      type: court.court_type_name,
                      capacity: court.capacity,
                      basePrice: court.base_hourly_price,
                      branch: court.branch_name,
                      maintenanceDate: court.maintenance_date,
                      status: court.status,
                      image: imageUrl,
                    }}
                    onClick={() => onCourtClick(court)}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
