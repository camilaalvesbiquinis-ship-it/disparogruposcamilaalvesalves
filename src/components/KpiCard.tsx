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
    <div className={cn("kpi-card animate-slide-in", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-data text-muted-foreground uppercase tracking-[0.08em]">{title}</p>
          <p className="text-[30px] font-data font-medium text-foreground leading-none tracking-tight">{value}</p>
          {subtitle && <p className="text-[12px] font-data text-muted-foreground">{subtitle}</p>}
          {trend && (
            <span className={trend.positive ? "badge-trend-up" : "badge-trend-down"}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
