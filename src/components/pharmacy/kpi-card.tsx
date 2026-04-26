"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { KPIData } from "@/lib/types/inventory";

interface KPICardProps {
  data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
  const trendColor = data.trend === "up" ? "var(--success)" : "var(--accent)";
  return (
    <div className="bg-surface-1 rounded-xl p-5 border border-border-subtle shadow-soft hover:shadow-soft-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mb-1">
            {data.label}
          </p>
          <h3 className="text-2xl font-semibold text-text-primary tracking-tight">
            {data.value}
          </h3>
        </div>
        {data.change !== 0 && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              data.trend === "up"
                ? "bg-success-soft text-success border border-success/20"
                : "bg-accent-soft text-accent border border-accent/20"
            }`}
          >
            {data.trend === "up" ? (
              <TrendingUp className="w-3 h-3" strokeWidth={2} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={2} />
            )}
            <span>{Math.abs(data.change)}%</span>
          </div>
        )}
      </div>

      <div className="-mx-1">
        <Sparkline values={data.sparkline} color={trendColor} width={240} height={48} />
      </div>

      <p className="text-[11px] text-text-muted mt-2 font-medium">Last 7 days</p>
    </div>
  );
}
