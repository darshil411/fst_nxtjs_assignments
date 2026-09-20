// app/api/transactions/route.ts
// Protected transaction API endpoints
//
// GET  /api/transactions — list transactions (own for MEMBER, all for ADMIN)
// POST /api/transactions — create transaction (MEMBER or ADMIN)

import { NextRequest, NextResponse } from "next/server";
import { requireMember, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema, transactionQuerySchema } from "@/lib/validation/schemas";
import { UserRole, AuditAction } from "@prisma/client";
import { sendTransactionEmail } from "@/lib/email/resend";
import { generateTransactionReference } from "@/lib/reference";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// GET /api/transactions
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // 1. Auth + role validation
    const user = await requireMember();

    // 2. Parse + validate query params
    const { searchParams } = request.nextUrl;
    const query = transactionQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
      type: searchParams.get("type") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const skip = (query.page - 1) * query.limit;

    // 3. Build where clause — ADMIN sees all, MEMBER sees own
    const where = {
      ...(user.role === UserRole.MEMBER ? { userId: user.id } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    // 4. Prisma query
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          type: true,
          status: true,
          reference: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // 5. Return safe typed response
    return NextResponse.json({
      data: transactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
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
    console.error("[API] GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/transactions
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth + role validation
    const user = await requireMember();

    // 2. Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 3. Zod validation
    const input = createTransactionSchema.parse(body);

    // 4. Prisma mutation
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const created = await tx.transaction.create({
        data: {
          userId: user.id, // Always from authenticated session — NEVER from client
          reference: generateTransactionReference(),
          title: input.title,
          description: input.description,
          amount: input.amount,
          type: input.type,
          status: input.status ?? "PENDING",
        },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          type: true,
          status: true,
          reference: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.TRANSACTION_CREATED,
          entity: "Transaction",
          entityId: created.id,
          metadata: {
            title: input.title,
            amount: input.amount,
            type: input.type,
          },
        },
      });

      return created;
    });

    // 6. Send transactional email (non-fatal — after DB commit)
    const emailResult = await sendTransactionEmail({
      to: user.email,
      userName: user.name,
      transactionId: transaction.id,
      title: transaction.title,
      description: transaction.description ?? undefined,
      amount: Number(transaction.amount),
      type: transaction.type as "CREDIT" | "DEBIT",
      status: transaction.status,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
    });

    if (!emailResult.success) {
      console.warn("[API] Email delivery failed but transaction succeeded:", emailResult.error);
    }

    return NextResponse.json({ data: transaction }, { status: 201 });
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
    console.error("[API] POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
