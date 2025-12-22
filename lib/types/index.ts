// =============================================================================
// Types Index - Centralized Export
// =============================================================================
// Single entry point for all type imports across the application.
// Usage: import type { Customer, BookingRow, Coach } from "@/lib/types";
// =============================================================================

// Core domain entities
export * from "./entities";

// Booking domain types (UI projections, payloads)
export * from "./booking";

// Customer-facing flow types
export * from "./customer-flow";
