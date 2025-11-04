import { customers, accounts } from "./data";
import { sharedPasswordStorage } from "./passwordStorage";

interface OtpData {
  code: string;
  expiresAt: number; // timestamp
}

// In-memory OTP storage: email -> OTP data
const otpStorage = new Map<string, OtpData>();
otpStorage.set("minh@vs.com", {
  code: "123456",
  expiresAt: Date.now() + 5 * 60 * 1000,
});
otpStorage.set("hoa@vs.com", {
  code: "123456",
  expiresAt: Date.now() + 5 * 60 * 1000,
});
otpStorage.set("khang@vs.com", {
  code: "123456",
  expiresAt: Date.now() + 5 * 60 * 1000,
});

export const passwordResetRepo = {
  requestReset: (email: string): { success: boolean } => {
    // Check if email exists in customers
    const customer = customers.find((c) => c.email === email);
    if (!customer) {
      return { success: false };
    }

    // Check if account exists (username = email)
    let account = accounts.find((a) => a.username === email);

    // If account doesn't exist but customer does, create account
    // This handles cases where customer was created but account wasn't
    if (!account && customer.user_id) {
      // Account might already exist with user_id, check by user_id
      account = accounts.find((a) => a.id === customer.user_id);

      // If still no account, create one (for mock purposes)
      if (!account) {
        account = {
          id: customer.user_id,
          username: email,
          role_id: 5, // Khách hàng/Member
        };
        accounts.push(account);
      }
    }

    if (!account) {
      return { success: false };
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5-minute expiration
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStorage.set(email, { code, expiresAt });

    // In a real app, you would send email here
    console.log(`[MOCK] OTP sent to ${email}: ${code}`);

    return { success: true };
  },

  verifyOtp: (email: string, code: string): { valid: boolean } => {
    const otpData = otpStorage.get(email);
    if (!otpData) {
      return { valid: false };
    }

    // Check expiration
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(email);
      return { valid: false };
    }

    // Check code
    if (otpData.code !== code) {
      return { valid: false };
    }

    // OTP is valid
    return { valid: true };
  },

  resetPassword: (email: string, newPassword: string): { success: boolean } => {
    // Find account by email (username)
    const account = accounts.find((a) => a.username === email);
    if (!account) {
      return { success: false };
    }

    // Update password in shared storage
    sharedPasswordStorage.set(account.id, newPassword);

    // Clear OTP after successful reset
    otpStorage.delete(email);

    return { success: true };
  },

  // Helper to get OTP for testing (optional)
  getOtp: (email: string): string | null => {
    const otpData = otpStorage.get(email);
    if (!otpData || Date.now() > otpData.expiresAt) {
      return null;
    }
    return otpData.code;
  },
};
