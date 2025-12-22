// Mock repository for manager invoice operations
import {
  listBookings,
  getInvoicesFor,
  getServicesFor,
} from "@/lib/booking/mockRepo";
import {
  mockBranches,
  mockCourts,
  mockCustomers,
  mockServices,
  mockBranchServices,
  mockEmployees,
} from "@/lib/booking/mockRepo";
import { MOCK_USERS } from "@/lib/mock/authMock";
import type { Invoice, CourtBooking } from "@/lib/types";

// Extended invoice with additional fields for management
export interface InvoiceDetail extends Invoice {
  code: string;
  customerName: string;
  customerId: number;
  cashierName?: string;
  cashierId?: number;
  branchName?: string;
  courtName?: string;
  bookingCode?: string;
  services?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  discountAmount?: number;
  discountPercent?: number;
  cancelReason?: string;
  refundAmount?: number;
  refundReason?: string;
  notes?: string;
}

export interface InvoiceSearchFilters {
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
  cashierName?: string;
  status?: "all" | "Paid" | "Unpaid" | "Cancelled" | "Refunded";
  searchText?: string; // For invoice code or customer name
}

export interface InvoiceSearchResult {
  id: number;
  code: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  cashierName?: string;
  createdAt: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalPaid: number;
  totalUnpaid: number;
  totalCancelled: number;
  totalRefunded: number;
}

// In-memory store for invoice metadata (cancellations, refunds, etc.)
interface InvoiceMetadata {
  invoiceId: number;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  refundedBy?: string;
  notes?: string;
}

let invoiceMetadata: InvoiceMetadata[] = [];

// Get all invoices (from booking repo + cashier invoices)
// Note: In a real app, all invoices would be in the same database
// For mock, we combine invoices from bookings and cashier-created invoices
async function getAllInvoices(): Promise<Invoice[]> {
  const allBookings = await listBookings();
  const allInvoices: Invoice[] = [];

  // Get invoices from bookings
  for (const booking of allBookings) {
    const invoices = await getInvoicesFor(booking.id);
    allInvoices.push(...invoices);
  }

  // Note: Cashier invoices created via invoiceCashierRepo are stored separately
  // In a real app, they would all be in the same table
  // For now, we'll work with booking invoices only
  // Cashier invoices can be added later if needed

  return allInvoices;
}

// Generate invoice code
function generateInvoiceCode(id: number, createdAt: string): string {
  const date = new Date(createdAt);
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  return `IN-${id}-${dateStr}`;
}

// Search invoices with filters
export async function searchInvoices(
  filters: InvoiceSearchFilters
): Promise<InvoiceSearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allInvoices = await getAllInvoices();
  const allBookings = await listBookings();

  // Apply filters
  let filtered = allInvoices;

  // Date filter
  if (filters.dateFrom) {
    const dateFrom = new Date(filters.dateFrom);
    dateFrom.setHours(0, 0, 0, 0);
    filtered = filtered.filter((inv) => {
      if (!inv.created_at) return false;
      const invDate = new Date(inv.created_at);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() >= dateFrom.getTime();
    });
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo);
    dateTo.setHours(23, 59, 59, 999);
    filtered = filtered.filter((inv) => {
      if (!inv.created_at) return false;
      const invDate = new Date(inv.created_at);
      return invDate.getTime() <= dateTo.getTime();
    });
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }

  // Search text filter (invoice code or customer name)
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter((inv) => {
      // Check invoice code
      const code = generateInvoiceCode(inv.id, inv.created_at || "");
      if (code.toLowerCase().includes(searchLower)) return true;

      // Check customer name
      const booking = allBookings.find(
        (b) => b.id === inv.court_booking_id || b.id === inv.service_booking_id
      );
      if (booking) {
        const customer = mockCustomers.find(
          (c) => c.id === booking.customer_id
        );
        if (
          customer &&
          customer.full_name.toLowerCase().includes(searchLower)
        ) {
          return true;
        }
      }

      return false;
    });
  }

  // Customer name filter
  if (filters.customerName) {
    const customerLower = filters.customerName.toLowerCase();
    filtered = filtered.filter((inv) => {
      const booking = allBookings.find(
        (b) => b.id === inv.court_booking_id || b.id === inv.service_booking_id
      );
      if (booking) {
        const customer = mockCustomers.find(
          (c) => c.id === booking.customer_id
        );
        if (
          customer &&
          customer.full_name.toLowerCase().includes(customerLower)
        ) {
          return true;
        }
      }
      return false;
    });
  }

  // Cashier filter (simplified - in real app would track who created the invoice)
  if (filters.cashierName) {
    // For mock, we'll randomly assign some invoices to cashiers
    // In real app, this would be tracked in the invoice record
    const cashierLower = filters.cashierName.toLowerCase();
    filtered = filtered.filter((inv) => {
      // Mock: assign based on invoice ID
      const cashiers = MOCK_USERS.filter((u) => u.role === "cashier");
      const assignedCashier = cashiers[inv.id % cashiers.length];
      return (
        assignedCashier &&
        assignedCashier.fullName.toLowerCase().includes(cashierLower)
      );
    });
  }

  // Transform to InvoiceSearchResult
  const results: InvoiceSearchResult[] = [];

  for (const invoice of filtered) {
    const booking = allBookings.find(
      (b) =>
        b.id === invoice.court_booking_id || b.id === invoice.service_booking_id
    );
    if (!booking) continue;

    const customer = mockCustomers.find((c) => c.id === booking.customer_id);
    if (!customer) continue;

    // Get cashier (mock assignment)
    const cashiers = MOCK_USERS.filter((u) => u.role === "cashier");
    const cashier = cashiers[invoice.id % cashiers.length];

    // Map payment method
    let paymentMethod = invoice.payment_method;
    if (paymentMethod === "Tiền mặt") paymentMethod = "Tiền mặt";
    else if (paymentMethod === "Chuyển khoản") paymentMethod = "Chuyển khoản";
    else if (paymentMethod === "Thẻ") paymentMethod = "Thẻ";
    else if (paymentMethod === "Counter") paymentMethod = "Tiền mặt";
    else if (paymentMethod === "Bank Transfer") paymentMethod = "Chuyển khoản";

    results.push({
      id: invoice.id,
      code: generateInvoiceCode(invoice.id, invoice.created_at || ""),
      customerName: customer.full_name,
      totalAmount: invoice.total_amount,
      paymentMethod,
      status: invoice.status,
      cashierName: cashier?.fullName,
      createdAt: invoice.created_at || new Date().toISOString(),
    });
  }

  // Sort by created_at desc
  results.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return results;
}

// Get invoice detail
export async function getInvoiceDetail(
  invoiceId: number
): Promise<InvoiceDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const allInvoices = await getAllInvoices();
  const invoice = allInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) return null;

  const allBookings = await listBookings();
  const booking = allBookings.find(
    (b) =>
      b.id === invoice.court_booking_id || b.id === invoice.service_booking_id
  );
  if (!booking) return null;

  const customer = mockCustomers.find((c) => c.id === booking.customer_id);
  if (!customer) return null;

  // Get court info if available
  let courtName: string | undefined;
  let branchName: string | undefined;
  if (invoice.court_booking_id) {
    const court = mockCourts.find((c) => c.id === booking.court_id);
    if (court) {
      courtName = court.name || `Sân ${court.id}`;
      const branch = mockBranches.find((b) => b.id === court.branch_id);
      if (branch) {
        branchName = branch.name;
      }
    }
  }

  // Get services
  const services: InvoiceDetail["services"] = [];
  if (invoice.service_booking_id) {
    const { items: serviceItems } = await getServicesFor(booking.id);
    for (const item of serviceItems) {
      const branchService = mockBranchServices.find(
        (bs) => bs.id === item.branch_service_id
      );
      if (!branchService) continue;

      const service = mockServices.find(
        (s) => s.id === branchService.service_id
      );
      if (!service) continue;

      services.push({
        name: service.name,
        quantity: item.quantity,
        unitPrice: branchService.unit_price,
        total: branchService.unit_price * item.quantity,
      });
    }
  }

  // Get metadata
  const metadata = invoiceMetadata.find((m) => m.invoiceId === invoiceId);

  // Get cashier
  const cashiers = MOCK_USERS.filter((u) => u.role === "cashier");
  const cashier = cashiers[invoice.id % cashiers.length];

  // Map payment method
  let paymentMethod = invoice.payment_method;
  if (paymentMethod === "Counter") paymentMethod = "Tiền mặt";
  else if (paymentMethod === "Bank Transfer") paymentMethod = "Chuyển khoản";
  else if (paymentMethod === "Card") paymentMethod = "Thẻ";

  // Generate booking code
  const bookingCode = `VS-${booking.id}-${booking.created_at
    .split("T")[0]
    .replace(/-/g, "")}`;

  return {
    ...invoice,
    code: generateInvoiceCode(invoice.id, invoice.created_at || ""),
    customerName: customer.full_name,
    customerId: customer.id,
    cashierName: cashier?.fullName,
    cashierId: cashier ? 1 : undefined, // Mock ID
    branchName,
    courtName,
    bookingCode,
    services: services.length > 0 ? services : undefined,
    cancelReason: metadata?.cancelReason,
    refundAmount: metadata?.refundAmount,
    refundReason: metadata?.refundReason,
    notes: metadata?.notes,
    payment_method: paymentMethod,
  };
}

// Cancel invoice
export async function cancelInvoice(
  invoiceId: number,
  reason: string,
  cancelledBy: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Update invoice status
  const allInvoices = await getAllInvoices();
  const invoice = allInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Store metadata
  const existingMetadata = invoiceMetadata.find(
    (m) => m.invoiceId === invoiceId
  );
  if (existingMetadata) {
    existingMetadata.cancelReason = reason;
    existingMetadata.cancelledAt = new Date().toISOString();
    existingMetadata.cancelledBy = cancelledBy;
  } else {
    invoiceMetadata.push({
      invoiceId,
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
      cancelledBy,
    });
  }

  // Update status (in real app, this would update the database)
  invoice.status = "Cancelled";
}

// Adjust/Refund invoice
export async function createRefund(
  invoiceId: number,
  amount: number,
  reason: string,
  refundedBy: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allInvoices = await getAllInvoices();
  const invoice = allInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (amount > invoice.total_amount) {
    throw new Error("Refund amount cannot exceed invoice total");
  }

  // Store metadata
  const existingMetadata = invoiceMetadata.find(
    (m) => m.invoiceId === invoiceId
  );
  if (existingMetadata) {
    existingMetadata.refundAmount = amount;
    existingMetadata.refundReason = reason;
    existingMetadata.refundedAt = new Date().toISOString();
    existingMetadata.refundedBy = refundedBy;
  } else {
    invoiceMetadata.push({
      invoiceId,
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date().toISOString(),
      refundedBy,
    });
  }

  // Update status
  if (amount === invoice.total_amount) {
    invoice.status = "Refunded";
  } else {
    invoice.status = "PartiallyRefunded";
  }
}

// Process refund (new function with reason type)
export async function processRefund(
  invoiceId: number,
  amount: number,
  reason: string,
  reasonType: string,
  refundedBy: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allInvoices = await getAllInvoices();
  const invoice = allInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (amount > invoice.total_amount) {
    throw new Error("Refund amount cannot exceed invoice total");
  }

  // Store metadata
  const existingMetadata = invoiceMetadata.find(
    (m) => m.invoiceId === invoiceId
  );
  if (existingMetadata) {
    existingMetadata.refundAmount = amount;
    existingMetadata.refundReason = reason;
    existingMetadata.refundedAt = new Date().toISOString();
    existingMetadata.refundedBy = refundedBy;
  } else {
    invoiceMetadata.push({
      invoiceId,
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date().toISOString(),
      refundedBy,
    });
  }

  // Update status
  if (amount === invoice.total_amount) {
    invoice.status = "Refunded";
  } else {
    invoice.status = "PartiallyRefunded";
  }
}

// Adjust invoice (mark as paid for unpaid invoices)
export async function adjustInvoice(
  invoiceId: number,
  payload: {
    status?: string;
    paymentMethod?: string;
    notes?: string;
  }
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const allInvoices = await getAllInvoices();
  const invoice = allInvoices.find((inv) => inv.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (payload.status) {
    invoice.status = payload.status;
  }

  if (payload.paymentMethod) {
    invoice.payment_method = payload.paymentMethod;
  }

  // Store notes
  const existingMetadata = invoiceMetadata.find(
    (m) => m.invoiceId === invoiceId
  );
  if (existingMetadata) {
    existingMetadata.notes = payload.notes;
  } else {
    invoiceMetadata.push({
      invoiceId,
      notes: payload.notes,
    });
  }
}

// Get summary totals
export async function getInvoiceSummary(
  filters: InvoiceSearchFilters
): Promise<InvoiceSummary> {
  const results = await searchInvoices(filters);

  const summary: InvoiceSummary = {
    totalInvoices: results.length,
    totalPaid: 0,
    totalUnpaid: 0,
    totalCancelled: 0,
    totalRefunded: 0,
  };

  for (const result of results) {
    if (result.status === "Paid") {
      summary.totalPaid += result.totalAmount;
    } else if (result.status === "Unpaid" || result.status === "Pending") {
      summary.totalUnpaid += result.totalAmount;
    } else if (result.status === "Cancelled") {
      summary.totalCancelled += result.totalAmount;
    } else if (
      result.status === "Refunded" ||
      result.status === "Partially Refunded"
    ) {
      summary.totalRefunded += result.totalAmount;
    }
  }

  return summary;
}

export const invoiceManagerRepo = {
  searchInvoices,
  getInvoiceDetail,
  cancelInvoice,
  createRefund,
  processRefund,
  adjustInvoice,
  getInvoiceSummary,
};
