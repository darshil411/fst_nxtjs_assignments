"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/app/actions/transaction-actions";

export function TransactionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await createTransaction({
      title: String(form.get("title")),
      description: String(form.get("description") || "") || undefined,
      amount: Number(form.get("amount")),
      type: String(form.get("type")) as "CREDIT" | "DEBIT",
    });
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Unable to create transaction");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold">Add transaction</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input name="title" required minLength={2} placeholder="Title" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-blue-400" />
        <input name="amount" required min={0.01} step="0.01" type="number" placeholder="Amount" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-blue-400" />
        <input name="description" placeholder="Description (optional)" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-blue-400" />
        <select name="type" defaultValue="DEBIT" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-blue-400">
          <option value="DEBIT">Debit</option>
          <option value="CREDIT">Credit</option>
        </select>
      </div>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      <button disabled={pending} className="mt-5 rounded-lg bg-blue-500 px-4 py-2.5 font-semibold text-white hover:bg-blue-600 disabled:opacity-60">
        {pending ? "Saving..." : "Add transaction"}
      </button>
    </form>
  );
}
