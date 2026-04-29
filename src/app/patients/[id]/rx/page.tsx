"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search, X, Sparkles, Check, Plus, Pill, FlaskConical,
  Calendar, ChevronRight, Clipboard, Save, Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONO = "font-mono";

const TEMPLATES = [
  {
    id: "t2dm",
    name: "T2DM follow-up",
    tag: "Endo",
    uses: 44,
    chiefComplaint: "Diabetic follow-up — sugar control review, medication compliance, foot care.",
    notes: "Subjective: FBS controlled at 124. HbA1c 7.2% (prev 7.8%). Compliant with meds. No hypoglycaemic episodes.\nObjective: BP 128/84. BMI 27.2. No neuropathy signs.\nAssessment: T2DM — improving control. Continue current regime.\nPlan: Continue Metformin, add Teneligliptin for better HbA1c target.",
    diagnosis: "Type 2 DM without complications (E11.9)",
    meds: [
      { drug: "Metformin 500mg", route: "PO", freq: "1-0-1", dur: "90 d", when: "After food" },
      { drug: "Teneligliptin 20mg", route: "PO", freq: "OD", dur: "90 d", when: "Before breakfast" },
      { drug: "Telmisartan 40mg", route: "PO", freq: "OD", dur: "90 d", when: "Morning" },
    ],
    labs: ["FBS / PPBS", "HbA1c", "Lipid profile", "Creatinine", "Urine microalbumin"],
    followup: 90,
    instructions: "Diet: low GI. Walk 30 min/day. Monitor FBS at home every morning. Alert if FBS >200 or <80.",
    referral: "Ophthalmology — annual fundus check",
  },
];

const HISTORY = [
  { date: "12 Mar", visit: "BP review", note: "Telmisartan continued" },
  { date: "28 Feb", visit: "Viral fever", note: "Sympt Rx" },
  { date: "10 Jan", visit: "Annual", note: "CBC, Lipid normal" },
];

export default function RxBoardBPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [appliedId, setAppliedId] = useState<string | null>("t2dm");
  const [templateSearch, setTemplateSearch] = useState("");

  const tpl = TEMPLATES.find(t => t.id === appliedId);
  const isApplied = !!tpl;

  function clearTemplate() { setAppliedId(null); }

  return (
    <div className="flex flex-col h-screen bg-page">
      {/* Compact command bar */}
      <div className="h-[52px] flex-shrink-0 flex items-center gap-3 px-5 bg-surface-1 border-b border-border-subtle">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12h4l2-7 4 14 2-7h6"/>
          </svg>
        </div>
        <div className="w-px h-4 bg-border-subtle" />
        <span className="text-[12.5px] font-semibold">Rakesh Kumar</span>
        <span className="text-[11px] text-text-muted font-mono">· UHID TN-2024-04812 · M / 42</span>
        <div className="flex-1" />

        {/* Template command bar */}
        <div className={cn(
          "flex items-center gap-2 w-[460px] px-3 h-9 rounded-lg border transition-colors",
          isApplied ? "bg-accent/8 border-accent/20" : "bg-surface-2 border-border-subtle"
        )}>
          {isApplied && tpl ? (
            <>
              <Sparkles size={12} className="text-accent flex-shrink-0" />
              <span className="text-[9.5px] font-bold text-accent uppercase tracking-widest">Template</span>
              <span className="text-[13px] font-semibold text-text-primary">{tpl.name}</span>
              <span className="text-[11px] text-text-secondary font-mono">· {tpl.meds.length}m · {tpl.labs.length}l · {tpl.followup}d</span>
              <div className="flex-1" />
              <button onClick={clearTemplate} className="text-text-muted hover:text-danger"><X size={12} /></button>
            </>
          ) : (
            <>
              <Search size={12} className="text-text-muted flex-shrink-0" />
              <input
                value={templateSearch}
                onChange={e => setTemplateSearch(e.target.value)}
                placeholder="Search a template — symptom, diagnosis, name…"
                className="flex-1 bg-transparent text-[12.5px] text-text-primary placeholder:text-text-muted outline-none"
              />
              <span className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] font-mono text-text-secondary">⌘T</span>
              {TEMPLATES.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                <button key={t.id} onClick={() => { setAppliedId(t.id); setTemplateSearch(""); }}
                  className="text-[11.5px] font-medium text-accent hover:underline">{t.name}</button>
              ))}
            </>
          )}
        </div>

        <div className="flex-1" />
        <span className="text-[11px] text-text-muted font-mono">Auto-saved · 4:32 PM</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-danger" />
          <span className="text-[11px] font-mono font-semibold">04:18</span>
        </div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-medium text-text-secondary hover:bg-surface-2">
          <X size={12} /> End
        </button>
      </div>

      {/* Vitals strip */}
      <div className="flex items-center gap-5 px-5 py-2 bg-surface-2 border-b border-border-subtle text-[11.5px]">
        <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-widest">Vitals</span>
        {[["BP", "128/84", ""], ["HR", "88", ""], ["T", "99.4°F", "text-warning"], ["SpO₂", "98%", "text-success"], ["FBS", "124", "text-warning"], ["HbA1c", "7.2", "text-warning"]].map(([k, v, c]) => (
          <span key={k} className="text-text-secondary">
            <span className="text-text-muted mr-1">{k}</span>
            <span className={cn("font-mono font-semibold", c || "text-text-primary")}>{v}</span>
          </span>
        ))}
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-danger-soft text-danger text-[10.5px] font-semibold">⚠ Penicillin allergy</span>
        <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">G6PD</span>
        <span className="px-2 py-0.5 rounded-full bg-surface-1 border border-border-subtle text-text-muted text-[10.5px]">14th visit</span>
      </div>

      {/* 3-column body */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: "320px 1fr 320px" }}>
        {/* LEFT — context */}
        <div className="border-r border-border-subtle p-4 overflow-y-auto flex flex-col gap-3 bg-page">
          <SectionHead label="Chief complaint" filled={isApplied} />
          <div className={cn(
            "px-3 py-2.5 rounded-lg text-[12.5px] leading-relaxed border",
            isApplied ? "bg-accent/5 border-accent/20 text-text-primary" : "bg-surface-1 border-border-subtle text-text-muted italic"
          )}>
            {isApplied && tpl ? tpl.chiefComplaint : "—"}
          </div>

          <SectionHead label="Clinical notes (SOAP)" filled={isApplied} />
          <div className={cn(
            "px-3 py-2.5 rounded-lg text-[12px] leading-relaxed border whitespace-pre-line",
            isApplied ? "bg-accent/5 border-accent/20 text-text-primary" : "bg-surface-1 border-border-subtle text-text-muted italic"
          )}>
            {isApplied && tpl ? tpl.notes : "—"}
          </div>

          <SectionHead label="Diagnosis" filled={isApplied} />
          <div className={cn(
            "px-3 py-2.5 rounded-lg border",
            isApplied ? "bg-accent/5 border-accent/20" : "bg-surface-1 border-border-subtle"
          )}>
            <div className="text-[13px] font-semibold text-text-primary">{isApplied && tpl ? tpl.diagnosis : "—"}</div>
            {isApplied && (
              <div className="flex gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-success-soft text-success text-[10px] font-semibold">primary</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-2 text-text-muted text-[10px]">+ comorbidity</span>
              </div>
            )}
          </div>

          <SectionHead label="History · last 90d" />
          <div className="flex flex-col gap-1.5">
            {HISTORY.map((h, i) => (
              <div key={i} className="grid gap-1.5 px-2 py-1.5 rounded-lg bg-surface-1 border border-border-subtle text-[11px]" style={{ gridTemplateColumns: "48px 1fr" }}>
                <span className="font-mono text-text-muted text-[10px] self-start mt-0.5">{h.date}</span>
                <div>
                  <div className="font-medium text-text-primary text-[11.5px]">{h.visit}</div>
                  <div className="text-text-secondary text-[10.5px]">{h.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE — Rx */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {/* Applied banner */}
          {isApplied && tpl && (
            <div className="flex items-stretch rounded-xl overflow-hidden border border-accent/20">
              <div className="w-1 bg-accent flex-shrink-0" />
              <div className="flex-1 px-4 py-3 bg-accent/[0.06] flex items-center gap-3">
                <Sparkles size={14} className="text-accent flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[12.5px] font-semibold text-text-primary">
                    Applied: <span className="text-accent">{tpl.name}</span>
                    <span className="text-[11px] text-text-secondary font-normal ml-2">— auto-filled 6 sections · {tpl.uses} prior uses · v4</span>
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5">Review every field. Verified fields turn neutral on submit.</div>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px] font-medium text-text-secondary hover:bg-surface-2">
                  <Edit size={11} /> Edit template
                </button>
                <button onClick={clearTemplate} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px] font-medium text-text-secondary hover:bg-surface-2">
                  <X size={11} /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Medicines */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={14} />
              <span className="text-[13px] font-semibold">Medicines</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                isApplied ? "bg-accent/10 text-accent" : "bg-surface-2 text-text-muted"
              )}>
                {isApplied && tpl ? `${tpl.meds.length} from template` : "0 added"}
              </span>
              <div className="flex-1" />
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px] font-semibold text-text-secondary hover:bg-surface-2">
                <Plus size={11} /> Add medicine
              </button>
            </div>
            <div className="grid text-[9.5px] font-bold text-text-muted uppercase tracking-widest px-3 py-1.5 bg-surface-2 rounded-lg mb-1"
              style={{ gridTemplateColumns: "1.7fr 60px 90px 80px 1.2fr 24px" }}>
              <span>Drug</span><span>Route</span><span>Freq</span><span>Duration</span><span>Notes</span><span />
            </div>
            {isApplied && tpl ? tpl.meds.map((m, i) => (
              <div key={i} className="grid items-center gap-2 py-2 border-b border-border-subtle last:border-b-0"
                style={{ gridTemplateColumns: "1.7fr 60px 90px 80px 1.2fr 24px" }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded bg-accent/50 flex-shrink-0" />
                  <span className="text-[12.5px] font-semibold text-text-primary truncate">{m.drug}</span>
                </div>
                <span className="text-[11.5px] font-mono text-text-secondary">{m.route}</span>
                <span className="text-[12px] font-mono font-semibold text-accent">{m.freq}</span>
                <span className="text-[11.5px] font-mono text-text-secondary">{m.dur}</span>
                <span className="text-[11px] italic text-text-muted">{m.when}</span>
                <button className="text-text-muted hover:text-danger"><X size={11} /></button>
              </div>
            )) : (
              <div className="py-6 text-center text-[12px] text-text-muted italic">No medicines yet.</div>
            )}
          </div>

          {/* Labs */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical size={14} />
              <span className="text-[13px] font-semibold">Lab orders</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", isApplied ? "bg-accent/10 text-accent" : "bg-surface-2 text-text-muted")}>
                {isApplied && tpl ? `${tpl.labs.length} from template` : "0"}
              </span>
              <div className="flex-1" />
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px] font-semibold text-text-secondary hover:bg-surface-2">
                <Plus size={11} /> Add lab
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {isApplied && tpl && tpl.labs.map((l, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-medium">
                  <span className="w-0.5 h-3.5 rounded-full bg-accent" />
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Follow-up + referral */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={13} />
                <span className="text-[12px] font-semibold">Follow-up</span>
                {isApplied && <span className="text-[9.5px] font-bold text-accent">✦ template</span>}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn("text-[32px] font-semibold font-mono", isApplied ? "text-accent" : "text-text-muted")}>
                  {isApplied && tpl ? tpl.followup : "—"}
                </span>
                <span className="text-[13px] text-text-secondary">days</span>
              </div>
              {isApplied && tpl && <div className="text-[11px] text-text-muted font-mono mt-1">26 Jun · Wed · GP slot</div>}
            </div>
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight size={13} />
                <span className="text-[12px] font-semibold">Referral</span>
                {isApplied && tpl?.referral && <span className="text-[9.5px] font-bold text-accent">✦ template</span>}
              </div>
              <div className="text-[12.5px] text-text-primary">
                {isApplied && tpl?.referral ? tpl.referral : <span className="text-text-muted italic">None.</span>}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clipboard size={13} />
              <span className="text-[12px] font-semibold">General instructions</span>
              {isApplied && <span className="text-[9.5px] font-bold text-accent">✦ template</span>}
            </div>
            <div className="text-[12.5px] text-text-primary leading-relaxed">
              {isApplied && tpl ? tpl.instructions : "—"}
            </div>
          </div>
        </div>

        {/* RIGHT — template detail */}
        <div className="border-l border-border-subtle p-4 overflow-y-auto flex flex-col gap-4 bg-page">
          {isApplied && tpl ? (
            <>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active template</div>
                <div className="text-[14px] font-semibold mt-1">{tpl.name}</div>
                <div className="text-[11px] text-text-secondary mt-0.5">{tpl.tag} · v4 · last edited 12 Mar</div>
              </div>

              <div className="bg-surface-1 border border-border-subtle rounded-xl p-3">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Sections populated</div>
                {[
                  ["Chief complaint", "✓"],
                  ["Clinical notes", "✓"],
                  ["Diagnosis", "✓"],
                  ["Medicines", `${tpl.meds.length}`],
                  ["Lab orders", `${tpl.labs.length}`],
                  ["Follow-up", `${tpl.followup}d`],
                  ["Instructions", "✓"],
                  ["Referral", tpl.referral ? "✓" : "—"],
                ].map(([k, v], i) => (
                  <div key={String(k)} className="flex justify-between py-1.5 text-[11.5px] border-t border-border-subtle first:border-t-0">
                    <span className="text-text-secondary">{String(k)}</span>
                    <span className={cn("font-mono font-semibold", String(v) === "—" ? "text-text-muted" : "text-accent")}>{String(v)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-surface-1 border border-border-subtle rounded-xl p-3">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Usage</div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[22px] font-semibold font-mono">{tpl.uses}</span>
                  <span className="text-[11px] text-text-secondary">applies (last 12mo)</span>
                </div>
                <svg viewBox="0 0 200 30" className="w-full h-8">
                  {[12, 18, 14, 22, 28, 24, 32, 38, 30, 42, 44, 48].map((v, i, arr) => {
                    if (i === 0) return null;
                    const prev = arr[i - 1];
                    const x1 = ((i - 1) / (arr.length - 1)) * 200;
                    const x2 = (i / (arr.length - 1)) * 200;
                    const y1 = 28 - (prev / 50) * 26;
                    const y2 = 28 - (v / 50) * 26;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />;
                  })}
                </svg>
              </div>

              <div className="bg-surface-1 border border-border-subtle rounded-xl p-3">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Keyboard shortcuts</div>
                {[["⌘T", "Open template picker"], ["⌘⇧T", "Save Rx as template"], ["⌘\\", "Clear template"], ["⌘↵", "Submit prescription"]].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between py-1 text-[11px]">
                    <span className="text-text-secondary">{String(v)}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-[10px] font-mono text-text-secondary">{String(k)}</kbd>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-3.5 bg-surface-1 border border-border-subtle rounded-xl text-[12px] text-text-secondary">
              Apply a template to see its detail panel here.
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-surface-1 border-t border-border-subtle">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
          <Save size={13} /> Save as new template
        </button>
        <button className="px-3 py-2 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2">Save draft</button>
        <div className="flex-1" />
        {isApplied && (
          <span className="text-[11.5px] text-text-secondary">
            Reviewed <span className="text-success font-semibold">7 / 8</span> sections · 1 edit
          </span>
        )}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">
          <Check size={13} /> Submit prescription
        </button>
      </div>
    </div>
  );
}

function SectionHead({ label, filled }: { label: string; filled?: boolean }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      {filled && <span className="text-[9px] font-bold text-accent">✦</span>}
    </div>
  );
}
