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
          <p className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>{title}</p>
          <p className="text-[32px] font-data font-medium leading-none" style={{ color: '#1C1917' }}>{value}</p>
          {subtitle && <p className="text-[14px] font-data" style={{ color: '#A09890' }}>{subtitle}</p>}
          {trend && (
            <span className={trend.positive ? "badge-trend-up" : "badge-trend-down"}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#F5EDE5', color: '#8B6E5A' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
