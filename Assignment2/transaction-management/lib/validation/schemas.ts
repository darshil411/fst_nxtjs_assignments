// lib/validation/schemas.ts
// Zod validation schemas for API routes and Server Actions

import { z } from "zod";
import { TransactionType, TransactionStatus, UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Transaction schemas
// ─────────────────────────────────────────────────────────────

export const createTransactionSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .trim()
    .optional(),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .max(1_000_000, "Amount cannot exceed 1,000,000"),
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus).optional().default("PENDING"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string().cuid("Invalid transaction ID"),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

// ─────────────────────────────────────────────────────────────
// Pagination / filter query schema
// ─────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const transactionQuerySchema = paginationSchema.extend({
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

// ─────────────────────────────────────────────────────────────
// User schemas (admin operations)
// ─────────────────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.nativeEnum(UserRole),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// ─────────────────────────────────────────────────────────────
// Resend webhook payload schema
// ─────────────────────────────────────────────────────────────

export const resendWebhookSchema = z.object({
  type: z.string(),
  created_at: z.string(),
  data: z.object({
    email_id: z.string(),
    from: z.string().optional(),
    to: z.array(z.string()).optional(),
    subject: z.string().optional(),
    created_at: z.string().optional(),
  }),
});

export type ResendWebhookPayload = z.infer<typeof resendWebhookSchema>;
