/**
 * Shared Hooks
 *
 * Reusable hooks for common UI patterns across the application.
 */

// Dialog/Modal state management
export { useDialogState } from "./useDialogState";

// Value debouncing for inputs
export { useDebouncedValue } from "./useDebouncedValue";

// Table filter, sort, pagination
export {
  useTableFilter,
  type TableFilterState,
  type UseTableFilterOptions,
} from "./useTableFilter";

// Mobile detection
export { useIsMobile } from "./use-mobile";
