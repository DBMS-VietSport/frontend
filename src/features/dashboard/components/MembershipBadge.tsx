"use client";

import { Badge } from "@/ui/badge";
import { Award } from "lucide-react";
import { getMembershipBadgeColor, getMembershipDiscount } from "./utils";

interface MembershipBadgeProps {
  level: string;
}

export function MembershipBadge({ level }: MembershipBadgeProps) {
  return (
    <Badge variant="default" className={getMembershipBadgeColor(level)}>
      <Award className="h-3 w-3 mr-1" />
      {getMembershipDiscount(level)}%
    </Badge>
  );
}
