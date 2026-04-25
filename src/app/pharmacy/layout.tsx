'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Pill, Users, LayoutDashboard } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { PHARMACY_ROLES } from "@/lib/types/role";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard allow={PHARMACY_ROLES}>
    <div className="min-h-screen bg-[#F8FAFC] w-full overflow-y-auto">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0]">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Pill className="w-5 h-5 text-white" strokeWidth={1.25} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#0F172A] tracking-tight">Ashwini HMS</h1>
                <p className="text-xs text-[#64748B] tracking-wide">PHARMACY MODULE</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex gap-2">
              <NavLink 
                href="/pharmacy" 
                icon={LayoutDashboard}
                label="Inventory"
                active={pathname === '/pharmacy'}
              />
              <NavLink 
                href="/pharmacy/dispensing" 
                icon={Users}
                label="Patient Dispensing"
                active={pathname === '/pharmacy/dispensing'}
              />
            </nav>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F172A]">Dr. Ananya Singh</p>
                <p className="text-xs text-[#64748B]">Pharmacist</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-sm font-medium shadow-lg">
                AS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {children}
      </main>
    </div>
    </RoleGuard>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200
        ${active 
          ? 'bg-[#0F172A] text-white shadow-md shadow-slate-900/10' 
          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
        }
      `}
    >
      <Icon className="w-4 h-4" strokeWidth={1.25} />
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </Link>
  );
}
