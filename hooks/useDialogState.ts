"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing dialog/modal state with selected item
 *
 * @example
 * const { isOpen, selectedItem, open, close } = useDialogState<Customer>();
 *
 * // Open dialog with item
 * open(customer);
 *
 * // In dialog
 * <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
 */
export function useDialogState<T = unknown>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    if (item !== undefined) {
      setSelectedItem(item);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear item after animation completes
    setTimeout(() => setSelectedItem(null), 150);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
      } else {
        close();
      }
    },
    [close]
  );

  return {
    isOpen,
    selectedItem,
    open,
    close,
    toggle,
    handleOpenChange,
    setSelectedItem,
  };
}

export default useDialogState;
