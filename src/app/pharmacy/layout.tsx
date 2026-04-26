"use client";

import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PHARMACY_ROLES } from "@/lib/types/role";
import { usePathname } from "next/navigation";

function pharmacyBreadcrumb(pathname: string): string[] {
  if (pathname.startsWith("/pharmacy/dispensing")) return ["Pharmacy", "Dispensing"];
  if (pathname.startsWith("/pharmacy/expiring")) return ["Pharmacy", "Expiring"];
  if (pathname.startsWith("/pharmacy/low-stock")) return ["Pharmacy", "Low Stock"];
  return ["Pharmacy", "Inventory"];
}

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard allow={PHARMACY_ROLES}>
      <div className="flex flex-col h-screen bg-page">
        <Header breadcrumb={pharmacyBreadcrumb(pathname)} />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
