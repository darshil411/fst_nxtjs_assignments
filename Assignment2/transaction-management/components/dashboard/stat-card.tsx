import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="p-6 border-border/60 shadow-lg shadow-muted-foreground/5 hover:shadow-primary/10 hover:border-primary/20 transition-all rounded-[1.5rem] bg-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-secondary/80 text-secondary-foreground shadow-inner">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
