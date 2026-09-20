// app/api/admin/audit-logs/route.ts
// Admin-only audit log endpoint
//
// GET /api/admin/audit-logs — paginated audit log viewer

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/validation/schemas";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    // 1. Require ADMIN (server-side — independent of middleware)
    await requireAdmin();

    // 2. Pagination
    const { searchParams } = request.nextUrl;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (page - 1) * limit;

    // 3. Prisma query
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({
      data: logs,
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
    console.error("[API] GET /api/admin/audit-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
