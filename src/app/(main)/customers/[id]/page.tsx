"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/ui/separator";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CustomerInfoCard } from "@/features/customer/components/CustomerInfoCard";
import { CustomerDetailTabs } from "@/features/customer/components/CustomerDetailTabs";
import { CustomerFormDialog } from "@/features/customer/components/CustomerFormDialog";
import type {
  Customer,
  BookingSummary,
  InvoiceSummary,
  UpdateCustomerPayload,
  CreateCustomerPayload,
} from "@/features/customer/types";
import {
  getCustomer,
  getCustomerBookings,
  getCustomerInvoices,
  updateCustomer,
} from "@/features/customer/mockRepo";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = parseInt(params.id as string);

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [bookings, setBookings] = React.useState<BookingSummary[]>([]);
  const [invoices, setInvoices] = React.useState<InvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Load customer data
  React.useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const [customerData, bookingsData, invoicesData] = await Promise.all([
        getCustomer(customerId),
        getCustomerBookings(customerId),
        getCustomerInvoices(customerId),
      ]);

      if (!customerData) {
        toast.error("Không tìm thấy khách hàng");
        router.push("/customers");
        return;
      }

      setCustomer(customerData);
      setBookings(bookingsData);
      setInvoices(invoicesData);
    } catch (error) {
      logger.error("Failed to load customer data:", error);
      toast.error("Không thể tải thông tin khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleSave = async (payload: UpdateCustomerPayload) => {
    if (!customer) return;

    try {
      const updated = await updateCustomer(customer.id, payload);
      setCustomer(updated);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update customer:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleSaveFromDialog = async (payload: CreateCustomerPayload) => {
    if (!customer) return;

    try {
      const updatePayload: UpdateCustomerPayload = {
        full_name: payload.full_name,
        dob: payload.dob,
        gender: payload.gender,
        id_card_number: payload.id_card_number,
        address: payload.address,
        phone_number: payload.phone_number,
        email: payload.email,
        customer_level_id: payload.customer_level_id,
      };

      const updated = await updateCustomer(customer.id, updatePayload);
      setCustomer(updated);
      setDialogOpen(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update customer:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/customers")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chi tiết khách hàng
            </h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết và lịch sử giao dịch
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Customer Info Card */}
      <CustomerInfoCard customer={customer} onEdit={handleEditClick} />

      {/* Tabs */}
      <CustomerDetailTabs
        customer={customer}
        bookings={bookings}
        invoices={invoices}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
      />

      {/* Edit Dialog */}
      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={customer}
        onSave={handleSaveFromDialog}
      />
    </div>
  );
}
