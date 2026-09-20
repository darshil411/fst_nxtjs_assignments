// app/admin/page.tsx
// Admin console. requireAdmin() re-validates the role server-side.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, Receipt, ScrollText, Users } from "lucide-react";
import { requireAdmin, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsersTable } from "@/components/admin/users-table";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { EmailEventsTable } from "@/components/admin/email-events-table";
import { TransactionTable } from "@/components/transactions/transaction-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Users, transactions, audit logs and email events",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isAuthorizationError(error)) {
      redirect(
        error.statusCode === 401
          ? "/login?callbackUrl=/admin"
          : "/dashboard?error=forbidden"
      );
    }
    throw error;
  }

  const [
    userCount,
    transactionCount,
    auditCount,
    emailCount,
    users,
    recentTransactions,
    auditLogs,
    emailEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.auditLog.count(),
    prisma.emailEvent.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { transactions: true } },
      },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        reference: true,
        title: true,
        description: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.emailEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 10,
      select: {
        id: true,
        eventId: true,
        messageId: true,
        recipient: true,
        eventType: true,
        occurredAt: true,
      },
    }),
  ]);

  return (
    <DashboardShell user={admin}>
      <h1 className="text-2xl font-bold tracking-tight">Admin console</h1>
      <p className="mt-1 text-muted-foreground">
        Organisation-wide users, activity and email delivery.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={userCount}
          icon={<Users className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Total transactions"
          value={transactionCount}
          icon={<Receipt className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Audit events"
          value={auditCount}
          icon={<ScrollText className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Email events"
          value={emailCount}
          icon={<Mail className="h-5 w-5" aria-hidden />}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>10 most recently created accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt,
              transactionCount: u._count.transactions,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>Across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable
            showOwner
            transactions={recentTransactions.map((t) => ({
              id: t.id,
              reference: t.reference,
              title: t.title,
              description: t.description,
              amount: t.amount.toString(),
              type: t.type,
              status: t.status,
              createdAt: t.createdAt,
              owner: t.user.name,
            }))}
          />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>10 most recent privileged actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AuditLogTable
              logs={auditLogs.map((l) => ({
                id: l.id,
                action: l.action,
                entity: l.entity,
                entityId: l.entityId,
                actor: l.user?.name ?? "System",
                createdAt: l.createdAt,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email events</CardTitle>
            <CardDescription>Delivered by the Resend webhook</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailEventsTable events={emailEvents} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
