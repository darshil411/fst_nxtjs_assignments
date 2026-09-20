import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface TransactionRow {
  id: string;
  reference: string;
  title: string;
  description?: string | null;
  amount: string | number;
  type: "CREDIT" | "DEBIT";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: Date | string;
  owner?: string;
}

const STATUS_VARIANT = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "destructive",
  CANCELLED: "neutral",
} as const;

export function TransactionTable({
  transactions,
  showOwner = false,
}: {
  transactions: TransactionRow[];
  showOwner?: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-8 w-8" aria-hidden />}
        title="No transactions yet"
        description="Transactions you create will appear here with their status and reference."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Title</TableHead>
          {showOwner ? <TableHead>Owner</TableHead> : null}
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {t.reference}
            </TableCell>
            <TableCell>
              <p className="font-medium">{t.title}</p>
              {t.description ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {t.description}
                </p>
              ) : null}
            </TableCell>
            {showOwner ? (
              <TableCell className="text-sm text-muted-foreground">
                {t.owner ?? "—"}
              </TableCell>
            ) : null}
            <TableCell>
              <Badge variant={t.type === "CREDIT" ? "success" : "outline"}>
                {t.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(Number(t.amount))}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(t.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
