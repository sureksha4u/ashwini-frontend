"use client";

import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const PERMISSIONS = [
  ["Patient · clinical record", "Read", "Write", "Read (filtered)", "Read", "Read", "—", "Read"],
  ["Prescription", "—", "Write", "—", "Read", "—", "—", "Read"],
  ["Lab orders & results", "—", "Write", "—", "—", "Write", "—", "Read"],
  ["Radiology orders", "—", "Write", "—", "—", "—", "Write", "Read"],
  ["Pharmacy stock", "—", "Read", "Write", "—", "—", "—", "Read"],
  ["Dispense", "—", "—", "Write", "—", "—", "—", "Read"],
  ["Billing & invoice", "Write", "Read", "Read", "—", "—", "—", "Read"],
  ["User management", "—", "—", "—", "—", "—", "—", "Write"],
  ["Audit log", "—", "—", "—", "—", "—", "—", "Read"],
  ["Branch settings", "—", "—", "—", "—", "—", "—", "Write"],
];

const HEADERS = ["Permission", "Reception", "Doctor", "Pharmacist", "Nurse", "Lab", "Radiology", "Admin"];

function CellPill({ value }: { value: string }) {
  if (value === "—") return <span className="text-text-muted text-[14px]">—</span>;
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10.5px] font-semibold",
      value === "Write" ? "bg-success-soft text-success" :
      value.startsWith("Read") ? "bg-info-soft text-info" : "bg-warning-soft text-warning"
    )}>
      {value}
    </span>
  );
}

export default function AdminAccessPage() {
  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "Access control"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-semibold">Role-based access control</h1>
          <p className="text-[12px] text-text-secondary mt-1">HIPAA minimum-necessary enforced · changes are versioned & audited</p>
        </div>
        <div className="flex-1 bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
          <div className="grid px-5 py-3 bg-surface-2 border-b border-border-subtle"
            style={{ gridTemplateColumns: "2.4fr repeat(7, 1fr)" }}>
            {HEADERS.map((h, i) => (
              <span key={h} className={cn("text-[10px] font-semibold text-text-muted uppercase tracking-widest", i > 0 && "text-center")}>{h}</span>
            ))}
          </div>
          {PERMISSIONS.map((row, ri) => (
            <div key={ri} className="grid px-5 py-3 items-center border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors"
              style={{ gridTemplateColumns: "2.4fr repeat(7, 1fr)" }}>
              <span className="text-[13px] font-semibold">{row[0]}</span>
              {row.slice(1).map((c, ci) => (
                <div key={ci} className="flex justify-center">
                  <CellPill value={c} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-muted">All permission changes are logged in the audit trail and require admin confirmation.</p>
      </main>
    </div>
  );
}
