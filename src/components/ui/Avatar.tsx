"use client";

import { ROLE_COLORS, roleKey } from "@/lib/role-colors";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  role?: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({ name, role, size = 32, ring = false, className }: AvatarProps) {
  const r = ROLE_COLORS[roleKey(role)] || ROLE_COLORS.staff;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const bg = `linear-gradient(135deg, oklch(0.65 0.14 ${r.hue}), oklch(0.45 0.16 ${r.hue}))`;
  const ringStyle = ring
    ? `0 0 0 2px var(--bg-surface-1), 0 0 0 4px oklch(0.65 0.14 ${r.hue} / 0.4)`
    : undefined;

  return (
    <div
      className={cn("rounded-full grid place-items-center text-white font-semibold flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: Math.round(size * 0.4),
        boxShadow: ringStyle,
      }}
    >
      {initials}
    </div>
  );
}
