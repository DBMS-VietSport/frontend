import { invoices } from "../../../mock/data";
import type { Invoice } from "../../../mock/types";

export const invoiceRepo = {
  list: (): Invoice[] => invoices,
  findById: (id: number): Invoice | null =>
    invoices.find((i) => i.id === id) || null,
};
