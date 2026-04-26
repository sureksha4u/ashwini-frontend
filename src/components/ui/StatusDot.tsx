"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  color?: "success" | "warning" | "danger" | "info" | "muted";
  size?: number;
  pulse?: boolean;
  className?: string;
}

const COLORS = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-text-muted",
};

export function StatusDot({ color = "success", size = 6, pulse = false, className }: StatusDotProps) {
  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      {pulse && (
        <span
          className={cn("absolute rounded-full opacity-40 animate-ashw-pulse", COLORS[color])}
          style={{ inset: -2 }}
        />
      )}
      <span className={cn("absolute inset-0 rounded-full", COLORS[color])} />
    </span>
  );
}
