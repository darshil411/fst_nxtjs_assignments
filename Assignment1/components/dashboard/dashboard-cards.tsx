"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/types";
import { DollarSign, CreditCard, Activity } from "lucide-react";

interface DashboardCardsProps {
  expenses: Expense[];
}

export function DashboardCards({ expenses }: DashboardCardsProps) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalExpenses = expenses.length;
  
  // Get expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenses.filter((exp) => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  
  const thisMonthAmount = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime total across all categories
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${thisMonthAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {thisMonthExpenses.length} transactions this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transaction Count</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalExpenses}</div>
          <p className="text-xs text-muted-foreground">
            Total recorded transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
