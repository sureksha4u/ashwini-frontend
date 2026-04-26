"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  UserPlus, Users, Activity, BarChart3, Mail,
  Shield, ArrowRight, X, Loader2, CheckCircle2,
  FolderOpen, Search, Stethoscope, Clock,
} from "lucide-react";
import { inviteUser, getMe } from "@/lib/api/users";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { getDashboardKpis, type DashboardKpis } from "@/lib/api/dashboard";
import type { UserResponse } from "@/lib/types";
import { Btn } from "@/components/ui/Btn";
import { Avatar } from "@/components/ui/Avatar";
import { KpiCard } from "@/components/ui/KpiCard";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [kpiError, setKpiError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; token?: string; error?: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.push("/"))
      .finally(() => setIsLoadingUser(false));
    // Independent fetch — a KPI failure should not bounce the user to login.
    getDashboardKpis()
      .then(setKpis)
      .catch((e: unknown) => setKpiError(e instanceof Error ? e.message : String(e)));
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchPatients(searchQuery.trim());
        setSearchResults(data);
        setShowSearchDropdown(true);
      } catch (err: unknown) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteResult(null);
    try {
      const res = await inviteUser({ email: inviteEmail, first_name: inviteFirstName, last_name: inviteLastName });
      setInviteResult({ success: true, token: res.invitation_token });
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
    } catch (err: unknown) {
      setInviteResult({ success: false, error: err instanceof Error ? err.message : "Failed to send invitation" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleOpen = (p: PatientSearchResult) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    router.push(`/patients/${p.patient_id}`);
  };

  if (isLoadingUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-page">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
          <p className="text-text-muted font-semibold uppercase tracking-widest text-[10px]">
            Loading Workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Workspace", "Dashboard"]} />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                Good {greeting()}, {user?.first_name || "Doctor"}
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Here&apos;s your clinical workspace at a glance.
              </p>
            </div>
            {user?.is_admin && (
              <Btn icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>
                Invite User
              </Btn>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {kpiError && (
              <div className="col-span-4 px-4 py-3 bg-danger-soft border border-danger/20 rounded-lg text-sm text-danger">
                Failed to load KPIs: {kpiError}
              </div>
            )}
            <KpiCard
              label="Patients today"
              value={kpis?.patients_today.value ?? "—"}
              accent="accent"
              icon={<Users size={18} strokeWidth={1.6} />}
              trend={kpis?.patients_today.trend === "down" ? "down" : kpis?.patients_today.trend === "up" ? "up" : "flat"}
              change={kpis?.patients_today.change ?? undefined}
              sparkline={kpis?.patients_today.sparkline ?? []}
            />
            <KpiCard
              label="Active consults"
              value={kpis?.active_consults.value ?? "—"}
              accent="info"
              icon={<Stethoscope size={18} strokeWidth={1.6} />}
              sparkline={kpis?.active_consults.sparkline ?? []}
            />
            <KpiCard
              label="Avg wait"
              value={kpis?.avg_wait_minutes.value ?? "—"}
              accent="warning"
              icon={<Clock size={18} strokeWidth={1.6} />}
            />
            <KpiCard
              label="Total registered"
              value={kpis?.total_registered.value ?? "—"}
              accent="success"
              icon={<BarChart3 size={18} strokeWidth={1.6} />}
            />
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-xl shadow-soft p-6 relative z-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent grid place-items-center">
                <FolderOpen className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Open Patient File</h3>
                <p className="text-text-secondary text-xs mt-0.5">
                  Search by Name, UHID, or Phone Number to load a longitudinal record.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients…"
                  className="w-full pl-11 pr-12 py-3 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-4 flex items-center">
                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  </div>
                )}
              </div>

              {searchError && (
                <div className="mt-3 p-2.5 bg-danger-soft text-danger rounded-lg text-sm font-medium border border-danger/20">
                  {searchError}
                </div>
              )}

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-1 border border-border-subtle rounded-xl shadow-modal overflow-hidden z-30">
                  {searchResults.map((p) => (
                    <button
                      key={p.patient_id}
                      onClick={() => handleOpen(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-0 group"
                    >
                      <Avatar name={p.full_name || "?"} role="staff" size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm truncate">{p.full_name}</p>
                        <p className="text-xs text-text-muted truncate font-mono">
                          {p.uhid} · {p.phone}
                        </p>
                      </div>
                      <div className="text-text-muted group-hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {user?.is_admin && (
            <div className="bg-surface-1 border border-border-subtle rounded-xl shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info-soft text-info grid place-items-center">
                    <Shield className="w-5 h-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Organization Management</h3>
                    <p className="text-text-secondary text-xs mt-0.5">
                      Manage infrastructure, roles, and onboarding.
                    </p>
                  </div>
                </div>
                <Btn icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>
                  Invite User
                </Btn>
              </div>

              <div className="p-10 grid grid-cols-3 gap-4">
                <AdminCard
                  icon={<Users size={18} />}
                  label="Active staff"
                  value={kpis?.active_staff?.value ?? "—"}
                />
                <AdminCard
                  icon={<Activity size={18} />}
                  label="Branches"
                  value={kpis?.branches?.value ?? "—"}
                />
                <AdminCard
                  icon={<Shield size={18} />}
                  label="Total registered"
                  value={kpis?.total_registered.value ?? "—"}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-md bg-surface-1 rounded-2xl shadow-modal border border-border-subtle overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary">Invite Professional</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteResult(null);
                }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!inviteResult ? (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ModalField label="First Name" value={inviteFirstName} onChange={setInviteFirstName} placeholder="John" />
                    <ModalField label="Last Name" value={inviteLastName} onChange={setInviteLastName} placeholder="Smith" />
                  </div>
                  <ModalField
                    label="Email Address"
                    type="email"
                    value={inviteEmail}
                    onChange={setInviteEmail}
                    placeholder="colleague@hospital.com"
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />
                  <Btn type="submit" full size="lg" disabled={isInviting} className="mt-3">
                    {isInviting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send Invitation
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Btn>
                </form>
              ) : inviteResult.success ? (
                <div className="text-center py-2">
                  <div className="mx-auto w-12 h-12 bg-success-soft rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <h4 className="text-base font-semibold text-text-primary">Invitation Sent</h4>
                  <p className="text-sm text-text-secondary mt-1.5">
                    A secure invitation link has been generated.
                  </p>
                  <div className="mt-5 p-3 bg-surface-2 rounded-lg border border-border-subtle text-left">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest block mb-1">
                      Invitation Link
                    </label>
                    <code className="text-xs text-accent break-all font-mono">
                      {typeof window !== "undefined" ? window.location.origin : ""}/onboard?token=
                      {inviteResult.token}
                    </code>
                  </div>
                  <Btn
                    full
                    size="lg"
                    variant="secondary"
                    className="mt-5"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteResult(null);
                    }}
                  >
                    Done
                  </Btn>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-danger font-medium mb-3">{inviteResult.error}</p>
                  <Btn full variant="secondary" onClick={() => setInviteResult(null)}>
                    Try Again
                  </Btn>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function AdminCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface-2 border border-border-subtle rounded-lg p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-1 border border-border-subtle text-text-secondary grid place-items-center">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold text-text-primary mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

interface ModalFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

function ModalField({ label, value, onChange, placeholder, type = "text", icon, required }: ModalFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent">
            {icon}
          </div>
        )}
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
