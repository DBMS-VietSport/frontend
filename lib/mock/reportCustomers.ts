import {
  customers as baseCustomers,
  customerLevels,
  courtBookings as baseBookings,
  invoices as baseInvoices,
  bookingSlots as baseSlots,
  courts,
  branches,
  Customer,
  CustomerLevel,
  CourtBooking,
  Invoice,
  BookingSlot,
} from "@/lib/mock";
import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";

// --- Extended Mock Data Generation ---

let cachedMockData: {
  customers: Customer[];
  bookings: CourtBooking[];
  invoices: Invoice[];
  slots: BookingSlot[];
} | null = null;

function generateMockCustomerReportData() {
  if (cachedMockData) return cachedMockData;

  const customers: Customer[] = [...baseCustomers];
  const bookings: CourtBooking[] = [...baseBookings];
  const invoices: Invoice[] = [...baseInvoices];
  const slots: BookingSlot[] = [...baseSlots];

  // Generate more customers (~50)
  let customerIdCounter = 100;
  const now = new Date();
  const startDate = subMonths(now, 12);

  for (let i = 0; i < 50; i++) {
    const joinDate = new Date(
      startDate.getTime() +
        Math.random() * (now.getTime() - startDate.getTime())
    );
    const gender = Math.random() > 0.3 ? "Nam" : "Nữ";
    const level =
      customerLevels[Math.floor(Math.random() * customerLevels.length)];

    customers.push({
      id: customerIdCounter++,
      full_name: `Khách hàng ${i + 1}`,
      dob: "1990-01-01",
      gender,
      id_card_number: `ID${i}`,
      address: "HCM",
      phone_number: `090${Math.floor(Math.random() * 10000000)}`,
      email: `khach${i}@example.com`,
      customer_level_id: level.id,
      user_id: `user${i}`,
      bonus_point: Math.floor(Math.random() * 5000),
      // @ts-ignore - injecting created_at for report purposes
      created_at: joinDate.toISOString(),
    });
  }

  // Generate bookings/invoices for these customers
  let bookingIdCounter = 2000;
  let invoiceIdCounter = 2000;
  let slotIdCounter = 2000;

  // Distribute ~300 bookings across customers
  for (let i = 0; i < 300; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];

    // Booking date (after customer joined)
    // @ts-ignore
    const joinDate = customer.created_at
      ? new Date(customer.created_at)
      : startDate;
    const bookingDate = new Date(
      joinDate.getTime() + Math.random() * (now.getTime() - joinDate.getTime())
    );

    const court = courts[Math.floor(Math.random() * courts.length)];
    const durationMinutes = [60, 90, 120][Math.floor(Math.random() * 3)];
    const endTime = new Date(bookingDate.getTime() + durationMinutes * 60000);

    const bookingId = bookingIdCounter++;

    bookings.push({
      id: bookingId,
      created_at: bookingDate.toISOString(),
      type: Math.random() > 0.5 ? "Online" : "Direct",
      status: "Paid",
      customer_id: customer.id,
      employee_id: null,
      court_id: court.id,
    });

    slots.push({
      id: slotIdCounter++,
      start_time: bookingDate.toISOString(),
      end_time: endTime.toISOString(),
      status: "Confirmed",
      court_booking_id: bookingId,
    });

    invoices.push({
      id: invoiceIdCounter++,
      total_amount: (court.base_hourly_price * durationMinutes) / 60,
      payment_method: Math.random() > 0.5 ? "Cash" : "Transfer",
      status: "Paid",
      created_at: bookingDate.toISOString(),
      court_booking_id: bookingId,
      service_booking_id: null,
    });
  }

  cachedMockData = { customers, bookings, invoices, slots };
  return cachedMockData;
}

// --- Filter Logic ---

export interface CustomerReportFilter {
  dateRange: { from: Date; to: Date } | undefined;
  branchIds: number[];
  levelIds: number[];
  gender: "All" | "Nam" | "Nữ";
}

function filterData(filter: CustomerReportFilter) {
  const { customers, bookings, invoices, slots } =
    generateMockCustomerReportData();

  // 1. Filter Bookings & Invoices by Date Range & Branch
  // Note: Branch filter applies to Bookings (via Court -> Branch)

  const filteredBookings = bookings.filter((b) => {
    const date = new Date(b.created_at);

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

    // Branch
    if (filter.branchIds.length > 0) {
      const court = courts.find((c) => c.id === b.court_id);
      if (!court || !filter.branchIds.includes(court.branch_id)) {
        return false;
      }
    }

    return true;
  });

  const filteredBookingIds = new Set(filteredBookings.map((b) => b.id));
  const filteredInvoices = invoices.filter(
    (i) => i.court_booking_id && filteredBookingIds.has(i.court_booking_id)
  );
  const filteredSlots = slots.filter((s) =>
    filteredBookingIds.has(s.court_booking_id)
  );

  // Identify active customers in this filtered period/scope
  // OR do we filter customers based on their attributes (Level, Gender)?
  // The requirements say "Filter Level, Gender".
  // Usually, these filters restrict WHICH customers we look at,
  // AND Date/Branch restricts WHICH TRANSACTIONS we count for them.

  let relevantCustomers = customers.filter((c) => {
    if (
      filter.levelIds.length > 0 &&
      !filter.levelIds.includes(c.customer_level_id)
  )
    return false;
    if (filter.gender !== "All" && c.gender !== filter.gender) return false;
  return true;
  });

  const relevantCustomerIds = new Set(relevantCustomers.map((c) => c.id));

  // Refine bookings/invoices to only include relevant customers
  const finalBookings = filteredBookings.filter((b) =>
    relevantCustomerIds.has(b.customer_id)
  );
  const finalBookingIds = new Set(finalBookings.map((b) => b.id));
  const finalInvoices = filteredInvoices.filter(
    (i) => i.court_booking_id && finalBookingIds.has(i.court_booking_id)
  );
  const finalSlots = filteredSlots.filter((s) =>
    finalBookingIds.has(s.court_booking_id)
  );

  return {
    customers: relevantCustomers,
    bookings: finalBookings,
    invoices: finalInvoices,
    slots: finalSlots,
  };
}

// --- KPIs ---

export function getCustomerReportKPIs(filter: CustomerReportFilter) {
  const { customers, bookings, invoices } = filterData(filter);

  // Active customers: Customers with at least 1 booking in the filtered set
  const activeCustomerIds = new Set(bookings.map((b) => b.customer_id));
  const activeCount = activeCustomerIds.size;

  // New Customers: Customers whose "created_at" is within the date range
  // For base customers without created_at, we assume they are old unless we polyfilled it.
  // In our mock gen, we polyfilled created_at.
  let newCount = 0;
  if (filter.dateRange?.from && filter.dateRange?.to) {
    const { from, to } = filter.dateRange;
    newCount = customers.filter((c) => {
      // @ts-ignore
      if (!c.created_at) return false;
      // @ts-ignore
      const d = new Date(c.created_at);
      return isWithinInterval(d, {
        start: startOfDay(from),
        end: endOfDay(to),
      });
    }).length;
  } else {
    // If no date range, maybe "new this year"? Default to all created in mock generation (last 12 months)
    newCount = customers.filter((c) => (c as any).created_at).length;
  }

  const totalRevenue = invoices.reduce((acc, i) => acc + i.total_amount, 0);

  // Avg Revenue per Active Customer
  const arpc = activeCount > 0 ? totalRevenue / activeCount : 0;

  const totalPoints = customers.reduce((acc, c) => acc + c.bonus_point, 0);
  const avgPoints = customers.length > 0 ? totalPoints / customers.length : 0;

  return {
    activeCount,
    newCount,
    totalRevenue,
    arpc,
    totalPoints,
    avgPoints,
    totalCustomersInFilter: customers.length,
  };
}

// --- Charts ---

export function getNewCustomersTrend(filter: CustomerReportFilter) {
  const { customers } = generateMockCustomerReportData(); // We want trend regardless of transaction filters usually, or filtered by attributes

  // Apply customer attribute filters (Gender, Level) but NOT Date Range (since we show trend over time)
  // However, usually trend charts are bounded by the selected year or range.
  // Let's respect the Date Range if provided, or default to last 12 months.

  let rangeStart = filter.dateRange?.from || subMonths(new Date(), 12);
  let rangeEnd = filter.dateRange?.to || new Date();

  if (rangeStart > rangeEnd) {
    const temp = rangeStart;
    rangeStart = rangeEnd;
    rangeEnd = temp;
  }

  const relevantCustomers = customers.filter((c) => {
    if (
      filter.levelIds.length > 0 &&
      !filter.levelIds.includes(c.customer_level_id)
    )
      return false;
    if (filter.gender !== "All" && c.gender !== filter.gender) return false;
    return true;
  });

  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  return months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    const count = relevantCustomers.filter((c) => {
      // @ts-ignore
      if (!c.created_at) return false;
      // @ts-ignore
      const d = new Date(c.created_at);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    }).length;

    return {
      name: format(monthStart, "MM/yyyy"),
      value: count,
    };
  });
}

export function getTopCustomers(filter: CustomerReportFilter, limit = 10) {
  const { customers, invoices } = filterData(filter);

  // Map customer ID to revenue
  const revMap = new Map<number, number>();
  invoices.forEach((inv) => {
    // Find booking to get customer
    // In our generated invoices, we might not have direct link if we don't join.
    // But filterData returns consistent sets.
    // We need to re-find the customer for the invoice to be sure?
    // Actually `invoices` from filterData are already filtered.
    // But invoice object has `court_booking_id`.
    const booking = generateMockCustomerReportData().bookings.find(
      (b) => b.id === inv.court_booking_id
    );
    if (booking) {
      revMap.set(
        booking.customer_id,
        (revMap.get(booking.customer_id) || 0) + inv.total_amount
      );
    }
  });

  return (
    Array.from(revMap.entries())
      .map(([id, revenue]) => {
        const c = customers.find((cx) => cx.id === id);
        if (!c) return null;
      return {
          name: c.full_name,
          revenue,
          id: c.id,
        };
      })
      .filter((x) => x !== null)
      // @ts-ignore
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  );
}

export function getLevelDistribution(filter: CustomerReportFilter) {
  const { customers } = filterData(filter);
  const dist = new Map<string, number>();

  customers.forEach((c) => {
    const lvl =
      customerLevels.find((l) => l.id === c.customer_level_id)?.name ||
      "Unknown";
    dist.set(lvl, (dist.get(lvl) || 0) + 1);
  });

  return Array.from(dist.entries()).map(([name, value]) => ({ name, value }));
}

// --- Data Table ---

export function getCustomerDetailsTable(filter: CustomerReportFilter) {
  const { customers, bookings, invoices, slots } = filterData(filter);

  return customers.map((c) => {
    const customerBookings = bookings.filter((b) => b.customer_id === c.id);
    const bookingIds = new Set(customerBookings.map((b) => b.id));

    const customerInvoices = invoices.filter(
      (i) => i.court_booking_id && bookingIds.has(i.court_booking_id)
    );
    const customerSlots = slots.filter((s) =>
      bookingIds.has(s.court_booking_id)
    );

    const totalRevenue = customerInvoices.reduce(
      (acc, i) => acc + i.total_amount,
      0
    );
    const totalHours = customerSlots.reduce(
      (acc, s) =>
        acc +
        (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
          3600000,
      0
    );

    // Last booking
    let lastBookingDate = null;
    if (customerBookings.length > 0) {
      const sorted = customerBookings.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastBookingDate = sorted[0].created_at;
    }

    const levelName =
      customerLevels.find((l) => l.id === c.customer_level_id)?.name || "";

  return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone_number: c.phone_number,
      level: levelName,
      points: c.bonus_point,
      bookingCount: customerBookings.length,
      totalHours: Math.round(totalHours * 10) / 10,
    totalRevenue,
      lastBooking: lastBookingDate,
  };
  });
}
