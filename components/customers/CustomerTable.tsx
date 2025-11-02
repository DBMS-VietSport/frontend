"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import type { Customer } from "@/lib/customers/types";
import { getCustomerLevelColor } from "@/lib/customers/utils";

interface CustomerTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
}

export function CustomerTable({ customers, onEdit }: CustomerTableProps) {
  const router = useRouter();

  const handleRowClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handleEditClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(customer);
    }
  };

  if (customers.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-muted-foreground"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy khách hàng phù hợp
          </h3>
          <p className="text-muted-foreground max-w-md">
            Thử tìm kiếm với từ khóa khác hoặc thêm khách hàng mới
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Hạng thành viên</TableHead>
              <TableHead>Điểm tích lũy</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(customer)}
              >
                <TableCell className="font-medium">
                  {customer.full_name}
                </TableCell>
                <TableCell>{customer.phone_number}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Badge
                    className={getCustomerLevelColor(
                      customer.customer_level_name
                    )}
                  >
                    {customer.customer_level_name}
                  </Badge>
                </TableCell>
                <TableCell>{customer.bonus_point.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleEditClick(e, customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
