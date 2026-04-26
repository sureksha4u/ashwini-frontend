"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getMe } from "@/lib/api/users";
import type { UserRole } from "@/lib/types/role";

interface RoleGuardProps {
  /** Roles allowed to render `children`. ADMIN is implicitly allowed everywhere. */
  allow: UserRole[];
  /** Where to send users who lack the role. Defaults to /dashboard. */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Client-side role enforcement. Pair with the backend role checks (which are
 * authoritative — this is just a UX layer that prevents obvious cross-role
 * navigation and stops the user from staring at a 403 mid-render).
 *
 * ADMIN bypasses every guard, mirroring backend RoleChecker semantics.
 */
export function RoleGuard({ allow, redirectTo = "/dashboard", children }: RoleGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (cancelled) return;
        const role = (u as unknown as { role?: UserRole }).role;
        const isAdmin = (u as unknown as { is_admin?: boolean }).is_admin;
        if (isAdmin || (role && (allow.includes(role) || role === "ADMIN"))) {
          setStatus("authorized");
        } else {
          setStatus("denied");
          router.replace(redirectTo);
        }
      })
      .catch(() => {
        // Token issue — fall back to the cookie-aware middleware which kicks
        // unauthenticated users to /.
        if (!cancelled) {
          setStatus("denied");
          router.replace("/");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [allow, redirectTo, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-page">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <>{children}</>;
}
