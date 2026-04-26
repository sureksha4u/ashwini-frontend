"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Users, Pill, MessageSquare, Settings, LogOut,
  ClipboardList, Box, Clock, AlertTriangle, User, Calendar,
  Search, Activity, Beaker, BarChart, Scan, Receipt,
  Building, ShieldCheck, Server, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMe } from "@/lib/api/users";
import type { UserResponse } from "@/lib/types";
import type { UserRole } from "@/lib/types/role";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { StatusDot } from "@/components/ui/StatusDot";

type RoleKey =
  | "doctor" | "pharmacist" | "receptionist" | "nurse"
  | "lab" | "radiology" | "billing" | "admin" | "staff";

interface NavEntry {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV_BY_ROLE: Record<RoleKey, NavEntry[]> = {
  doctor: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Templates", href: "/templates", icon: ClipboardList },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: 4 },
  ],
  pharmacist: [
    { label: "Inventory", href: "/pharmacy", icon: Box },
    { label: "Dispensing", href: "/pharmacy/dispensing", icon: Pill },
    { label: "Expiring", href: "/pharmacy/expiring", icon: Clock },
    { label: "Low Stock", href: "/pharmacy/low-stock", icon: AlertTriangle },
    { label: "Messages", href: "/messages", icon: MessageSquare },
  ],
  receptionist: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Register", href: "/reception/register", icon: User },
    { label: "Queue", href: "/reception/queue", icon: ClipboardList },
    { label: "Appointments", href: "/reception/appointments", icon: Calendar },
    { label: "Lookup", href: "/reception/patient-lookup", icon: Search },
  ],
  nurse: [
    { label: "Queue", href: "/nurse/queue", icon: ClipboardList },
    { label: "Vitals", href: "/nurse/vitals", icon: Activity },
    { label: "Messages", href: "/messages", icon: MessageSquare },
  ],
  lab: [
    { label: "Orders", href: "/labs/orders", icon: Beaker },
    { label: "Critical", href: "/labs/critical-alerts", icon: AlertTriangle, badge: 3 },
    { label: "Reports", href: "/labs/reports", icon: BarChart },
  ],
  radiology: [
    { label: "Queue", href: "/radiology/queue", icon: Scan },
    { label: "Critical", href: "/radiology/critical", icon: AlertTriangle, badge: 1 },
  ],
  billing: [
    { label: "Queue", href: "/billing/queue", icon: Receipt },
    { label: "Reports", href: "/billing/reports", icon: BarChart },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: Home },
    { label: "Hospitals", href: "/admin/hospitals", icon: Building },
    { label: "Staff", href: "/admin/staff", icon: Users },
    { label: "Audit Log", href: "/admin/audit-log", icon: ShieldCheck },
    { label: "System Health", href: "/admin/system-health", icon: Server },
  ],
  staff: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Messages", href: "/messages", icon: MessageSquare },
  ],
};

function pickRole(user: UserResponse | null): RoleKey {
  if (!user) return "doctor";
  const u = user as unknown as { role?: UserRole; is_admin?: boolean };
  if (u.is_admin || u.role === "ADMIN") return "admin";
  const map: Record<UserRole, RoleKey> = {
    ADMIN: "admin",
    DOCTOR: "doctor",
    PHARMACIST: "pharmacist",
    NURSE: "nurse",
    RECEPTIONIST: "receptionist",
    STAFF: "staff",
  };
  return u.role ? map[u.role] : "doctor";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getMe().then(setUser).catch(() => {});
  }, []);

  if (!mounted) return null;
  if (pathname === "/" || pathname === "/onboard") return null;

  const role = pickRole(user);
  const nav = NAV_BY_ROLE[role];

  const handleLogout = () => {
    localStorage.removeItem("ashwini_token");
    document.cookie = "ashwini_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/");
  };

  return (
    <aside
      className="w-[232px] flex-shrink-0 h-screen sticky top-0 z-50 glass border-r border-border-subtle flex flex-col gap-1 p-3.5"
      style={{ background: "var(--sidebar-bg)" }}
    >
      <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-3.5">
        <Logo size={28} />
        <Wordmark size={15} />
      </div>

      <div className="h-px bg-border-subtle -mx-3.5 mb-2" />

      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.08em] px-2.5 pt-2 pb-1">
        Workspace
      </div>

      {nav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
              isActive
                ? "bg-text-primary text-page font-semibold dark:bg-accent dark:text-page"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
            )}
          >
            <Icon size={17} strokeWidth={1.6} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white",
                  isActive ? "bg-white/20" : "bg-danger",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      <div className="h-px bg-border-subtle -mx-3.5 my-2" />

      <button
        onClick={() => router.push("/settings")}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <Settings size={17} strokeWidth={1.6} />
        <span className="flex-1 text-left">Settings</span>
      </button>

      <div className="bg-surface-2 border border-border-subtle rounded-lg px-3 py-2.5 flex items-center gap-2 mt-1">
        <StatusDot color="success" pulse />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-text-primary leading-tight">
            Production Cluster
          </div>
          <div className="text-[10px] text-text-muted leading-tight mt-0.5">
            asia-south1 · 12ms
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-danger-soft hover:text-danger transition-colors mt-1"
      >
        <LogOut size={17} strokeWidth={1.6} />
        <span className="flex-1 text-left">Sign out</span>
      </button>
    </aside>
  );
}
