import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon, trend, className }: KpiCardProps) {
  return (
    <div className={cn("kpi-card", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.07em] text-muted-foreground">{title}</p>
          <p className="text-[28px] font-data font-medium leading-none text-foreground">{value}</p>
          {subtitle && <p className="text-[13px] font-data text-muted-foreground">{subtitle}</p>}
          {trend && (
            <span className={cn(
              "inline-block text-[11px] font-data font-medium px-2 py-0.5 rounded-sm border",
              trend.positive ? "text-foreground bg-secondary" : "text-destructive bg-destructive/5 border-destructive/20"
            )}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}
