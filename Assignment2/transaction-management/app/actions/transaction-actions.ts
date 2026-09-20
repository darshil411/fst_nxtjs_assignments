// app/actions/transaction-actions.ts
// Protected Server Actions for transaction operations
//
// Server Actions run on the server — NOT in the browser.
// Authorization is performed server-side at every call.
// The userId ALWAYS comes from the authenticated session, never from the client.

"use server";

import { revalidatePath } from "next/cache";
import { requireMember, requireAdmin, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validation/schemas";
import { AuditAction } from "@prisma/client";
import { sendTransactionEmail } from "@/lib/email/resend";
import { generateTransactionReference } from "@/lib/reference";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Result type for Server Actions
// ─────────────────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─────────────────────────────────────────────────────────────
// createTransaction — Server Action
//
// Flow:
// Client → Server Action → Session validation → Role validation →
// Zod validation → Prisma mutation → Audit log → Email → Response
// ─────────────────────────────────────────────────────────────

export async function createTransaction(
  formData: unknown
): Promise<ActionResult<{ id: string; reference: string; title: string }>> {
  // 1. Session + role validation (server-side)
  let currentUser: Awaited<ReturnType<typeof requireMember>>;
  try {
    currentUser = await requireMember();
  } catch (error) {
    if (isAuthorizationError(error)) {
      return {
        success: false,
        error: error.statusCode === 401
          ? "You must be logged in to create a transaction"
          : "You do not have permission to create transactions",
      };
    }
    return { success: false, error: "Authorization check failed" };
  }

  // 2. Zod validation
  const parsed = createTransactionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const input = parsed.data;

  // 3. Prisma mutation + audit log in a single transaction
  let transaction: {
    id: string;
    reference: string;
    title: string;
    description: string | null;
    amount: import("@prisma/client").Prisma.Decimal;
    type: import("@prisma/client").TransactionType;
    status: import("@prisma/client").TransactionStatus;
    createdAt: Date;
  };

  try {
    transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const created = await tx.transaction.create({
        data: {
          // userId ALWAYS from authenticated session — NEVER accepted from client
          userId: currentUser.id,
          reference: generateTransactionReference(),
          title: input.title,
          description: input.description,
          amount: input.amount,
          type: input.type,
          status: input.status ?? "PENDING",
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: AuditAction.TRANSACTION_CREATED,
          entity: "Transaction",
          entityId: created.id,
          metadata: {
            title: input.title,
            amount: input.amount.toString(),
            type: input.type,
            status: input.status ?? "PENDING",
          },
        },
      });

      return created;
    });
  } catch (error) {
    console.error("[Action] createTransaction DB error:", error);
    return { success: false, error: "Failed to create transaction. Please try again." };
  }

  // 4. Send transactional email (non-fatal — DB already committed)
  try {
    const emailResult = await sendTransactionEmail({
      to: currentUser.email,
      userName: currentUser.name,
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
      // Log warning but don't fail the action
      console.warn("[Action] Email delivery failed:", emailResult.error);
    }
  } catch (emailError) {
    console.error("[Action] Unexpected email error:", emailError);
    // Email failure does not undo successful DB write
  }

  // 5. Revalidate cache so pages show fresh data
  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: transaction.id,
      reference: transaction.reference,
      title: transaction.title,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// deleteTransaction — Admin-only Server Action
// ─────────────────────────────────────────────────────────────

export async function deleteTransaction(
  transactionId: string
): Promise<ActionResult> {
  // 1. Require ADMIN
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isAuthorizationError(error)) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Authorization check failed" };
  }

  // 2. Validate ID
  const idSchema = z.string().cuid("Invalid transaction ID");
  const idParsed = idSchema.safeParse(transactionId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid transaction ID" };
  }

  // 3. Delete + audit log
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!existing) {
        throw new Error("Transaction not found");
      }

      await tx.transaction.delete({ where: { id: transactionId } });

      await tx.auditLog.create({
        data: {
          userId: admin.id,
          action: AuditAction.TRANSACTION_DELETED,
          entity: "Transaction",
          entityId: transactionId,
          metadata: { deletedAt: new Date().toISOString() },
        },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Action] deleteTransaction error:", message);
    return { success: false, error: `Failed to delete: ${message}` };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true };
}
