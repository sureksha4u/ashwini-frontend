"use client";

import { useRouter } from "next/navigation";
import { Receipt, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";

// Billing module — billing model and backend endpoint are not yet implemented.
// This page renders the designed UI with placeholder data to unblock the role flow.
// TODO: replace with real API when billing model is added.

const MOCK_QUEUE = [
  { id: "1", token: "A-009", patient: "Mansi Tiwari", uhid: "UHID-2026-0481", dept: "Cardiology", type: "OPD", amount: 2800, status: "pending" as const },
  { id: "2", token: "A-010", patient: "Aarav Khanna",  uhid: "UHID-2026-0512", dept: "Cardiology", type: "OPD", amount: 1400, status: "pending" as const },
  { id: "3", token: "B-002", patient: "Krishna Malhotra", uhid: "UHID-2026-0488", dept: "Orthopedics", type: "OPD + labs", amount: 3200, status: "processing" as const },
  { id: "4", token: "C-001", patient: "Rohan Mehta", uhid: "UHID-2026-0501", dept: "General Medicine", type: "OPD", amount: 800, status: "paid" as const },
];

const STATUS_PILL = {
  pending: { color: "warning" as const, label: "Pending" },
  processing: { color: "accent" as const, label: "Processing" },
  paid: { color: "success" as const, label: "Paid" },
};

export default function BillingQueuePage() {
  const router = useRouter();

  const total = MOCK_QUEUE.reduce((s, r) => s + r.amount, 0);
  const pending = MOCK_QUEUE.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Billing", "Queue"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Billing Queue · Today</h1>
            <p className="text-xs text-text-secondary mt-1">
              {MOCK_QUEUE.length} visits · {pending} pending payment · ₹{total.toLocaleString("en-IN")} total
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-warning-soft border border-warning/30 rounded-lg text-xs text-text-secondary flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          Billing backend is being built. This queue shows placeholder data — real invoices and payment processing coming soon.
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[80px_2fr_1fr_1fr_120px_120px_140px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Token</span><span>Patient</span><span>Dept</span><span>Type</span><span>Amount</span><span>Status</span><span className="text-right">Action</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_QUEUE.map((r) => {
              const sp = STATUS_PILL[r.status];
              return (
                <div key={r.id} className="grid grid-cols-[80px_2fr_1fr_1fr_120px_120px_140px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors">
                  <span className="text-sm font-bold text-text-primary font-mono">{r.token}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={r.patient} role="billing" size={28} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">{r.patient}</div>
                      <div className="text-[11px] font-mono text-text-muted">{r.uhid}</div>
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">{r.dept}</span>
                  <span className="text-sm text-text-secondary">{r.type}</span>
                  <span className="text-sm font-semibold font-mono text-text-primary">₹{r.amount.toLocaleString("en-IN")}</span>
                  <Pill color={sp.color}>{sp.label}</Pill>
                  <div className="flex justify-end">
                    <Btn variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => router.push(`/patients/${r.uhid}`)}>
                      Invoice
                    </Btn>
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
