// Re-export mock data for convenience
export * from "./mock/mockRepo";

// Re-export customer flow data (cities, facilities, time slots, services, coaches, courts)
export {
  mockCities,
  mockFacilities,
  generateTimeSlots,
  mockServiceItems,
  mockCoaches,
  mockCustomerCourtTypes,
  mockCustomerCourts,
} from "@/features/customer/mock/customerFlowData";

// Re-export customer courts as mockCourts for booking flow
export { mockCustomerCourts as mockCourts } from "@/features/customer/mock/customerFlowData";

// Re-export customer court types as mockCourtTypes for booking flow
export { mockCustomerCourtTypes as mockCourtTypes } from "@/features/customer/mock/customerFlowData";

