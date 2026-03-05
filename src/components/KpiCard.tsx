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
          <p className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#475569' }}>{title}</p>
          <p className="text-[28px] font-data font-medium leading-none" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>{value}</p>
          {subtitle && <p className="text-[12px] font-data" style={{ color: '#64748b' }}>{subtitle}</p>}
          {trend && (
            <span className={trend.positive ? "badge-trend-up" : "badge-trend-down"}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(139,110,90,0.15)', color: '#D4B9A8' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
