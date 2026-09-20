// lib/authorization.ts
// Centralized RBAC utilities — used in Route Handlers and Server Actions
// The backend always re-validates auth independently of middleware.

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 401 | 403 = 403
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// ─────────────────────────────────────────────────────────────
// requireAuth — validates session, returns authenticated user
// ─────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new AuthorizationError("Unauthorized — no active session", 401);
  }

  const user = session.user as AuthenticatedUser & { role?: string };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role as UserRole) ?? UserRole.MEMBER,
  };
}

// ─────────────────────────────────────────────────────────────
// requireRole — validates session AND role
// ─────────────────────────────────────────────────────────────

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Forbidden — requires one of: ${allowedRoles.join(", ")}`,
      403
    );
  }

  return user;
}

// ─────────────────────────────────────────────────────────────
// requireAdmin — shorthand for ADMIN-only
// ─────────────────────────────────────────────────────────────

export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole([UserRole.ADMIN]);
}

// ─────────────────────────────────────────────────────────────
// requireMember — shorthand for MEMBER or ADMIN
// ─────────────────────────────────────────────────────────────

export async function requireMember(): Promise<AuthenticatedUser> {
  return requireRole([UserRole.MEMBER, UserRole.ADMIN]);
}

// ─────────────────────────────────────────────────────────────
// handleAuthError — converts AuthorizationError to NextResponse
// ─────────────────────────────────────────────────────────────

export function isAuthorizationError(
  error: unknown
): error is AuthorizationError {
  return error instanceof AuthorizationError;
}
