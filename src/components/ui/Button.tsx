import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-blue-600 active:bg-blue-700",
  outline: "border border-gray-300 dark:border-border-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-dark",
  ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark",
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
