"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  full?: boolean;
}

const VARIANT: Record<BtnVariant, string> = {
  primary:
    "bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover shadow-[0_1px_2px_rgba(37,99,235,0.2)]",
  secondary:
    "bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-surface-2 hover:text-text-primary",
  danger: "bg-danger text-white border border-danger hover:opacity-90",
  success: "bg-success text-white border border-success hover:opacity-90",
};

const SIZE: Record<BtnSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3.5 text-[13px]",
  lg: "h-[42px] px-4.5 text-sm",
};

export function Btn({
  variant = "primary",
  size = "md",
  icon,
  full,
  children,
  className,
  ...rest
}: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none",
        VARIANT[variant],
        SIZE[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
