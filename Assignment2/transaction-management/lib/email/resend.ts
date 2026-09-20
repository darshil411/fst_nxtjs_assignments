// lib/email/resend.ts
// Resend email service — modular, non-fatal email delivery

import { Resend } from "resend";
import { render } from "@react-email/components";
import { TransactionCreatedEmail } from "@/emails/TransactionCreated";
import { AccountActivityAlertEmail } from "@/emails/AccountActivityAlert";

// ─────────────────────────────────────────────────────────────
// Resend client (lazy init)
// ─────────────────────────────────────────────────────────────

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "TxnManager <noreply@example.com>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// sendTransactionEmail
// ─────────────────────────────────────────────────────────────

export interface TransactionEmailData {
  to: string;
  userName: string;
  transactionId: string;
  title: string;
  description?: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  status: string;
  reference: string;
  createdAt: Date;
}

export async function sendTransactionEmail(
  data: TransactionEmailData
): Promise<EmailResult> {
  try {
    const resend = getResendClient();

    const html = await render(
      TransactionCreatedEmail({
        userName: data.userName,
        transactionId: data.transactionId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        type: data.type,
        status: data.status,
        reference: data.reference,
        createdAt: data.createdAt,
        appUrl: APP_URL,
      })
    );

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [data.to],
      subject: `Transaction ${data.type === "CREDIT" ? "Received" : "Sent"}: ${data.title}`,
      html,
    });

    if (result.error) {
      console.error("[Email] Resend API error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("[Email] Transaction email sent:", result.data?.id);
    return { success: true, messageId: result.data?.id ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Email] Failed to send transaction email:", message);
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────
// sendActivityAlert
// ─────────────────────────────────────────────────────────────

export interface ActivityAlertData {
  to: string;
  userName: string;
  activityType:
    | "LOGIN"
    | "PASSWORD_CHANGE"
    | "ROLE_CHANGE"
    | "SUSPICIOUS_ACTIVITY"
    | "ACCOUNT_CREATED";
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  newRole?: string;
}

export async function sendActivityAlert(
  data: ActivityAlertData
): Promise<EmailResult> {
  try {
    const resend = getResendClient();

    const html = await render(
      AccountActivityAlertEmail({
        userName: data.userName,
        activityType: data.activityType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: data.timestamp,
        newRole: data.newRole,
        appUrl: APP_URL,
      })
    );

    const subjectMap: Record<string, string> = {
      LOGIN: "New Sign-In Detected",
      PASSWORD_CHANGE: "Password Changed",
      ROLE_CHANGE: "Account Role Updated",
      SUSPICIOUS_ACTIVITY: "⚠️ Suspicious Activity Detected",
      ACCOUNT_CREATED: "Welcome to TxnManager",
    };

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [data.to],
      subject: subjectMap[data.activityType] ?? "Account Activity Alert",
      html,
    });

    if (result.error) {
      console.error("[Email] Resend API error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("[Email] Activity alert sent:", result.data?.id);
    return { success: true, messageId: result.data?.id ?? undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Email] Failed to send activity alert:", message);
    return { success: false, error: message };
  }
}
