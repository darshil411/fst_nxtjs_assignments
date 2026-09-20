// app/layout.tsx
// Root layout with session provider

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TxnManager — Multi-Tenant Transaction Management",
    template: "%s | TxnManager",
  },
  description:
    "A secure, role-based transaction management system built with Next.js, Prisma, and Better Auth.",
  keywords: ["transactions", "management", "finance", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
