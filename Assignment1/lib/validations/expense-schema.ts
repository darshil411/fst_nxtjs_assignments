import * as z from "zod";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Education",
  "Health",
  "Other",
] as const;

export const expenseSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  amount: z.coerce
    .number({
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date format",
  }),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
