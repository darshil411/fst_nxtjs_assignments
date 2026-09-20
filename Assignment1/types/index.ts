export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Education"
  | "Health"
  | "Other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string date
  description?: string;
  createdAt: string;
}

export type SortOrder = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
