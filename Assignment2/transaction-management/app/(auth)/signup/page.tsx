// app/(auth)/signup/page.tsx
// Registration page

import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your TxnManager account",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TxnManager</span>
          </Link>
          <h1 className="mb-2 mt-6 text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="text-sm text-slate-400">
            Get started with secure transaction management
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-8 backdrop-blur-sm">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
