// Shared password storage for authRepo and passwordResetRepo
export const sharedPasswordStorage = new Map<string, string>();

// Initialize with demo passwords
// Note: In production, passwords should be hashed. This is for demo purposes only.
// Demo customers from data.ts - their user_ids will be set when initialized
// We'll add them in the authRepo initialization
