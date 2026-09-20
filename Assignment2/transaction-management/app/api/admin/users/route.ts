// app/api/admin/users/route.ts
// Admin-only user management endpoint
//
// GET  /api/admin/users — list all users with their stats
// PATCH /api/admin/users — update user role

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { updateUserRoleSchema, paginationSchema } from "@/lib/validation/schemas";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // 1. Require ADMIN role (server-side — independent of middleware)
    await requireAdmin();

    // 2. Parse pagination
    const { searchParams } = request.nextUrl;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (page - 1) * limit;

    // 3. Prisma query
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          _count: {
            select: { transactions: true, auditLogs: true },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (isAuthorizationError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[API] GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/users — update role
// ─────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    // 1. Require ADMIN
    const admin = await requireAdmin();

    // 2. Parse + validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const input = updateUserRoleSchema.parse(body);

    // 3. Prevent admin from demoting themselves
    if (input.userId === admin.id) {
      return NextResponse.json(
        { error: "Admins cannot change their own role" },
        { status: 400 }
      );
    }

    // 4. Update user role
    const updated = await prisma.user.update({
      where: { id: input.userId },
      data: { role: input.role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (isAuthorizationError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 422 }
      );
    }
    console.error("[API] PATCH /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
