import { accounts, customers } from "./data";
import type { Account, Customer } from "./types";
import { nextId, nextGuid } from "./id-utils";
import { sharedPasswordStorage } from "./passwordStorage";

// Mock password storage (in real app, this would be hashed)
// Use shared storage so passwordResetRepo can access it
const accountPasswords = sharedPasswordStorage;

// Initialize demo passwords
// Find existing customers and set their passwords
const initializeDemoPasswords = () => {
  // Find demo customers and their accounts
  const demoCustomers = [
    { email: "minh@vs.com", password: "minh123" },
    { email: "hoa@vs.com", password: "hoa123" },
    { email: "khang@vs.com", password: "khang123" },
  ];

  demoCustomers.forEach(({ email, password }) => {
    const customer = customers.find((c) => c.email === email);
    if (customer && customer.user_id) {
      // Check if account exists
      let account = accounts.find((a) => a.id === customer.user_id);

      // If account doesn't exist, create it
      if (!account) {
        account = {
          id: customer.user_id,
          username: email,
          role_id: 5, // Khách hàng/Member
        };
        accounts.push(account);
      }

      // Set password
      accountPasswords.set(customer.user_id, password);
    }
  });
};

// Initialize on module load
initializeDemoPasswords();

export interface RegisterCustomerPayload {
  full_name: string;
  email: string;
  phone_number: string;
  dob?: string;
  gender?: string;
  password: string;
}

export interface RegisterResult {
  account: Account;
  customer: Customer;
}

export const authRepo = {
  registerCustomer: (payload: RegisterCustomerPayload): RegisterResult => {
    // Check if email already exists
    const existingCustomer = customers.find((c) => c.email === payload.email);
    if (existingCustomer) {
      throw new Error("Email đã được sử dụng");
    }

    // Check if username (email) already exists in accounts
    const existingAccount = accounts.find((a) => a.username === payload.email);
    if (existingAccount) {
      throw new Error("Email đã được sử dụng");
    }

    // Create account (role_id = 5 for "Khách hàng/Member")
    const userId = nextGuid();
    const newAccount: Account = {
      id: userId,
      username: payload.email,
      role_id: 5, // Khách hàng/Member
    };
    accounts.push(newAccount);

    // Store password (plain text in mock)
    accountPasswords.set(userId, payload.password);

    // Create customer (default customer_level_id = 4 for "Thường")
    const newCustomer: Customer = {
      id: nextId(),
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
      dob: payload.dob || "",
      gender: payload.gender || "",
      id_card_number: "",
      address: "",
      customer_level_id: 4, // Thường
      user_id: userId,
      bonus_point: 0,
    };
    customers.push(newCustomer);

    return {
      account: newAccount,
      customer: newCustomer,
    };
  },

  // Helper to get password (for login if needed)
  getPassword: (userId: string): string | undefined => {
    return accountPasswords.get(userId);
  },
};
