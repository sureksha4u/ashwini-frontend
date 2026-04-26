"use client";

import { useState } from "react";
import { ShieldCheck, Clock, User, FileText, Database, LogIn, RefreshCw, Stethoscope, Pill } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Pill as PillBadge } from "@/components/ui/Pill";

type AuditAction = "LOGIN" | "VIEW" | "CREATE" | "UPDATE" | "DISPENSE" | "ORDER";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: AuditAction;
  resource: string;
  detail: string;
  ip: string;
}

const ACTION_ICON: Record<AuditAction, React.ReactNode> = {
  LOGIN: <LogIn className="w-3.5 h-3.5" />,
  VIEW: <FileText className="w-3.5 h-3.5" />,
  CREATE: <Database className="w-3.5 h-3.5" />,
  UPDATE: <RefreshCw className="w-3.5 h-3.5" />,
  DISPENSE: <Pill className="w-3.5 h-3.5" />,
  ORDER: <Stethoscope className="w-3.5 h-3.5" />,
};

const ACTION_COLOR: Record<AuditAction, "accent" | "success" | "info" | "warning" | "danger"> = {
  LOGIN: "info",
  VIEW: "accent",
  CREATE: "success",
  UPDATE: "warning",
  DISPENSE: "success",
  ORDER: "accent",
};

const MOCK_AUDIT: AuditEntry[] = [
  { id: "1", timestamp: "2026-04-25T09:12:00", user: "Dr. Priya Sharma", role: "DOCTOR", action: "VIEW", resource: "Patient UHID-2026-0481", detail: "Opened patient file", ip: "10.0.1.12" },
  { id: "2", timestamp: "2026-04-25T09:08:44", user: "nurse.1@ashwini.hms", role: "NURSE", action: "UPDATE", resource: "Consultation CONS-PAT-001", detail: "Vitals recorded: BP 120/80, SpO₂ 98%", ip: "10.0.1.15" },
  { id: "3", timestamp: "2026-04-25T09:05:11", user: "pharma.1@ashwini.hms", role: "PHARMACIST", action: "DISPENSE", resource: "Rx CONS-PAT-001", detail: "Dispensed 2 items — Amoxicillin, Paracetamol", ip: "10.0.1.20" },
  { id: "4", timestamp: "2026-04-25T09:01:33", user: "reception.1@ashwini.hms", role: "RECEPTIONIST", action: "CREATE", resource: "Patient UHID-2026-0512", detail: "Registered new patient — Aarav Khanna", ip: "10.0.1.10" },
  { id: "5", timestamp: "2026-04-25T08:58:20", user: "lab.1@ashwini.hms", role: "LAB_TECHNICIAN", action: "ORDER", resource: "Lab CBC-CONS-PAT-002", detail: "Results uploaded — CBC complete", ip: "10.0.1.18" },
  { id: "6", timestamp: "2026-04-25T08:55:00", user: "admin@ashwini.hms", role: "ADMIN", action: "LOGIN", resource: "Auth", detail: "Authenticated successfully", ip: "10.0.1.5" },
  { id: "7", timestamp: "2026-04-25T08:50:12", user: "Dr. Priya Sharma", role: "DOCTOR", action: "CREATE", resource: "Prescription CONS-PAT-003", detail: "Prescription finalized — 3 medicines", ip: "10.0.1.12" },
  { id: "8", timestamp: "2026-04-25T08:44:05", user: "radiology.1@ashwini.hms", role: "RADIOLOGIST", action: "UPDATE", resource: "Study RAD-CONS-PAT-001", detail: "Marked reviewed — chest X-ray", ip: "10.0.1.22" },
];

export default function AdminAuditLogPage() {
  const [filter, setFilter] = useState<AuditAction | "ALL">("ALL");

  const filtered = filter === "ALL" ? MOCK_AUDIT : MOCK_AUDIT.filter((e) => e.action === filter);
  const actions: Array<AuditAction | "ALL"> = ["ALL", "LOGIN", "VIEW", "CREATE", "UPDATE", "DISPENSE", "ORDER"];

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "Audit Log"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              Audit Log
            </h1>
            <p className="text-xs text-text-secondary mt-1">All staff actions · today</p>
          </div>
        </div>

        <div className="px-3 py-2 bg-warning-soft border border-warning/30 rounded-lg text-xs text-text-secondary flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          Full audit persistence requires backend event logging. Placeholder data shown below.
        </div>

        <div className="flex gap-2 flex-wrap">
          {actions.map((a) => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === a
                  ? "bg-accent text-white"
                  : "bg-surface-1 text-text-muted hover:bg-surface-2 border border-border-subtle"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[160px_2fr_1fr_1fr_3fr_100px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Time</span><span>User</span><span>Role</span><span>Action</span><span>Detail</span><span>IP</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((entry) => {
              const color = ACTION_COLOR[entry.action];
              return (
                <div key={entry.id} className="grid grid-cols-[160px_2fr_1fr_1fr_3fr_100px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <span className="text-sm text-text-primary truncate">{entry.user}</span>
                  </div>
                  <span className="text-xs font-mono text-text-secondary">{entry.role}</span>
                  <PillBadge color={color}>
                    <span className="flex items-center gap-1">{ACTION_ICON[entry.action]}{entry.action}</span>
                  </PillBadge>
                  <div className="min-w-0">
                    <div className="text-xs text-text-secondary truncate">{entry.detail}</div>
                    <div className="text-[11px] font-mono text-text-muted truncate">{entry.resource}</div>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">{entry.ip}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
