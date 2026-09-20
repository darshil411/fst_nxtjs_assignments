import { getExpenses } from "@/lib/db";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseFilter } from "@/components/expenses/expense-filter";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";

export const metadata = {
  title: "Expenses",
  description: "Manage your expenses.",
};

export default async function ExpensesPage() {
  // Fetch expenses from the server
  const expenses = await getExpenses();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <AddExpenseDialog />
      </div>

      <div className="flex flex-col space-y-4">
        <ExpenseFilter />
        <ExpenseList initialExpenses={expenses} />
      </div>
    </div>
  );
}
