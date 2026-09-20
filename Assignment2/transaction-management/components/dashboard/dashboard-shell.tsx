import Link from "next/link";
import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

interface DashboardShellProps {
  user: { name: string; email: string; role: "ADMIN" | "MEMBER" };
  children: ReactNode;
}

const ROLE_VARIANT = {
  ADMIN: "destructive",
  MEMBER: "success",
} as const;

export function DashboardShell({ user, children }: DashboardShellProps) {
  const canSeeTransactions = true;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md shadow-sm mb-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <BarChart3 className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">TxnManager</span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-2 text-sm ml-4">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            {canSeeTransactions ? (
              <Link
                href="/transactions"
                className="rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                Transactions
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={ROLE_VARIANT[user.role]} className="shadow-sm">{user.role}</Badge>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
