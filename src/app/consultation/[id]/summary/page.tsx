"use client";

import { useParams, useRouter } from "next/navigation";
import { Check, FileText, ArrowRight, Save, Star } from "lucide-react";
import { Header } from "@/components/layout/Header";

const AI_ROWS = [
  { label: "Chief complaint", value: "Persistent dry cough × 2 weeks; worse at night. Mild SOB on stairs. Inhaler use only PRN.", conf: "high", source: "auto-filled" },
  { label: "Diagnosis (primary)", value: "Asthma, unspecified — J45.909", conf: "high", source: "auto-filled" },
  { label: "Diagnosis (secondary)", value: "Essential hypertension — I10", conf: "high", source: "pre-existing" },
  { label: "New medication", value: "Montelukast 10 mg HS × 14 days", conf: "med", source: "edited by doctor" },
  { label: "Investigations ordered", value: "Spirometry, CBC + ESR", conf: "high", source: "auto-filled" },
  { label: "Follow-up", value: "09 May 2026 (14 days)", conf: "high", source: "auto-filled" },
];

const CONF_STYLE: Record<string, string> = {
  high: "bg-success-soft text-success",
  med: "bg-warning-soft text-warning",
  low: "bg-danger-soft text-danger",
};

const ROUTED_TO = [
  { label: "Pharmacy", value: "4 items", dot: "bg-success" },
  { label: "Lab", value: "2 orders", dot: "bg-info" },
  { label: "Patient (SMS)", value: "Rx + follow-up", dot: "bg-accent" },
  { label: "Insurance", value: "Star Health", dot: "bg-warning" },
];

export default function PostConsultSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Patients", "Mansi Tiwari", "Consultation summary"]} />
      <main className="flex-1 overflow-y-auto px-7 py-7">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-5">
          {/* Success banner */}
          <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-success/20"
            style={{ background: "linear-gradient(135deg, var(--success-soft, #f0fdf4), var(--surface-1))" }}>
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center flex-shrink-0">
              <Check size={22} className="text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-semibold">Consultation submitted</div>
              <div className="text-[12px] text-text-secondary mt-0.5">
                <b>Mansi Tiwari</b> · 14 min 22 sec · 4 fields auto-filled by AI · 1 reviewed and edited by you
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
              <FileText size={13} /> View Rx PDF
            </button>
            <button onClick={() => router.push("/patients")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">
              Next patient <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: "2fr 1fr" }}>
            {/* AI captured */}
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[14px] font-semibold">What the AI captured</div>
                <span className="px-2.5 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">Coming soon</span>
              </div>
              {AI_ROWS.map((r, i) => (
                <div key={i} className={`py-3 ${i > 0 ? "border-t border-border-subtle" : ""}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${CONF_STYLE[r.conf] || ""}`}>{r.conf} conf</span>
                      <span className="text-[10px] text-text-muted italic">{r.source}</span>
                    </div>
                  </div>
                  <div className="text-[13px] text-text-primary">{r.value}</div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* Session */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="text-[13px] font-semibold mb-3">Session</div>
                {[
                  ["Started", "12:24 PM"],
                  ["Ended", "12:38 PM"],
                  ["Duration", "14m 22s"],
                  ["Words spoken", "1,247"],
                  ["Recording", "On-device · purged at 24h"],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between py-1.5 text-[12px]">
                    <span className="text-text-secondary">{String(l)}</span>
                    <span className="font-semibold font-mono">{String(v)}</span>
                  </div>
                ))}
              </div>

              {/* Routed to */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="text-[13px] font-semibold mb-3">Routed to</div>
                {ROUTED_TO.map((r, i) => (
                  <div key={r.label} className={`flex items-center gap-2 py-1.5 ${i > 0 ? "border-t border-border-subtle" : ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.dot}`} />
                    <span className="text-[12px] font-semibold flex-1">{r.label}</span>
                    <span className="text-[11px] text-text-secondary font-mono">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Save options */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="text-[13px] font-semibold mb-3">Save this consult as…</div>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
                  <Save size={13} /> Save as new template
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2 mt-1.5">
                  <Star size={13} /> Pin to favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
