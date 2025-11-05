"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import type { UserRole } from "@/lib/mock/authMock";

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Role-based rendering component
 * Shows children only if the current user's role is in the allowed roles list
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { user, loading } = useAuth();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user exists and has required role
  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

