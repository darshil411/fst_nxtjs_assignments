"use client";

import { Expense } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No recent expenses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {recent.map((expense) => (
        <div key={expense.id} className="flex items-center">
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{expense.title}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(expense.date), "PPP")}
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {expense.category}
            </Badge>
            <div className="font-medium">+${expense.amount.toFixed(2)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
