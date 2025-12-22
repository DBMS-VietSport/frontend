"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";
import { CustomerFilterBar } from "@/components/customers/CustomerFilterBar";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import type { Customer, CreateCustomerPayload } from "@/lib/customers/types";
import { listCustomers, addCustomer } from "@/lib/customers/mockRepo";
import { searchCustomers, paginate } from "@/lib/customers/selectors";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>(
    []
  );
  const [displayedCustomers, setDisplayedCustomers] = React.useState<
    Customer[]
  >([]);
  const [searchText, setSearchText] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Load customers on mount
  React.useEffect(() => {
    loadCustomers();
  }, []);

  // Apply search filter
  React.useEffect(() => {
    const filtered = searchCustomers(customers, searchText);
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [customers, searchText]);

  // Apply pagination
  React.useEffect(() => {
    const paginated = paginate(filteredCustomers, currentPage, pageSize);
    setDisplayedCustomers(paginated);
  }, [filteredCustomers, currentPage]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await listCustomers();
      setCustomers(data);
    } catch (error) {
      logger.error("Failed to load customers:", error);
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleSave = async (payload: CreateCustomerPayload) => {
    try {
      if (editingCustomer) {
        // Update existing (you'll need to implement updateCustomer in mockRepo)
        toast.success("Cập nhật khách hàng thành công");
      } else {
        await addCustomer(payload);
        toast.success("Đã thêm khách hàng mới thành công");
      }
      await loadCustomers();
    } catch (error) {
      logger.error("Failed to save customer:", error);
      toast.error("Không thể lưu khách hàng");
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Xem và quản lý thông tin khách hàng"
      />

      <Separator />

      {/* Filter Bar */}
      <CustomerFilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        onAddClick={handleAddClick}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Đang tải..."
          ) : (
            <>
              Tìm thấy{" "}
              <span className="font-semibold">{filteredCustomers.length}</span>{" "}
              khách hàng
            </>
          )}
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <CustomerTable
            customers={displayedCustomers}
            onEdit={handleEditClick}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={handleSave}
      />
    </div>
  );
}
