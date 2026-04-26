import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-blue-600 active:bg-blue-700",
  outline: "border border-border-strong text-text-primary hover:bg-surface-2",
  ghost: "text-text-secondary hover:bg-surface-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

export function Button({ variant = "primary", icon, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}
