# Evidence Checklist

Use this list when capturing evidence for submission.

**Rule: only tick a box after you have personally observed the result.**
Never fabricate a screenshot, a log line, a message ID, or a webhook event.
An untested item left unticked is honest; a ticked item you did not run is not.

Legend:
`[ ]` not yet captured · `[x]` observed by you · `(local)` verified during
development on a local Postgres instance; re-verify on your own machine.

---

## 1. Setup and build

- [ ] `npm install` completes without errors
- [ ] `npm run db:generate` produces the Prisma client *(local)*
- [ ] `npm run db:migrate` applies the migration to a clean database *(local)*
- [ ] `npm run db:seed` prints the summary counts *(local)*
- [ ] `npm run lint` passes with no errors *(local)*
- [ ] `npm run typecheck` passes with no errors *(local)*
- [ ] `npm run build` completes a production build *(local)*

Capture: terminal output of each command.

---

## 2. Database and schema

- [ ] Screenshot of `npx prisma studio` showing the `User` table with mixed roles
- [ ] Screenshot showing `Transaction` rows linked to real user IDs
- [ ] Screenshot of `AuditLog` rows with action, entity and entityId populated
- [ ] Screenshot of `EmailEvent` rows
- [ ] Seed output showing counts for users, transactions, audit logs, email
      events and credential accounts
- [ ] Confirm no password value appears anywhere in the seed output

---

## 3. Authentication

- [ ] Sign up a new account at `/signup` and confirm it is created as MEMBER
- [ ] Sign in as `admin@txnmanager.dev`
- [ ] Sign in as `alice@txnmanager.dev`
- [ ] Sign out returns you to `/login`
- [ ] Confirm the session cookie is httpOnly in browser dev tools

Capture: screenshots of each dashboard after sign-in.

---

## 4. Route protection (proxy layer)

- [ ] Signed out, visiting `/dashboard` redirects to `/login?callbackUrl=/dashboard`
- [ ] Signed out, visiting `/admin` redirects to login
- [ ] As MEMBER, visiting `/admin` redirects to `/dashboard?error=forbidden`
- [ ] As MEMBER, visiting `/admin` redirects away
- [ ] As ADMIN, `/admin` renders the console

Capture: screenshots or a short screen recording of each redirect.

---

## 5. Protected API endpoints

Run each with `curl` and record the status code.

| Request | Signed out | MEMBER | ADMIN |
| --- | --- | --- | --- | --- |
| `GET /api/transactions` | 401 | 200 | 200 |
| `POST /api/transactions` | 401 | 201 | 201 |
| `GET /api/admin/users` | 401 | 403 | 200 |
| `GET /api/admin/audit-logs` | 401 | 403 | 200 |
| `GET /api/users` | 401 | 200 | 200 |

- [ ] Full matrix reproduced and recorded *(local)*
- [ ] Response bodies contain no password hashes or secrets

Capture: the curl commands and their output.

---

## 6. Never trusting the client

- [ ] As MEMBER, POST `/api/transactions` with an extra `"userId"` of another
      user; confirm the created row is owned by the *signed-in* member *(local)*
- [ ] Sign up while sending a `"role": "ADMIN"` field; confirm the account is
      still created as MEMBER
- [ ] Confirm the server action never reads `userId` from its argument

Capture: request payload plus the resulting database row.

---

## 7. Server action and audit trail

- [ ] Create a transaction from `/transactions`
- [ ] Confirm it appears in the table with a `TXN-` reference
- [ ] Confirm a matching `TRANSACTION_CREATED` audit row exists with the
      correct actor and `entityId` *(local)*
- [ ] Confirm validation errors render per field for an invalid amount

---

## 8. Email

- [ ] `npm run email:dev` renders `TransactionCreated` and `AccountActivityAlert`
- [ ] With a real `RESEND_API_KEY`, creating a transaction delivers an email
- [ ] The email shows app name, recipient name, transaction details, timestamp,
      CTA button and footer
- [ ] With an invalid API key, the transaction still succeeds and the UI shows
      no provider error (check the server log for the warning)

Capture: the rendered email and the Resend dashboard entry.

---

## 9. Webhook

- [ ] Configure the Resend webhook to `https://<your-host>/api/webhooks/resend`
- [ ] Send a test event; confirm an `EmailEvent` row is written
- [ ] Re-send the same event; confirm no duplicate row is created
- [ ] Send a request with a tampered signature; confirm a 401 and no row
- [ ] Confirm the webhook secret never appears in any log

Capture: Resend webhook log plus the `EmailEvent` table.

---

## 10. Security hygiene

- [ ] `git status` shows no `.env` or `.env.local` staged
- [ ] `.gitignore` covers `.env*`, `node_modules`, `.next`
- [ ] `grep -ri "re_" --include="*.ts*" .` finds no committed API key
- [ ] No plaintext password anywhere in the repository
- [ ] `.env.example` contains placeholders only

---

## Notes

Record anything you could not verify and why (for example, "no Resend account,
so live delivery untested"). An explicit gap is acceptable evidence; an
invented result is not.
