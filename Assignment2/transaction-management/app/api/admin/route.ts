// app/api/admin/route.ts
// GET /api/admin — ADMIN-only aggregate statistics for the admin dashboard.

import { NextResponse } from "next/server";
import { requireAdmin, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [users, transactions, auditLogs, emailEvents, byRole, completed] =
      await Promise.all([
        prisma.user.count(),
        prisma.transaction.count(),
        prisma.auditLog.count(),
        prisma.emailEvent.count(),
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.transaction.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
      ]);

    return NextResponse.json({
      data: {
        totals: { users, transactions, auditLogs, emailEvents },
        usersByRole: Object.fromEntries(
          byRole.map((r) => [r.role, r._count._all])
        ),
        completedValue: Number(completed._sum.amount ?? 0),
      },
    });
  } catch (error) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[API] GET /api/admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
