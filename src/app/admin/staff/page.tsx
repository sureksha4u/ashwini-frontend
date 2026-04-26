"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getAdminStaff, type StaffRecord } from "@/lib/api/admin";

const ROLE_COLORS: Record<string, "accent" | "success" | "warning" | "info" | "danger"> = {
  ADMIN: "danger",
  DOCTOR: "accent",
  NURSE: "success",
  RECEPTIONIST: "info",
  LAB_TECHNICIAN: "warning",
  RADIOLOGIST: "warning",
  PHARMACIST: "warning",
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminStaff()
      .then(setStaff)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.first_name ?? "").toLowerCase().includes(q) ||
      (s.last_name ?? "").toLowerCase().includes(q) ||
      (s.username ?? "").toLowerCase().includes(q) ||
      (s.role ?? "").toLowerCase().includes(q)
    );
  });

  const displayName = (s: StaffRecord) =>
    [s.first_name, s.last_name].filter(Boolean).join(" ") || s.username || s.email;

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "Staff"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Staff Management</h1>
            <p className="text-xs text-text-secondary mt-1">
              {staff.length} total · {staff.filter((s) => s.is_active).length} active
            </p>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
          <input
            className="h-9 pl-9 pr-3 w-full rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
            placeholder="Search name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Name</span><span>Email</span><span>Role</span><span>Hospital</span><span className="text-right">Status</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
              </div>
            )}
            {error && <div className="p-4 m-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}
            {!loading && filtered.length === 0 && !error && (
              <div className="flex items-center justify-center py-16 text-text-muted">
                <div className="text-center">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{search ? "No staff match." : "No staff found."}</p>
                </div>
              </div>
            )}
            {!loading && filtered.map((s) => {
              const roleColor = ROLE_COLORS[s.role ?? ""] ?? "info";
              const name = displayName(s);
              return (
                <div key={s.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_80px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={name} role="staff" size={28} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">{name}</div>
                      {s.username && <div className="text-[11px] font-mono text-text-muted">@{s.username}</div>}
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary truncate">{s.email}</span>
                  <Pill color={roleColor}>{s.role ?? "—"}</Pill>
                  <span className="text-xs font-mono text-text-muted truncate">{s.hospital_id ?? "—"}</span>
                  <div className="flex justify-end">
                    {s.is_active
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <XCircle className="w-4 h-4 text-danger" />
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
