"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Building2, ShieldCheck, Activity, Loader2, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { getAdminStaff, getAdminHospitals, type StaffRecord, type HospitalRecord } from "@/lib/api/admin";

function StatCard({ icon, label, value, sub, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <Card className={onClick ? "cursor-pointer hover:border-accent/40 transition-colors" : ""} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">{label}</div>
          <div className="text-3xl font-semibold font-mono text-text-primary">{value}</div>
          {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
        </div>
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStaff(), getAdminHospitals()])
      .then(([s, h]) => { setStaff(s); setHospitals(h); })
      .finally(() => setLoading(false));
  }, []);

  const activeStaff = staff.filter((s) => s.is_active).length;
  const activeHospitals = hospitals.filter((h) => h.is_active).length;
  const roleBreakdown = staff.reduce<Record<string, number>>((acc, s) => {
    const r = s.role ?? "UNKNOWN";
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  const quickLinks = [
    { label: "Staff management", href: "/admin/staff", icon: <Users className="w-4 h-4" /> },
    { label: "Hospitals", href: "/admin/hospitals", icon: <Building2 className="w-4 h-4" /> },
    { label: "Audit log", href: "/admin/audit-log", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "System health", href: "/admin/system-health", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-text-secondary mt-1">Tenant management and system overview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard icon={<Users className="w-4 h-4" />} label="Total staff" value={staff.length} sub={`${activeStaff} active`} onClick={() => router.push("/admin/staff")} />
              <StatCard icon={<Building2 className="w-4 h-4" />} label="Hospitals" value={hospitals.length} sub={`${activeHospitals} active`} onClick={() => router.push("/admin/hospitals")} />
              <StatCard icon={<ShieldCheck className="w-4 h-4" />} label="Roles configured" value={Object.keys(roleBreakdown).length} sub="distinct roles" />
              <StatCard icon={<Activity className="w-4 h-4" />} label="System" value="Online" sub="all services up" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Role breakdown</h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(roleBreakdown).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-xs font-mono text-text-secondary uppercase">{role}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-accent rounded-full" style={{ width: `${Math.round((count / staff.length) * 120)}px`, minWidth: "8px" }} />
                        <span className="text-xs font-semibold text-text-primary font-mono w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(roleBreakdown).length === 0 && (
                    <p className="text-xs text-text-muted">No staff loaded.</p>
                  )}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Quick actions</h3>
                <div className="flex flex-col gap-2">
                  {quickLinks.map((l) => (
                    <button
                      key={l.href}
                      onClick={() => router.push(l.href)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 text-sm text-text-primary">
                        <span className="text-text-muted">{l.icon}</span>
                        {l.label}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
