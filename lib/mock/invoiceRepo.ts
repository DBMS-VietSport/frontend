import { invoices } from "./data";
import type { Invoice } from "./types";

export const invoiceRepo = {
  list: (): Invoice[] => invoices,
  findById: (id: number): Invoice | null =>
    invoices.find((i) => i.id === id) || null,
};
