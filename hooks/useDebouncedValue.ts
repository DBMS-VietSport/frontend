"use client";

import { useState, useEffect } from "react";

/**
 * Hook that debounces a value by the specified delay
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 *
 * @example
 * const [searchText, setSearchText] = useState("");
 * const debouncedSearch = useDebouncedValue(searchText, 300);
 *
 * // debouncedSearch updates 300ms after searchText stops changing
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
