"use client";

import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  change?: number;
  sparkline?: number[];
  icon?: React.ReactNode;
  accent?: "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const ACCENT_COLOR: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

const TREND_COLOR = {
  up: "text-success",
  down: "text-danger",
  flat: "text-text-muted",
};

export function KpiCard({
  label,
  value,
  trend = "flat",
  change,
  sparkline,
  icon,
  accent = "accent",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-1 border border-border-subtle rounded-xl p-5 shadow-soft flex flex-col gap-3",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-semibold text-text-primary mt-1.5 tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${ACCENT_COLOR[accent]}1a`, color: ACCENT_COLOR[accent] }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        {typeof change === "number" && (
          <span className={cn("text-xs font-semibold", TREND_COLOR[trend])}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
            {" "}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {sparkline && sparkline.length > 1 && (
          <Sparkline
            values={sparkline}
            color={ACCENT_COLOR[accent]}
            width={120}
            height={32}
          />
        )}
      </div>
    </div>
  );
}
