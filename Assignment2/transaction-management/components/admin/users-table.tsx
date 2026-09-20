import { Users } from "lucide-react";
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

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: Date | string;
  transactionCount: number;
}

const ROLE_VARIANT = {
  ADMIN: "destructive",
  MEMBER: "success",
} as const;

export function UsersTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" aria-hidden />}
        title="No users found"
        description="Run the seed script or invite users to populate this list."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Transactions</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
            <TableCell>
              <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
            </TableCell>
            <TableCell className="text-right">{u.transactionCount}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(u.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
