import { cn } from "@/lib/utils";

type BadgeVariant = "waiting" | "in-consultation" | "completed" | "x-ray-pending" | "done" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "in-consultation": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "x-ray-pending": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  done: "bg-surface-2 text-text-secondary dark:bg-gray-800 dark:text-text-muted",
  default: "bg-surface-2 text-text-secondary dark:bg-gray-800 dark:text-text-muted",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
