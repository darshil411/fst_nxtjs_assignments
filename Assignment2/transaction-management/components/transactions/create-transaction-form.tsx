"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/app/actions/transaction-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export function CreateTransactionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [status, setStatus] = useState<"PENDING" | "COMPLETED">("PENDING");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    setLoading(true);

    // Only transaction data is sent. The owner is resolved server-side from
    // the authenticated session — never from this form.
    const result = await createTransaction({
      title,
      description: description.trim() === "" ? undefined : description,
      amount: Number(amount),
      type,
      status,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Could not create the transaction");
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setSuccess(`Transaction ${result.data?.reference} created.`);
    setTitle("");
    setDescription("");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Consulting services"
          aria-invalid={Boolean(fieldErrors.title)}
        />
        {fieldErrors.title ? (
          <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="250.00"
          aria-invalid={Boolean(fieldErrors.amount)}
        />
        {fieldErrors.amount ? (
          <p className="text-xs text-destructive">{fieldErrors.amount[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "CREDIT" | "DEBIT")}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "PENDING" | "COMPLETED")}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional context for this transaction"
        />
        {fieldErrors.description ? (
          <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create transaction"}
      </Button>
    </form>
  );
}
