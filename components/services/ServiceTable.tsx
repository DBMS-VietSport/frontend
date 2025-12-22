"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner, TableEmptyState } from "@/components/shared";
import type { ServiceRow } from "@/lib/services/types";
import {
  isLowStock,
  formatPrice,
  getStockStatusColor,
} from "@/lib/services/selectors";

interface ServiceTableProps {
  services: ServiceRow[];
  onServiceClick: (service: ServiceRow) => void;
  isLoading?: boolean;
}

export function ServiceTable({
  services,
  onServiceClick,
  isLoading = false,
}: ServiceTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Pagination
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  // Reset to first page when services change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [services]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="p-6">
        <TableEmptyState entityName="dịch vụ" className="py-12" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Số lượng hiện tại</TableHead>
                <TableHead className="text-center">Ngưỡng cảnh báo</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentServices.map((service) => {
                const lowStock = isLowStock(service);
                const stockColor = getStockStatusColor(service);

                return (
                  <TableRow
                    key={service.branch_service_id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      lowStock && "bg-yellow-50/50 dark:bg-yellow-950/10"
                    )}
                    onClick={() => onServiceClick(service)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {lowStock && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        {service.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.rental_type}</Badge>
                    </TableCell>
                    <TableCell>{service.unit}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(service.unit_price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn("font-semibold", stockColor)}>
                        {service.current_stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {service.min_stock_threshold}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          service.status === "Available"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          service.status === "Available"
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                      >
                        {service.status === "Available"
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceClick(service);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, services.length)}{" "}
            trong tổng {services.length} dịch vụ
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
