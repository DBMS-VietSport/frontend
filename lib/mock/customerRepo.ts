import { customers, customerLevels } from "./data";
import type { Customer } from "./types";
import { nextId } from "./id-utils";

export const customerRepo = {
  list: () => customers,
  findById: (id: number) => customers.find((c) => c.id === id) || null,
  search: (q: string) => {
    const s = q.toLowerCase();
    return customers.filter(
      (c) => c.full_name.toLowerCase().includes(s) || c.phone_number.includes(q)
    );
  },
  create: (payload: Omit<Customer, "id">) => {
    const newCustomer: Customer = { id: nextId(), ...payload };
    customers.push(newCustomer);
    return newCustomer;
  },
  update: (id: number, payload: Partial<Customer>) => {
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], ...payload };
    return customers[idx];
  },
  getLevels: () => customerLevels,
};
