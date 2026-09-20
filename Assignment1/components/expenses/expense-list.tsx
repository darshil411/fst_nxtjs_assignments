"use client";

import { useExpenseFilterStore } from "@/store/expense-filter-store";
import { Expense } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteExpenseAction } from "@/app/actions/expense-actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExpenseListProps {
  initialExpenses: Expense[];
}

export function ExpenseList({ initialExpenses }: ExpenseListProps) {
  const [isPending, startTransition] = useTransition();
  
  // Use selector to only subscribe to fields this component needs
  const searchQuery = useExpenseFilterStore((state) => state.searchQuery);
  const category = useExpenseFilterStore((state) => state.category);
  const sortOrder = useExpenseFilterStore((state) => state.sortOrder);

  // Apply filters locally on the client (since this is an academic demo)
  // In a real large app, filtering might happen on the server.
  let filteredExpenses = [...initialExpenses];

  if (searchQuery) {
    filteredExpenses = filteredExpenses.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (category !== "All") {
    filteredExpenses = filteredExpenses.filter((e) => e.category === category);
  }

  filteredExpenses.sort((a, b) => {
    switch (sortOrder) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteExpenseAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (filteredExpenses.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">No expenses found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            No expenses match your current filters. Try adjusting them or add a new expense.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden sm:table-cell">Category</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {expense.title}
                {/* Mobile view metadata */}
                <div className="flex flex-col text-xs text-muted-foreground sm:hidden mt-1 gap-1">
                  <span>{format(new Date(expense.date), "PPP")}</span>
                  <Badge variant="outline" className="w-fit">{expense.category}</Badge>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary">{expense.category}</Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {format(new Date(expense.date), "PPP")}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${expense.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(expense.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
