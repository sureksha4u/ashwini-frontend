"use client";

import { cn } from "@/lib/utils";

type PillColor = "accent" | "success" | "warning" | "danger" | "info";

interface PillProps {
  color?: PillColor;
  soft?: boolean;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SOFT: Record<PillColor, string> = {
  accent: "bg-accent-soft text-accent border border-accent/20",
  success: "bg-success-soft text-success border border-success/20",
  warning: "bg-warning-soft text-warning border border-warning/20",
  danger: "bg-danger-soft text-danger border border-danger/20",
  info: "bg-info-soft text-info border border-info/20",
};

const SOLID: Record<PillColor, string> = {
  accent: "bg-accent text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  info: "bg-info text-white",
};

export function Pill({ color = "accent", soft = true, mono, className, children }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap",
        soft ? SOFT[color] : SOLID[color],
        mono && "font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
}
