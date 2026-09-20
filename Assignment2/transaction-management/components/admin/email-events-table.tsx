import { Mail } from "lucide-react";
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

export interface EmailEventRow {
  id: string;
  eventId: string;
  messageId: string;
  recipient: string;
  eventType: string;
  occurredAt: Date | string;
}

const EVENT_VARIANT: Record<string, "success" | "warning" | "destructive" | "neutral"> = {
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  SENT: "neutral",
  BOUNCED: "destructive",
  FAILED: "destructive",
  COMPLAINED: "warning",
};

export function EmailEventsTable({ events }: { events: EmailEventRow[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Mail className="h-8 w-8" aria-hidden />}
        title="No email events"
        description="Resend webhook deliveries (sent, delivered, bounced, failed) appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Message ID</TableHead>
          <TableHead>Occurred</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <Badge variant={EVENT_VARIANT[e.eventType] ?? "neutral"}>
                {e.eventType}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">{e.recipient}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {e.messageId}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(e.occurredAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
