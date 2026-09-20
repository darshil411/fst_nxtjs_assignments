import { Expense } from "@/types";

// In-memory store for demonstration purposes
// In a real application, this would be replaced with a database (e.g., PostgreSQL + Prisma/Drizzle)

let expenses: Expense[] = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: 120.5,
    category: "Food",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    description: "Weekly groceries at Trader Joe's",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Monthly Subway Pass",
    amount: 132.0,
    category: "Transport",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "3",
    title: "Movie Tickets",
    amount: 35.0,
    category: "Entertainment",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    description: "Dune: Part Two with friends",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export async function getExpenses(): Promise<Expense[]> {
  // Simulate network delay for Suspense demonstration
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return [...expenses];
}

export async function addExpense(expenseData: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const newExpense: Expense = {
    ...expenseData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };
  
  expenses = [newExpense, ...expenses];
  return newExpense;
}

export async function deleteExpense(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const initialLength = expenses.length;
  expenses = expenses.filter(e => e.id !== id);
  
  return expenses.length < initialLength;
}
