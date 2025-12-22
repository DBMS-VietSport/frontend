"use client";

/**
 * Query Provider Component
 *
 * Wraps the application with React Query's QueryClientProvider.
 * Must be used as a client component in Next.js App Router.
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "./queryClient";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each session
  // This ensures proper isolation in server-side rendering
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* TODO: Add ReactQueryDevtools after installing @tanstack/react-query-devtools */}
    </QueryClientProvider>
  );
}

export default QueryProvider;

