"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

interface DiscountCardProps {
  discount: string;
  onDiscountChange: (value: string) => void;
}

export function DiscountCard({
  discount,
  onDiscountChange,
}: DiscountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Khuyến mãi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Chọn khuyến mãi</Label>
          <Select value={discount} onValueChange={onDiscountChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khuyến mãi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không áp dụng</SelectItem>
              <SelectItem value="student">Giảm 10% khách HSSV</SelectItem>
              <SelectItem value="platinum">Giảm 20% Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
