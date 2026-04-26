import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, color = "bg-accent", className }: ProgressBarProps) {
  return (
    <div className={cn("w-full h-1.5 bg-surface-3 rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
