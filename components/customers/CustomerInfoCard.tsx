"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import type { Customer } from "@/lib/customers/types";
import {
  getCustomerLevelColor,
  calculateAge,
  formatDate,
} from "@/lib/customers/utils";

interface CustomerInfoCardProps {
  customer: Customer;
  onEdit: () => void;
}

export function CustomerInfoCard({ customer, onEdit }: CustomerInfoCardProps) {
  const initials = customer.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const age = customer.dob ? calculateAge(customer.dob) : null;

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{customer.full_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{customer.phone_number}</span>
                <span>•</span>
                <span>{customer.email}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Hạng thành viên</p>
              <Badge
                className={`${getCustomerLevelColor(
                  customer.customer_level_name
                )} mt-1`}
              >
                {customer.customer_level_name}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
              <p className="font-semibold mt-1">
                {customer.bonus_point.toLocaleString()}
              </p>
            </div>
            {customer.dob && (
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-semibold mt-1">
                  {formatDate(customer.dob)}
                  {age && ` (${age} tuổi)`}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Giảm giá</p>
              <p className="font-semibold mt-1">{customer.discount_rate}%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
