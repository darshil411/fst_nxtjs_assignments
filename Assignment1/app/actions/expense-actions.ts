"use server";

import { revalidatePath } from "next/cache";
import { expenseSchema } from "@/lib/validations/expense-schema";
import { addExpense, deleteExpense } from "@/lib/db";
import { Expense } from "@/types";

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: Expense;
};

export async function createExpenseAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Parse and sanitize the payload
  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
    description: formData.get("description"),
  };

  // 2. Validate using the shared Zod schema
  const validatedFields = expenseSchema.safeParse(rawData);

  // 3. Handle validation errors
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please fix the errors in the form.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 4. Perform the mutation
  try {
    const expenseData = {
      title: validatedFields.data.title,
      amount: validatedFields.data.amount,
      category: validatedFields.data.category,
      date: validatedFields.data.date.toISOString(),
      description: validatedFields.data.description,
    };

    const newExpense = await addExpense(expenseData);

    // Revalidate paths to update Server Components
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");

    return {
      success: true,
      message: "Expense added successfully.",
      data: newExpense,
    };
  } catch (err) {
    return {
      success: false,
      message: "Failed to add expense. Please try again.",
    };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResponse> {
  try {
    const deleted = await deleteExpense(id);
    
    if (!deleted) {
      return { success: false, message: "Expense not found." };
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/expenses");

    return {
      success: true,
      message: "Expense deleted successfully.",
    };
  } catch (err) {
    return {
      success: false,
      message: "Failed to delete expense.",
    };
  }
}
