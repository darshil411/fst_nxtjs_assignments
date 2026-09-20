"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: Receipt,
    },
    {
      title: "Settings",
      href: "#",
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Overview
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", {
                  "opacity-50 cursor-not-allowed": item.disabled,
                })}
                asChild={!item.disabled}
                onClick={onNavigate}
                disabled={item.disabled}
              >
                {item.disabled ? (
                  <span className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </span>
                ) : (
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
