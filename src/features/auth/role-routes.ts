import type { UserRole } from "@/types/auth";

/**
 * B2C investor portal — single-role app.
 * Kept as a map for forward-compatibility with existing route guards.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  investor: "/app/investor",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  investor: "Investor",
};
