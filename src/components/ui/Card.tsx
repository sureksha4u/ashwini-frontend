"use client";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ noPadding, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-1 border border-border-subtle rounded-xl shadow-soft",
        !noPadding && "p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
