// app/transactions/page.tsx
// MEMBER/ADMIN transaction workspace. Re-validates the role server-side.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireMember, isAuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Create and review transactions",
};

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let user;
  try {
    user = await requireMember();
  } catch (error) {
    if (isAuthorizationError(error)) {
      redirect(
        error.statusCode === 401
          ? "/login?callbackUrl=/transactions"
          : "/dashboard?error=forbidden"
      );
    }
    throw error;
  }

  const isAdmin = user.role === "ADMIN";

  const transactions = await prisma.transaction.findMany({
    where: isAdmin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
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
  });

  return (
    <DashboardShell user={user}>
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <p className="mt-1 text-muted-foreground">
        {isAdmin
          ? "All transactions across the organisation."
          : "Transactions you own."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New transaction</CardTitle>
            <CardDescription>
              The owner is taken from your signed-in session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTransactionForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin ? "All transactions" : "Your transactions"}
            </CardTitle>
            <CardDescription>50 most recent records</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable
              showOwner={isAdmin}
              transactions={transactions.map((t) => ({
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
      </div>
    </DashboardShell>
  );
}
