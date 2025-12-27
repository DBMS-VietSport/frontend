import { employees, roles, accounts } from "../../../mock/data";
import type { Employee } from "../../../mock/types";
import { nextId } from "../../../mock/id-utils";

export interface EmployeeWithRole extends Employee {
  role_name?: string;
}

export const employeeRepo = {
  list: (): EmployeeWithRole[] =>
    employees.map((e) => ({
      ...e,
      role_name: roles.find((r) => r.id === (e.role_id || 0))?.name,
    })),
  findById: (id: number): EmployeeWithRole | null => {
    const e = employees.find((x) => x.id === id);
    if (!e) return null;
    return {
      ...e,
      role_name: roles.find((r) => r.id === (e.role_id || 0))?.name,
    };
  },
  create: (payload: Omit<Employee, "id">): Employee => {
    const newEmployee: Employee = { id: nextId(), ...payload };
    employees.push(newEmployee);
    return newEmployee;
  },
  update: (id: number, payload: Partial<Employee>): Employee | null => {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    employees[idx] = { ...employees[idx], ...payload };
    return employees[idx];
  },
  getRoles: () => roles,
  getAccounts: () => accounts,
};
