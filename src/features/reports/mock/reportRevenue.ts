import {
  invoices as baseInvoices,
  courtBookings as baseBookings,
  serviceBookings as baseServiceBookings,
  serviceBookingItems as baseItems,
  branchServices,
  services,
  courts,
  branches,
  courtTypes,
  Invoice,
  CourtBooking,
  ServiceBooking,
  ServiceBookingItem,
} from "@/mock";
import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  subMonths,
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subDays,
} from "date-fns";

// --- Extended Mock Data Generation ---

export interface RefundInfo {
  id: number;
  invoice_id?: number;
  court_booking_id?: number;
  amount: number;
  reason: string;
  created_at: string;
}

export interface InvoiceDiscount {
  id: number;
  invoice_id: number;
  amount: number;
  description: string;
}

let cachedMockData: {
  invoices: Invoice[];
  bookings: CourtBooking[];
  serviceBookings: ServiceBooking[];
  items: ServiceBookingItem[];
  refunds: RefundInfo[];
  discounts: InvoiceDiscount[];
} | null = null;

function generateMockRevenueReportData() {
  if (cachedMockData) return cachedMockData;

  const invoices: Invoice[] = [...baseInvoices];
  const bookings: CourtBooking[] = [...baseBookings];
  const serviceBookingsArr: ServiceBooking[] = [...baseServiceBookings];
  const items: ServiceBookingItem[] = [...baseItems];
  const refunds: RefundInfo[] = [];
  const discounts: InvoiceDiscount[] = [];

  // Generate data for last 12 months
  const today = new Date();
  const startDate = subMonths(today, 12);
  const endDate = today;

  let invIdCounter = 3000;
  let bookIdCounter = 3000;
  let servBookIdCounter = 3000;
  let itemIdCounter = 3000;
  let refundIdCounter = 1;
  let discountIdCounter = 1;

  // Generate ~500 transactions
  for (let i = 0; i < 500; i++) {
    const date = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );
    const dateIso = date.toISOString();

    const court = courts[Math.floor(Math.random() * courts.length)];
    const type = Math.random() > 0.3 ? "Direct" : "Online"; // 70% direct

    const bookingId = bookIdCounter++;
    const booking: CourtBooking = {
      id: bookingId,
      created_at: dateIso,
      type: type as "Direct" | "Online",
      status: "Paid", // default
      customer_id: 1, // dummy
      employee_id: 1, // dummy
      court_id: court.id,
    };
    bookings.push(booking);

    // Booking Amount
    const duration = 1 + Math.floor(Math.random() * 2); // 1-3 hours
    const bookingAmount = court.base_hourly_price * duration;

    // Service Usage (50% chance)
    let serviceAmount = 0;
    let sbId = null;

    if (Math.random() > 0.5) {
      sbId = servBookIdCounter++;
      serviceBookingsArr.push({
        id: sbId,
        status: "Completed",
        court_booking_id: bookingId,
        employee_id: 1,
      });

      // Add 1-2 items
      const itemCount = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < itemCount; k++) {
        // Pick random branch service
        const bs =
          branchServices[Math.floor(Math.random() * branchServices.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({
          id: itemIdCounter++,
          quantity: qty,
          start_time: dateIso,
          end_time: dateIso,
          service_booking_id: sbId,
          branch_service_id: bs.id,
        });
        serviceAmount += bs.unit_price * qty;
      }
    }

    let totalAmount = bookingAmount + serviceAmount;
    let status = "Paid";
    let paymentMethod = ["Cash", "Transfer", "E-Wallet", "Card"][
      Math.floor(Math.random() * 4)
    ];

    // Simulate Cancel/Refund/Discount
    const rand = Math.random();
    if (rand > 0.95) {
      status = "Cancelled";
      booking.status = "Cancelled";
    } else if (rand > 0.9) {
      status = "Refunded";
      booking.status = "Cancelled"; // Refund implies cancellation usually or partial
      refunds.push({
        id: refundIdCounter++,
        amount: totalAmount * 0.8, // 80% refund
        reason: "Khách hủy sớm",
        court_booking_id: bookingId,
        created_at: dateIso,
      });
    } else if (rand > 0.85) {
      // Discount
      const discountVal = totalAmount * 0.1; // 10%
      discounts.push({
        id: discountIdCounter++,
        invoice_id: invIdCounter, // will assume next id
        amount: discountVal,
        description: "Khách VIP",
      });
      totalAmount -= discountVal;
    }

    // Create Invoice
    // Sometimes we have separate invoice for service, but usually combined in reports
    // Mock data structure supports 1 invoice linking both
    invoices.push({
      id: invIdCounter++,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      status: status,
      created_at: dateIso,
      court_booking_id: bookingId,
      service_booking_id: sbId,
    });
  }

  cachedMockData = {
    invoices,
    bookings,
    serviceBookings: serviceBookingsArr,
    items,
    refunds,
    discounts,
  };
  return cachedMockData;
}

// --- Filter Logic ---

export interface RevenueReportFilter {
  branchId: number | null;
  dateRange: { from: Date; to: Date } | undefined;
  revenueSource: "All" | "Court" | "Service";
  paymentMethod: string; // "All", "Cash", ...
  status: "All" | "Paid" | "Pending" | "Refunded" | "Cancelled";
}

function filterData(filter: RevenueReportFilter) {
  const { invoices, bookings, serviceBookings, items, refunds, discounts } =
    generateMockRevenueReportData();

  const filteredInvoices = invoices.filter((inv) => {
    const date = new Date(inv.created_at);

    // Date Range
    if (filter.dateRange?.from && filter.dateRange?.to) {
      if (
        !isWithinInterval(date, {
          start: startOfDay(filter.dateRange.from),
          end: endOfDay(filter.dateRange.to),
        })
      ) {
        return false;
      }
    }

    // Branch Filter (via Court Booking)
    if (filter.branchId) {
      // Find related booking to check court -> branch
      let branchMatch = false;
      if (inv.court_booking_id) {
        const b = bookings.find((x) => x.id === inv.court_booking_id);
        if (b) {
          const c = courts.find((cx) => cx.id === b.court_id);
          if (c && c.branch_id === filter.branchId) branchMatch = true;
        }
      }
      if (!branchMatch) return false;
    }

    // Payment Method
    if (
      filter.paymentMethod !== "All" &&
      inv.payment_method !== filter.paymentMethod
    )
      return false;

    // Status
    if (filter.status !== "All" && inv.status !== filter.status) return false;

    return true;
  });

  const filteredInvIds = new Set(filteredInvoices.map((i) => i.id));

  // Filter related entities
  const relevantDiscounts = discounts.filter((d) =>
    filteredInvIds.has(d.invoice_id)
  );
  // Refunds are a bit tricky as they might not have a "Paid" invoice, or linked differently.
  // We'll filter refunds by date range and branch logic separately or link to bookings

  const relevantRefunds = refunds.filter((r) => {
    const date = new Date(r.created_at);
    if (filter.dateRange?.from && filter.dateRange?.to) {
      if (
        !isWithinInterval(date, {
          start: startOfDay(filter.dateRange.from),
          end: endOfDay(filter.dateRange.to),
        })
      ) {
  return false;
}
    }
    // Branch check
    if (filter.branchId && r.court_booking_id) {
      const b = bookings.find((x) => x.id === r.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      if (c?.branch_id !== filter.branchId) return false;
    }
    return true;
  });

  return {
    filteredInvoices,
    relevantDiscounts,
    relevantRefunds,
    allBookings: bookings,
    allItems: items,
    allServiceBookings: serviceBookings,
  };
}

// --- KPIs ---

export function getRevenueKPIs(filter: RevenueReportFilter) {
  const { filteredInvoices, relevantDiscounts, relevantRefunds, allBookings } =
    filterData(filter);

  // We need to separate Court vs Service revenue
  // In our mock: Invoice total = Court + Service - Discount.
  // But "filteredInvoices" has the final total.
  // To be precise, we should re-calculate components if possible, or estimate.
  // Mock invoice structure doesn't store "court_amount" and "service_amount" separately.
  // We will reconstruct from bookings.

  let totalRevenue = 0;
  let courtRevenue = 0;
  let serviceRevenue = 0;
  let paidCount = 0;

  filteredInvoices.forEach((inv) => {
    if (inv.status === "Paid") {
      totalRevenue += inv.total_amount;
      paidCount++;

      // Estimate split (Logic: recalculate court price)
      if (inv.court_booking_id) {
        const b = allBookings.find((x) => x.id === inv.court_booking_id);
        const c = courts.find((cx) => cx.id === b?.court_id);
        // Duration is tricky to know without slots in this context,
        // but we can assume if service_booking_id is null, it's all court.
        // If both exist, we can subtract estimated service cost?
        // For Mock simplicity:
        // If both exist: 80% court, 20% service (heuristic)
        // If only court: 100% court
        // If only service (rare here): 100% service

        if (inv.service_booking_id) {
          courtRevenue += inv.total_amount * 0.8;
          serviceRevenue += inv.total_amount * 0.2;
        } else {
          courtRevenue += inv.total_amount;
        }
      }
    }
  });

  const totalInvoices = filteredInvoices.length;
  const paidPercentage =
    totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;

  const totalDiscount = relevantDiscounts.reduce((acc, d) => acc + d.amount, 0);
  const totalRefund = relevantRefunds.reduce((acc, r) => acc + r.amount, 0);

  return {
    totalRevenue,
    courtRevenue,
    serviceRevenue,
    totalInvoices,
    paidPercentage,
    totalDiscount,
    totalRefund,
  };
}

// --- Charts ---

export function getRevenueOverTime(filter: RevenueReportFilter) {
  const { filteredInvoices } = filterData(filter);
  // Group by day or month depending on range duration
  // If range > 31 days -> Month, else Day
  const diffDays =
    filter.dateRange?.from && filter.dateRange?.to
      ? (filter.dateRange.to.getTime() - filter.dateRange.from.getTime()) /
        (1000 * 3600 * 24)
      : 30;

  const dataMap = new Map<string, number>();

  filteredInvoices.forEach((inv) => {
    if (inv.status !== "Paid") return;
    const date = new Date(inv.created_at);
    const key = diffDays > 35 ? format(date, "MM/yyyy") : format(date, "dd/MM");
    dataMap.set(key, (dataMap.get(key) || 0) + inv.total_amount);
  });

  // Sort keys properly? For MM/yyyy, string sort works if year is same, otherwise needs Date parsing.
  // For now just return array
  return Array.from(dataMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

export function getRevenueByCourtType(filter: RevenueReportFilter) {
  const { filteredInvoices, allBookings } = filterData(filter);
  const map = new Map<string, number>();

  filteredInvoices.forEach((inv) => {
    if (inv.status !== "Paid") return;
    if (inv.court_booking_id) {
      const b = allBookings.find((x) => x.id === inv.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      const typeName =
        courtTypes.find((t) => t.id === c?.court_type_id)?.name || "Unknown";
      map.set(typeName, (map.get(typeName) || 0) + inv.total_amount);
    }
  });

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getServiceRevenueShare(filter: RevenueReportFilter) {
  const { filteredInvoices, allItems, allServiceBookings } = filterData(filter);

  const typeMap = new Map<string, number>();

  // We need to dive into service items to get rental_type
  // Find paid service bookings
  const paidServiceBookingIds = new Set<number>();
  filteredInvoices.forEach((inv) => {
    if (inv.status === "Paid" && inv.service_booking_id) {
      paidServiceBookingIds.add(inv.service_booking_id);
    }
  });

  allItems.forEach((item) => {
    if (paidServiceBookingIds.has(item.service_booking_id)) {
      const bs = branchServices.find((x) => x.id === item.branch_service_id);
      const s = services.find((x) => x.id === bs?.service_id);
      if (s) {
        const amount = (bs?.unit_price || 0) * item.quantity;
        typeMap.set(s.rental_type, (typeMap.get(s.rental_type) || 0) + amount);
      }
    }
  });

  return Array.from(typeMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

// --- Data Table ---

export function getRevenueByBranchTable(filter: RevenueReportFilter) {
  const { filteredInvoices, relevantRefunds, allBookings } = filterData(filter);

  // Group by branch
  const branchMap = new Map<
    number,
    {
      revenue: number;
      courtRev: number;
      serviceRev: number;
      invoiceCount: number;
      refundCount: number;
      refundAmount: number;
    }
  >();

  branches.forEach((b) => {
    branchMap.set(b.id, {
      revenue: 0,
      courtRev: 0,
      serviceRev: 0,
      invoiceCount: 0,
      refundCount: 0,
      refundAmount: 0,
    });
  });

  filteredInvoices.forEach((inv) => {
    if (inv.court_booking_id) {
      const b = allBookings.find((x) => x.id === inv.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      if (c && branchMap.has(c.branch_id)) {
        const entry = branchMap.get(c.branch_id)!;
        if (inv.status === "Paid") {
          entry.revenue += inv.total_amount;
          // Approx split
          if (inv.service_booking_id) {
            entry.courtRev += inv.total_amount * 0.8;
            entry.serviceRev += inv.total_amount * 0.2;
          } else {
            entry.courtRev += inv.total_amount;
          }
        }
        entry.invoiceCount++;
      }
    }
  });

  relevantRefunds.forEach((r) => {
    if (r.court_booking_id) {
      const b = allBookings.find((x) => x.id === r.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      if (c && branchMap.has(c.branch_id)) {
        const entry = branchMap.get(c.branch_id)!;
        entry.refundCount++;
        entry.refundAmount += r.amount;
      }
    }
  });

  return branches.map((b) => {
    const stats = branchMap.get(b.id)!;
    return {
      id: b.id,
      name: b.name,
      ...stats,
    };
  });
}

export function getRevenueByCourtTypeTable(filter: RevenueReportFilter) {
  const { filteredInvoices, allBookings } = filterData(filter);
  const map = new Map<
    number,
    { name: string; revenue: number; bookingCount: number }
  >();

  filteredInvoices.forEach((inv) => {
    if (inv.status !== "Paid") return;
    if (inv.court_booking_id) {
      const b = allBookings.find((x) => x.id === inv.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      const type = courtTypes.find((t) => t.id === c?.court_type_id);
      if (type) {
        const entry = map.get(type.id) || {
          name: type.name,
          revenue: 0,
          bookingCount: 0,
        };
        entry.revenue += inv.total_amount;
        entry.bookingCount += 1;
        map.set(type.id, entry);
      }
    }
  });

  return Array.from(map.values())
    .map((item) => ({
      id: item.name,
      ...item,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getRevenueByServiceTable(filter: RevenueReportFilter) {
  const { filteredInvoices, allItems, allServiceBookings } = filterData(filter);

  const serviceMap = new Map<
    number,
    {
      name: string;
      revenue: number;
      quantity: number;
      topBranch: string;
      branchMap: Map<number, number>;
    }
  >();

  // Find paid service bookings
  const paidServiceBookingIds = new Set<number>();
  filteredInvoices.forEach((inv) => {
    if (inv.status === "Paid" && inv.service_booking_id) {
      paidServiceBookingIds.add(inv.service_booking_id);
    }
  });

  // Aggregate by service
  allItems.forEach((item) => {
    if (paidServiceBookingIds.has(item.service_booking_id)) {
      const bs = branchServices.find((x) => x.id === item.branch_service_id);
      const s = services.find((x) => x.id === bs?.service_id);
      if (s && bs) {
        const amount = bs.unit_price * item.quantity;
        const entry = serviceMap.get(s.id) || {
          name: s.name,
          revenue: 0,
          quantity: 0,
          topBranch: "",
          branchMap: new Map<number, number>(),
        };
        entry.revenue += amount;
        entry.quantity += item.quantity;
        entry.branchMap.set(
          bs.branch_id,
          (entry.branchMap.get(bs.branch_id) || 0) + amount
        );
        serviceMap.set(s.id, entry);
      }
    }
  });

  // Find top branch for each service
  return Array.from(serviceMap.entries())
    .map(([id, entry]) => {
      let topBranchName = "";
      let topAmount = 0;
      entry.branchMap.forEach((amount, branchId) => {
        if (amount > topAmount) {
          topAmount = amount;
          const branch = branches.find((b) => b.id === branchId);
          topBranchName = branch?.name || "";
        }
      });
      return {
        id,
        name: entry.name,
        revenue: entry.revenue,
        quantity: entry.quantity,
        topBranch: topBranchName,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function getRevenueByBranchStacked(filter: RevenueReportFilter) {
  const { filteredInvoices, allBookings } = filterData(filter);

  const branchData = branches.map((b) => ({
    name: b.name,
    courtRevenue: 0,
    serviceRevenue: 0,
  }));

  filteredInvoices.forEach((inv) => {
    if (inv.status !== "Paid") return;
    if (inv.court_booking_id) {
      const b = allBookings.find((x) => x.id === inv.court_booking_id);
      const c = courts.find((cx) => cx.id === b?.court_id);
      if (c) {
        const idx = branchData.findIndex((bd) => {
          const branch = branches.find((br) => br.name === bd.name);
          return branch?.id === c.branch_id;
        });
        if (idx !== -1) {
          // Split estimation
          if (inv.service_booking_id) {
            branchData[idx].courtRevenue += inv.total_amount * 0.8;
            branchData[idx].serviceRevenue += inv.total_amount * 0.2;
          } else {
            branchData[idx].courtRevenue += inv.total_amount;
          }
        }
      }
    }
  });

  return branchData.filter((bd) => bd.courtRevenue + bd.serviceRevenue > 0);
}

// Section: Cancelled / NoShow
export function getCancellationStats(filter: RevenueReportFilter) {
  const { allBookings, relevantRefunds } = filterData(filter);
  // We need to filter bookings by date range & branch similar to invoices,
  // but "allBookings" returned by filterData was NOT filtered.
  // Let's re-filter bookings for this specific stat.

  let relevantBookings = allBookings.filter((b) => {
    const date = new Date(b.created_at);
    if (filter.dateRange?.from && filter.dateRange?.to) {
      if (
        !isWithinInterval(date, {
          start: startOfDay(filter.dateRange.from),
          end: endOfDay(filter.dateRange.to),
        })
      ) {
        return false;
      }
    }
    if (filter.branchId) {
      const c = courts.find((cx) => cx.id === b.court_id);
      if (c?.branch_id !== filter.branchId) return false;
    }
    return true;
  });

  const cancelled = relevantBookings.filter(
    (b) => b.status === "Cancelled"
  ).length;
  // Mock NoShow (subset of cancelled)
  const noShow = Math.round(cancelled * 0.3);

  const refundAmount = relevantRefunds.reduce((acc, r) => acc + r.amount, 0);
  // Lost revenue estimate
  const lostRevenue = relevantBookings
    .filter((b) => b.status === "Cancelled")
    .reduce((acc, b) => {
      const c = courts.find((cx) => cx.id === b.court_id);
      return acc + (c?.base_hourly_price || 0); // 1 hour assumption
    }, 0);

      return {
    cancelledCount: cancelled,
    noShowCount: noShow,
    refundAmount,
    lostRevenue,
  };
}
