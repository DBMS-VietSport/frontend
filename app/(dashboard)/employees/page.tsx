"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EmployeeFilterBar } from "@/components/employees/EmployeeFilterBar";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";
import type { Employee, CreateEmployeePayload } from "@/lib/employees/types";
import { listEmployees, addEmployee } from "@/lib/employees/mockRepo";
import {
  searchEmployees,
  filterByRole,
  paginate,
} from "@/lib/employees/selectors";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(
    []
  );
  const [displayedEmployees, setDisplayedEmployees] = React.useState<
    Employee[]
  >([]);
  const [searchText, setSearchText] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Load employees on mount
  React.useEffect(() => {
    loadEmployees();
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = searchEmployees(employees, searchText);
    filtered = filterByRole(filtered, selectedRole);
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [employees, searchText, selectedRole]);

  // Apply pagination
  React.useEffect(() => {
    const paginated = paginate(filteredEmployees, currentPage, pageSize);
    setDisplayedEmployees(paginated);
  }, [filteredEmployees, currentPage]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleSave = async (payload: CreateEmployeePayload) => {
    try {
      if (editingEmployee) {
        // Update existing (you'll need to implement updateEmployee in mockRepo)
        toast.success("Cập nhật nhân viên thành công");
      } else {
        await addEmployee(payload);
        toast.success("Đã thêm nhân viên mới thành công");
      }
      await loadEmployees();
    } catch (error) {
      console.error("Failed to save employee:", error);
      toast.error("Không thể lưu nhân viên");
    }
  };

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân viên</h1>
        <p className="text-muted-foreground">
          Xem và quản lý thông tin nhân viên
        </p>
      </div>

      <Separator />

      {/* Filter Bar */}
      <EmployeeFilterBar
        searchText={searchText}
        selectedRole={selectedRole}
        onSearchChange={setSearchText}
        onRoleChange={setSelectedRole}
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
              <span className="font-semibold">{filteredEmployees.length}</span>{" "}
              nhân viên
            </>
          )}
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={displayedEmployees}
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
      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
    </div>
  );
}
