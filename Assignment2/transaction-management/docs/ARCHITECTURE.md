# Architecture — Multi-Tenant Transaction Management System

Companion document to the root `README.md`. It explains *why* the system is
shaped the way it is, and traces each request end to end.

---

## 1. Goals and constraints

| Goal | How it is met |
| --- | --- |
| No fake authentication | Better Auth owns sessions, hashing, and cookies |
| Role-based access at every layer | Proxy → route handler → server action → database scoping |
| Never trust the client | `userId` and `role` are always read from the server session |
| Auditability | Every privileged mutation writes an `AuditLog` row |
| Observable email delivery | Resend webhook persists `EmailEvent` rows, deduped by event ID |
| Data integrity over convenience | Email failures never roll back a committed transaction |

---

## 2. Layer diagram

```text
┌─────────────────────────────────────────────────────────────┐
│ BROWSER                                                     │
│   React Server Components + a thin layer of client forms    │
│   Holds only a signed, httpOnly session cookie              │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼─────────────────────────────────────────────┐
│ PROXY (proxy.ts, runs before route resolution)              │
│   • public allow-list                                       │
│   • session cookie presence check                           │
│   • role check for /admin, /api/admin, /api/transactions    │
│   FIRST line of defence — never the only one                │
└───────────────┬─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│ APPLICATION                                                 │
│   Pages (RSC)      Route handlers      Server actions       │
│        │                  │                   │             │
│        └──────────────────┴───────────────────┘             │
│                     lib/authorization.ts                    │
│              requireAuth / requireRole / requireAdmin       │
│                     lib/validation/schemas.ts (Zod)         │
└───────────────┬─────────────────────────────────────────────┘
                │ Prisma Client
┌───────────────▼─────────────────────────────────────────────┐
│ POSTGRESQL                                                  │
│  User · Transaction · AuditLog · EmailEvent                 │
│  Session · Account · Verification (Better Auth)             │
└─────────────────────────────────────────────────────────────┘
                │
        ┌───────▼────────┐        ┌──────────────────────────┐
        │ Resend API     │───────▶│ /api/webhooks/resend     │
        │ React Email    │  events│ Svix signature verified  │
        └────────────────┘        └──────────────────────────┘
```

---

## 3. Data model

```text
User 1───* Transaction        (onDelete: Cascade)
User 1───* AuditLog           (onDelete: SetNull — keep the trail)
User 1───* EmailEvent         (onDelete: SetNull)
User 1───* Session, Account   (onDelete: Cascade — Better Auth)

AuditLog.entityId  ── polymorphic pointer, INDEXED but NOT a foreign key
```

`entityId` may point at a `Transaction`, a `User`, or a `Session`. Making it a
real foreign key would force every audited entity into one table, so it is a
plain indexed column instead. The actor (`userId`) *is* a genuine relation.

Enums: `UserRole`, `TransactionType`, `TransactionStatus`, `AuditAction`,
`EmailEventType`. Primary keys are CUIDs. `Transaction.reference` is a
human-readable `TXN-XXXXXXXX` value generated in `lib/reference.ts` and backed
by a unique constraint.

Indexes exist on every column used for filtering or ordering: `User.email`,
`User.role`, `Transaction.userId/status/type/createdAt/reference`,
`AuditLog.userId/action/entity/entityId/createdAt`,
`EmailEvent.messageId/recipient/eventType/userId/createdAt`.

---

## 4. Authentication

Better Auth with the Prisma adapter and the email/password provider. The
`role` field is exposed to the session but declared `input: false`, so a
client cannot set or change its own role at sign-up. Sessions are stored in
the `Session` table; the browser only ever holds an httpOnly cookie.

```text
sign-in ─▶ Better Auth verifies hash ─▶ Session row ─▶ httpOnly cookie
request ─▶ auth.api.getSession(headers) ─▶ { id, name, email, role }
```

---

## 5. Authorization (`lib/authorization.ts`)

```text
requireAuth()            any signed-in user            401 if absent
requireRole([...])       role must be in the list      403 if mismatched
requireMember()          MEMBER or ADMIN
requireAdmin()           ADMIN only
```

Each throws an `AuthorizationError` carrying a `statusCode`. Route handlers map
it to a JSON response; pages map it to a redirect.

---

## 6. Defence in depth

```text
Request for /api/admin/users as a MEMBER

  proxy.ts        role !== ADMIN          ──▶ 403   (stopped here)
  route handler   requireAdmin()          ──▶ 403   (would also stop it)
  query scope     admin-only projection   ──▶ n/a
```

Even if the proxy were removed entirely, no protected endpoint would leak: each
handler re-resolves the session from the cookie and re-checks the role. The
proxy exists for speed and for clean redirects, not for safety.

---

## 7. Read path (member dashboard)

```text
GET /dashboard
  proxy: cookie present → allow
  page: requireAuth() → user { id, role }
  role === MEMBER → Prisma query scoped with { userId: user.id }
  render RSC → HTML
```

A member's queries are scoped in the query itself, so there is no way for one
tenant's rows to reach another tenant's page.

---

## 8. Write path (create transaction)

```text
Client form ──▶ createTransaction(data)      // server action
    1. requireMember()                        session + role
    2. createTransactionSchema.safeParse()    Zod
    3. prisma.$transaction:
         • transaction.create  (userId from SESSION, reference generated)
         • auditLog.create     (TRANSACTION_CREATED)
       ── commit ──
    4. sendTransactionEmail()                 best effort, after commit
    5. revalidatePath()                       fresh UI
    6. return { success, data }               safe fields only
```

The client sends title, amount, type, status and description. It never sends
`userId`; the field is not even in the Zod schema, so a spoofed value is
stripped before it reaches Prisma.

---

## 9. Email pipeline

```text
lib/email/resend.ts
  ├─ render React Email template (emails/TransactionCreated.tsx)
  ├─ resend.emails.send({ from, to, subject, react })
  ├─ success → { success: true, id }
  └─ failure → log server-side, return { success: false, error }
```

The caller treats a failure as non-fatal: the database write has already
committed, so the user still gets their transaction. Errors are logged on the
server and never forwarded to the browser, so API keys and provider internals
cannot leak through an error message.

---

## 10. Webhook pipeline

```text
Resend ──▶ POST /api/webhooks/resend
   raw body + svix-id / svix-timestamp / svix-signature headers
      │
      ├─ verify with RESEND_WEBHOOK_SECRET (Svix)  ── invalid ──▶ 401
      ├─ Zod-parse the payload                     ── invalid ──▶ 400
      ├─ map email.sent/delivered/bounced/failed → EmailEventType
      └─ prisma.emailEvent.create()
             unique(eventId) → duplicate delivery is a no-op 200
```

Signature verification happens on the *raw* body before any parsing. The secret
is never logged.

---

## 11. Audit logging

Written inside the same database transaction as the mutation it describes, so
a rolled-back write can never leave an orphan audit entry. Each row records the
actor, the action enum, the entity name, the entity ID, a JSON metadata blob,
and the timestamp. The actor relation uses `onDelete: SetNull` so deleting a
user preserves the history.

---

## 12. Validation

All external input passes through Zod in `lib/validation/schemas.ts`:
`createTransactionSchema`, `transactionQuerySchema`, `paginationSchema`,
`updateUserRoleSchema`, `resendWebhookSchema`. Unknown keys are dropped rather
than trusted, which is what neutralises client-supplied `userId` or `role`.

---

## 13. Rendering and UI

Pages are React Server Components that query Prisma directly — no internal HTTP
hop. Only forms and the sign-out control are client components. The design
system is a small set of Tailwind v4 tokens in `app/globals.css` consumed by
shadcn-style primitives in `components/ui`. Tables, empty states, loading and
error states are covered for each data surface.

---

## 14. Failure modes

| Failure | Behaviour |
| --- | --- |
| No session | Pages redirect to `/login?callbackUrl=…`; APIs return 401 JSON |
| Wrong role | Pages redirect to `/dashboard?error=forbidden`; APIs return 403 |
| Invalid input | 400 with per-field Zod messages; no partial write |
| Database error | Whole `$transaction` rolls back; generic message to the client |
| Resend down | Transaction persists; warning logged; user sees success |
| Duplicate webhook | Unique `eventId` makes the insert a no-op |
| Bad webhook signature | 401, nothing written, secret never logged |

---

## 15. Deliberate trade-offs

* **Polymorphic `entityId`** — flexibility over referential integrity, with an
  index to keep lookups fast. Documented above so it is not mistaken for a bug.
* **Email after commit, not inside the transaction** — a slow or failing
  provider must never hold a database transaction open or undo a valid write.
* **Proxy role check via the session endpoint** — a little latency in exchange
  for correct role decisions before rendering; the authoritative check still
  happens in the handler.
* **Admin sees all tenants** — this is an administrative console by design;
  member queries remain strictly scoped.
