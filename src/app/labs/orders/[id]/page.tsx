"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Check, Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTS = [
  { name: "Complete Blood Count", tube: "EDTA · 2 mL · purple cap", color: "#9333EA", checked: true },
  { name: "ESR", tube: "Citrate · 1.6 mL · black cap", color: "#1E293B", checked: true },
];

const RESULTS: Array<[string, string, string, string, "high" | "normal"]> = [
  ["Hemoglobin", "13.2", "g/dL", "12.0–15.5", "normal"],
  ["Total WBC", "11,400", "cells/µL", "4,000–11,000", "high"],
  ["RBC count", "4.6", "million/µL", "3.8–5.2", "normal"],
  ["Platelets", "2.84", "L/µL", "1.5–4.5", "normal"],
  ["Neutrophils", "72", "%", "40–70", "high"],
  ["Lymphocytes", "22", "%", "20–40", "normal"],
  ["Eosinophils", "4", "%", "1–6", "normal"],
  ["ESR", "28", "mm/hr", "0–20", "high"],
];

export default function LabOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [view, setView] = useState<"collect" | "results">("collect");
  const [resultValues, setResultValues] = useState(RESULTS.map(r => r[1]));
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Pathology", "Orders", id, view === "collect" ? "Collect" : "Enter results"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-5">
          {(["collect", "results"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors capitalize",
                view === v ? "bg-accent text-white border-accent" : "bg-surface-1 text-text-secondary border-border-subtle hover:bg-surface-2")}>
              {v === "collect" ? "Sample collection" : "Enter results"}
            </button>
          ))}
        </div>

        {view === "collect" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-mono text-text-muted mb-1">{id} · ORDER</div>
                <h2 className="text-[20px] font-semibold">Sample collection</h2>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-semibold text-[14px]">MT</div>
                <div className="flex-1">
                  <div className="font-semibold">Mansi Tiwari</div>
                  <div className="text-[12px] text-text-muted">F · 34y · O+ · UHID-2026-0481</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">FAST 8h ✓</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2">Tests requested · {TESTS.length}</div>
                {TESTS.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-surface-2">
                    <div className="w-7 h-9 rounded flex-shrink-0 relative" style={{ background: t.color }}>
                      <div className="absolute top-0 left-0 right-0 h-2 rounded-t" style={{ background: "rgba(255,255,255,0.12)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold">{t.name}</div>
                      <div className="text-[11px] text-text-muted">{t.tube}</div>
                    </div>
                    {t.checked && <div className="w-5 h-5 rounded bg-success flex items-center justify-center"><Check size={12} color="white" strokeWidth={3} /></div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-auto">
                <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-2">Cancel</button>
                <div className="flex-1" />
                <button className="px-4 py-2 rounded-lg bg-surface-1 border border-border-subtle text-[13px] font-semibold text-danger hover:bg-danger-soft">Reject sample</button>
                <button onClick={() => setView("results")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-white text-[13px] font-semibold hover:opacity-90">
                  <Check size={14} /> Mark collected
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="text-[13px] font-semibold mb-3">Barcode label preview</div>
                <div className="p-4 rounded-lg bg-white text-slate-800">
                  <div className="text-[11px] font-semibold">Ashwini HMS — Tilak Nagar · Pathology</div>
                  <div className="text-[15px] font-bold font-mono my-1.5">{id}-CBC</div>
                  <div className="flex gap-0.5 h-12 my-1.5">
                    {Array.from({ length: 48 }).map((_, k) => (
                      <div key={k} className="flex-1" style={{ background: Math.random() > 0.5 ? "#0F172A" : "transparent", maxWidth: Math.random() * 4 + 1 }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono"><span>MANSI TIWARI · F34</span><span>UHID-2026-0481</span></div>
                </div>
                <button className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
                  <Download size={13} /> Print 2 labels
                </button>
              </div>
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="text-[13px] font-semibold mb-2.5">Pre-collection checklist</div>
                {["Verified patient identity (name + UHID)", "Confirmed 8h fasting", "Tubes labeled before draw", "Centrifuge available"].map(c => (
                  <div key={c} className="flex items-center gap-2 py-1.5 text-[12px]">
                    <Check size={14} className="text-success" strokeWidth={2.5} /> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-success-soft flex items-center justify-center"><Check size={28} className="text-success" /></div>
                <div className="text-[16px] font-semibold">Results submitted</div>
                <div className="text-[13px] text-text-secondary">Doctor has been notified.</div>
                <button onClick={() => router.push("/labs/orders")} className="mt-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold">Back to orders</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-semibold text-[13px]">MT</div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold">Mansi Tiwari · CBC + ESR</div>
                    <div className="text-[12px] text-text-muted">UHID-2026-0481 · sample {id} · collected 14:22 · ordered by Dr. Tiwari</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">2 abnormal flags</span>
                  <button className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">Save draft</button>
                  <button onClick={() => setSubmitted(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent-hover">
                    <Send size={13} /> Submit & notify doctor
                  </button>
                </div>

                <div className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden flex flex-col gap-0.5 p-3">
                  <div className="grid text-[9.5px] font-bold text-text-muted uppercase tracking-widest px-3.5 py-2 bg-surface-2 rounded-lg mb-1"
                    style={{ gridTemplateColumns: "2fr 1fr 1fr 1.5fr 100px" }}>
                    <span>Parameter</span><span>Value</span><span>Unit</span><span>Reference</span><span>Flag</span>
                  </div>
                  {RESULTS.map((row, i) => (
                    <div key={i} className={cn("grid px-3.5 py-2.5 items-center rounded-lg", row[4] === "high" ? "bg-danger-soft/50" : "")}
                      style={{ gridTemplateColumns: "2fr 1fr 1fr 1.5fr 100px" }}>
                      <span className="text-[13px] font-medium">{row[0]}</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-1 border border-border-subtle rounded-lg">
                        <input
                          value={resultValues[i]}
                          onChange={e => setResultValues(v => { const n = [...v]; n[i] = e.target.value; return n; })}
                          className="flex-1 w-full bg-transparent border-none outline-none text-[13px] font-mono font-semibold"
                          style={{ color: row[4] === "high" ? "var(--danger)" : "var(--text-primary)" }}
                        />
                      </div>
                      <span className="text-[12px] font-mono text-text-muted">{row[2]}</span>
                      <span className="text-[12px] font-mono text-text-secondary">{row[3]}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10.5px] font-semibold w-fit", row[4] === "high" ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>
                        {row[4] === "high" ? "↑ HIGH" : "✓ in range"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                  <div className="text-[13px] font-semibold mb-2">Pathologist&apos;s impression</div>
                  <div className="p-3 rounded-lg bg-surface-2 text-[13px] leading-relaxed text-text-secondary">
                    Mild leukocytosis with neutrophilic predominance, raised ESR — consistent with low-grade inflammatory process. Suggest correlation with clinical features. No platelet or red cell abnormality.
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
