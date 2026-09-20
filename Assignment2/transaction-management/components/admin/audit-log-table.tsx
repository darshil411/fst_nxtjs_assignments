import { ScrollText } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

export interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  createdAt: Date | string;
}

export function AuditLogTable({ logs }: { logs: AuditLogRow[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText className="h-8 w-8" aria-hidden />}
        title="No audit events"
        description="Privileged actions such as creating or deleting transactions are recorded here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Entity ID</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <Badge variant="outline">{log.action}</Badge>
            </TableCell>
            <TableCell className="text-sm">{log.entity}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {log.entityId ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{log.actor}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(log.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
