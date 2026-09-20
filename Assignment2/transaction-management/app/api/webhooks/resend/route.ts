// app/api/webhooks/resend/route.ts
// Resend webhook receiver
//
// Handles email lifecycle events from Resend.
// Signature verified using svix (Resend's webhook infrastructure).
// Stores events in the EmailEvent table with deduplication on eventId.

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { EmailEventType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Event type mapping
// ─────────────────────────────────────────────────────────────

const RESEND_EVENT_MAP: Record<string, EmailEventType> = {
  "email.sent": EmailEventType.SENT,
  "email.delivered": EmailEventType.DELIVERED,
  "email.delivery_delayed": EmailEventType.SENT,
  "email.complained": EmailEventType.COMPLAINED,
  "email.bounced": EmailEventType.BOUNCED,
  "email.failed": EmailEventType.FAILED,
  "email.opened": EmailEventType.OPENED,
  "email.clicked": EmailEventType.CLICKED,
};

// ─────────────────────────────────────────────────────────────
// Resend webhook payload types
// ─────────────────────────────────────────────────────────────

interface ResendWebhookData {
  email_id: string;
  from?: string;
  to?: string[];
  created_at?: string;
  subject?: string;
}

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: ResendWebhookData;
}

// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/resend
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] RESEND_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // ── 1. Read raw body ─────────────────────────────────────
  const rawBody = await request.text();

  // ── 2. Extract svix headers ──────────────────────────────
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn("[Webhook] Missing svix signature headers");
    return NextResponse.json(
      { error: "Missing webhook signature headers" },
      { status: 400 }
    );
  }

  // ── 3. Verify signature ──────────────────────────────────
  const wh = new Webhook(webhookSecret);
  let payload: ResendWebhookPayload;

  try {
    payload = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ResendWebhookPayload;
  } catch (err) {
    console.warn("[Webhook] Signature verification failed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // ── 4. Process event ─────────────────────────────────────
  const { type, created_at, data } = payload;
  const eventType = RESEND_EVENT_MAP[type];

  if (!eventType) {
    // Unknown event type — acknowledge but don't store
    console.log(`[Webhook] Unhandled event type: ${type}`);
    return NextResponse.json({ received: true });
  }

  const recipient = data.to?.[0] ?? "unknown";
  const messageId = data.email_id;
  const occurredAt = new Date(created_at);

  // Use svixId as unique event ID for deduplication
  const eventId = svixId;

  // ── 5. Upsert into EmailEvent (dedup on eventId) ─────────
  try {
    // Look up user by recipient email
    const user = await prisma.user.findUnique({
      where: { email: recipient },
      select: { id: true },
    });

    await prisma.emailEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        messageId,
        recipient,
        eventType,
        userId: user?.id ?? null,
        occurredAt,
        payload: {
          type,
          from: data.from,
          to: data.to,
          subject: data.subject,
          emailCreatedAt: data.created_at,
        },
      },
      update: {
        // If duplicate, update the event type and timestamp
        eventType,
        occurredAt,
      },
    });

    console.log(`[Webhook] Stored email event: ${type} → ${recipient} (${eventId})`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Failed to store email event:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
