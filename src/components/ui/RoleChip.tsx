"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { ROLE_COLORS, roleKey } from "@/lib/role-colors";

export function RoleChip({ role }: { role?: string | null }) {
  const { theme } = useTheme();
  const r = ROLE_COLORS[roleKey(role)] || ROLE_COLORS.staff;
  const isLight = theme === "light";
  const bg = isLight
    ? `oklch(0.96 0.02 ${r.hue})`
    : `oklch(0.25 0.05 ${r.hue} / 0.5)`;
  const fg = isLight
    ? `oklch(0.45 0.16 ${r.hue})`
    : `oklch(0.78 0.12 ${r.hue})`;
  const border = isLight
    ? `oklch(0.88 0.04 ${r.hue})`
    : `oklch(0.35 0.07 ${r.hue} / 0.6)`;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border"
      style={{ background: bg, color: fg, borderColor: border }}
    >
      {r.label}
    </span>
  );
}
