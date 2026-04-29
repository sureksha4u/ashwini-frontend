"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Maximize, Pause, Square, Bell, BellOff, Pin, Search, Sparkles, Check, Plus,
  Mic, MicOff, ChevronRight, Save, X, Clipboard, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";

const VITALS = [
  { label: "BP", value: "128/84", color: "text-success" },
  { label: "HR", value: "76", color: "text-success" },
  { label: "SpO₂", value: "98%", color: "text-success" },
  { label: "T°", value: "37.8", color: "text-warning" },
];

const TEMPLATES = [
  { id: "asthma-rev", name: "Asthma — routine review", uses: 98, pinned: true, tag: "Resp" },
  { id: "pharyngitis", name: "Acute pharyngitis", uses: 142, pinned: true, tag: "ENT/Resp" },
  { id: "htn-rev", name: "Hypertension review", uses: 76, pinned: true, tag: "CVS" },
  { id: "gastritis", name: "Acute gastritis", uses: 64, pinned: false, tag: "GI" },
  { id: "uti-female", name: "UTI (female, uncomplicated)", uses: 51, pinned: false, tag: "GU" },
  { id: "uri", name: "Upper resp. infection", uses: 47, pinned: false, tag: "Resp" },
  { id: "allergic-rh", name: "Allergic rhinitis", uses: 39, pinned: false, tag: "ENT" },
  { id: "lbp", name: "Mechanical low back pain", uses: 31, pinned: false, tag: "MSK" },
];

const MEDS = [
  { drug: "Budesonide 200mcg inhaler", route: "INH", freq: "BD", dur: "30 d", when: "Step up ICS" },
  { drug: "Montelukast 10mg", route: "PO", freq: "OD HS", dur: "30 d", when: "After food" },
  { drug: "Salbutamol 100mcg inhaler", route: "INH", freq: "PRN", dur: "ongoing", when: "Rescue" },
];

const LABS_DATA = ["PEFR (spirometry)", "Serum IgE", "AEC"];

const TRANSCRIPT_LINES = [
  { who: "DR", name: "Dr. Tiwari", time: "08:01", text: "So, what brings you in today, Mansi?", conf: null },
  { who: "PT", name: "Patient", time: "08:04", text: "Doctor, I've been coughing for almost two weeks. It's a dry cough, no phlegm.", conf: "high" },
  { who: "DR", name: "Dr. Tiwari", time: "08:18", text: "Any fever or breathlessness?", conf: null },
  { who: "PT", name: "Patient", time: "08:22", text: "No fever. But I feel short of breath on stairs. Worse at night.", conf: "high" },
  { who: "DR", name: "Dr. Tiwari", time: "08:35", text: "Are you using your inhaler regularly?", conf: null },
  { who: "PT", name: "Patient", time: "08:39", text: "Only when I feel tight. Maybe twice a week.", conf: "med" },
];

function useTimer(running: boolean) {
  const [secs, setSecs] = useState(522);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ConsultFocusPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("asthma-rev");
  const [templateApplied, setTemplateApplied] = useState(true);
  const [recording, setRecording] = useState(false);
  const [notifMuted, setNotifMuted] = useState(true);
  const [chiefComplaint, setChiefComplaint] = useState(
    "Persistent dry cough × 2 weeks; worse at night. Mild SOB on stairs. Inhaler use only PRN (~2×/wk)."
  );
  const [diagnosis, setDiagnosis] = useState("Asthma, unspecified (J45.909)");
  const timer = useTimer(true);

  const applied = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="flex h-screen w-full bg-page overflow-hidden">
      {/* Focus Rail — replaces sidebar */}
      <aside className="w-16 flex-shrink-0 bg-surface-1 border-r border-border-subtle flex flex-col items-center py-4 gap-4">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12h4l2-7 4 14 2-7h6"/>
          </svg>
        </div>
        <div className="w-8 h-px bg-border-subtle" />

        <Avatar name="Mansi Tiwari" role="doctor" size={40} />
        <div className="text-[9px] font-mono text-text-muted text-center leading-tight">UHID<br />0481</div>

        <div className="w-8 h-px bg-border-subtle" />

        <div className="flex flex-col gap-2">
          {VITALS.map(v => (
            <div key={v.label} className="text-center">
              <div className="text-[8px] font-bold text-text-muted tracking-wide">{v.label}</div>
              <div className={cn("text-[11px] font-mono font-bold leading-tight", v.color)}>{v.value}</div>
            </div>
          ))}
        </div>

        <div className="w-8 h-px bg-border-subtle" />
        <div className="text-center">
          <div className="text-[8px] font-bold text-text-muted">QUEUE</div>
          <div className="text-[12px] font-mono font-bold text-text-primary">4<span className="text-text-muted font-normal">/11</span></div>
        </div>

        <div className="flex-1" />

        <div className="px-1.5 py-2 rounded-lg bg-accent/10 border border-accent/20 flex flex-col items-center gap-1">
          <StatusDot color="success" pulse />
          <div className="text-[8px] font-bold text-accent">LIVE</div>
          <div className="text-[11px] font-mono font-bold text-accent">{timer}</div>
        </div>

        <button
          onClick={() => setNotifMuted(v => !v)}
          className="w-8 h-8 rounded-lg bg-surface-2 border border-border-subtle grid place-items-center text-text-muted hover:text-text-primary relative"
        >
          {notifMuted ? <BellOff size={13} /> : <Bell size={13} />}
          {notifMuted && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-px bg-text-muted rotate-45 absolute" />
          </div>}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Focus Header */}
        <header className="h-14 flex-shrink-0 bg-surface-1 border-b border-border-subtle flex items-center gap-4 px-5">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold">Consultation</div>
            <div className="text-[11px] text-text-secondary truncate">Mansi Tiwari · F · 34y · Asthma · Allergic to Penicillin</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
            <StatusDot color="success" pulse />
            <span className="text-[11px] font-semibold text-accent tracking-wide">CONSULTING</span>
            <span className="text-[13px] font-mono font-bold text-accent">{timer}</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-medium text-text-secondary hover:bg-surface-2">
            <Maximize size={13} /> Expand chrome
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-medium text-text-secondary hover:bg-surface-2">
            <Pause size={13} /> Pause
          </button>
          <button
            onClick={() => router.push(`/consultation/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white text-[12px] font-semibold hover:opacity-90"
          >
            <Square size={13} /> End consultation
          </button>
        </header>

        {/* Body: templates | middle | transcription */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Templates panel */}
          <div className="w-[300px] flex-shrink-0 border-r border-border-subtle bg-surface-1 flex flex-col">
            <div className="px-4 py-3.5 border-b border-border-subtle">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <div className="text-[13px] font-semibold">Templates</div>
                  <div className="text-[11px] text-text-muted">your common complaints</div>
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px] font-semibold text-text-secondary hover:bg-surface-2">
                  <Plus size={11} /> New
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-surface-2 border border-border-subtle text-text-muted">
                <Search size={12} />
                <input placeholder="Search templates… (⌘T)" className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2.5 py-1.5 flex items-center gap-1.5">
                <Pin size={9} /> Pinned · most used
              </div>
              {TEMPLATES.filter(t => t.pinned).map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => { setSelectedTemplate(tpl.id); setTemplateApplied(true); }}
                  className={cn(
                    "w-full text-left px-2.5 py-2.5 rounded-lg mb-0.5 border transition-colors",
                    tpl.id === selectedTemplate
                      ? "bg-accent/8 border-accent/20"
                      : "border-transparent hover:bg-surface-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[12.5px] flex-1 truncate font-medium", tpl.id === selectedTemplate ? "font-semibold text-accent" : "text-text-primary")}>
                      {tpl.name}
                    </span>
                    {tpl.id === selectedTemplate && <Check size={12} className="text-accent flex-shrink-0" />}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] font-mono text-text-muted">{tpl.tag}</span>
                    <span className="text-[10px] font-mono text-text-muted">used {tpl.uses}×</span>
                  </div>
                </button>
              ))}

              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2.5 py-1.5 mt-2">All templates · {TEMPLATES.length}</div>
              {TEMPLATES.filter(t => !t.pinned).map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => { setSelectedTemplate(tpl.id); setTemplateApplied(true); }}
                  className={cn(
                    "w-full text-left px-2.5 py-2.5 rounded-lg mb-0.5 border transition-colors",
                    tpl.id === selectedTemplate
                      ? "bg-accent/8 border-accent/20"
                      : "border-transparent hover:bg-surface-2"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[12.5px] flex-1 truncate font-medium", tpl.id === selectedTemplate ? "font-semibold text-accent" : "text-text-primary")}>
                      {tpl.name}
                    </span>
                    {tpl.id === selectedTemplate && <Check size={12} className="text-accent flex-shrink-0" />}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] font-mono text-text-muted">{tpl.tag}</span>
                    <span className="text-[10px] font-mono text-text-muted">used {tpl.uses}×</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-border-subtle flex items-center gap-1.5 text-[11px] text-text-muted">
              <Sparkles size={11} className="text-accent" />
              Templates auto-fill diagnosis, Rx, labs, and follow-up.
            </div>
          </div>

          {/* Consult middle */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {/* Applied banner */}
            {templateApplied && applied && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-success-soft border border-success/20">
                <Check size={14} className="text-success flex-shrink-0" />
                <span className="text-[12.5px] font-semibold text-success">Template applied: {applied.name}</span>
                <span className="text-[11px] text-text-secondary">5 fields auto-filled · review before submitting</span>
                <div className="flex-1" />
                <button className="text-[11.5px] font-medium text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-surface-2">Undo</button>
                <button className="text-[11.5px] font-medium text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-surface-2">Edit template</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Chief complaint */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest flex-1">Chief complaint</label>
                  {templateApplied && <span className="text-[9.5px] font-bold text-accent tracking-wide">✦ from template</span>}
                </div>
                <textarea
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12.5px] leading-relaxed text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
                />
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest flex-1">Examination</label>
                    <span className="text-[10px] font-mono text-text-muted">4 / 6</span>
                  </div>
                  {[
                    ["Auscultation — bilateral chest", true],
                    ["Peak expiratory flow rate", true],
                    ["Oxygen saturation", true],
                    ["Throat / pharynx", true],
                    ["Lymph nodes", false],
                    ["Heart sounds", false],
                  ].map(([label, done]) => (
                    <div key={String(label)} className="flex items-center gap-2 py-1 text-[11.5px]">
                      <div className={cn("w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center",
                        done ? "bg-success border-success" : "border-border-strong"
                      )}>
                        {done && <Check size={8} strokeWidth={3} className="text-white" />}
                      </div>
                      <span className={done ? "text-text-primary" : "text-text-secondary"}>{String(label)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest flex-1">Diagnosis</label>
                  {templateApplied && <span className="text-[9.5px] font-bold text-accent tracking-wide">✦ from template</span>}
                </div>
                <textarea
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12.5px] leading-relaxed text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
                />
                <div className="mt-3">
                  <div className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest mb-2">Medicines · {MEDS.length}</div>
                  <div className="flex flex-col gap-1">
                    {MEDS.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px]">
                        <span className="font-semibold text-text-primary flex-1">{m.drug}</span>
                        <span className="font-mono text-accent font-semibold">{m.freq}</span>
                        <span className="text-text-muted">{m.dur}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Labs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {LABS_DATA.map(l => (
                      <span key={l} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface-1 border border-border-subtle text-[11px]">
                        <FlaskConical size={9} className="text-accent" /> {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="sticky bottom-0 flex items-center gap-2 px-4 py-3 bg-surface-1 border border-border-subtle rounded-xl">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
                <Save size={13} /> Save as template
              </button>
              <button className="px-3 py-2 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2">Save draft</button>
              <div className="flex-1" />
              <span className="text-[11px] text-text-secondary">
                <Check size={11} className="inline text-success" /> Verified by Dr. Tiwari
              </span>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">
                <Check size={13} /> Submit prescription
              </button>
            </div>
          </div>

          {/* Transcription panel */}
          <div className="w-[340px] flex-shrink-0 border-l border-border-subtle bg-surface-1 flex flex-col">
            <div className="px-4 py-3.5 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold">Live transcript</span>
                  <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-semibold">Coming soon</span>
                </div>
                <Sparkles size={13} className="text-accent" />
              </div>
              <div className="text-[11px] text-text-muted mt-1">AI listens to the consult, fills fields, you confirm.</div>
            </div>

            {/* Mic controls */}
            <div className="px-4 py-3 border-b border-border-subtle">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border",
                recording ? "bg-danger-soft border-danger/25" : "bg-surface-2 border-border-subtle"
              )}>
                <button
                  onClick={() => setRecording(v => !v)}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0",
                    recording ? "bg-danger shadow-lg shadow-danger/25" : "bg-accent"
                  )}
                >
                  <Mic size={18} className="text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[12px] font-semibold", recording ? "text-danger" : "text-text-primary")}>
                    {recording ? "Recording…" : "Tap to start"}
                  </div>
                  <div className="flex items-end gap-0.5 h-5 mt-1">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const h = recording ? 4 + Math.abs(Math.sin(i * 0.7 + Date.now() / 1000)) * 14 : 3 + (i % 4);
                      return <div key={i} style={{ height: h }} className={cn("w-0.5 rounded-full", recording ? "bg-danger opacity-70" : "bg-border-strong opacity-40")} />;
                    })}
                  </div>
                </div>
                <button className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-1 grid place-items-center text-text-secondary hover:text-text-primary">
                  <MicOff size={13} />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {TRANSCRIPT_LINES.map((line, i) => {
                const isDr = line.who === "DR";
                return (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded font-mono",
                        isDr ? "bg-accent/10 text-accent" : "bg-surface-2 text-text-secondary"
                      )}>{line.who}</span>
                      <span className="text-[11px] font-semibold">{line.name}</span>
                      <span className="text-[10px] font-mono text-text-muted">{line.time}</span>
                      {line.conf && (
                        <span className={cn(
                          "text-[9px] font-bold px-1 py-0.5 rounded uppercase",
                          line.conf === "high" ? "bg-success-soft text-success" :
                          line.conf === "med" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"
                        )}>{line.conf} conf</span>
                      )}
                    </div>
                    <div className={cn(
                      "text-[12px] text-text-primary leading-relaxed pl-3 border-l-2",
                      isDr ? "border-accent/30" : "border-border-subtle"
                    )}>
                      {line.text}
                    </div>
                  </div>
                );
              })}

              {/* AI entity */}
              <div className="ml-4 p-2.5 rounded-lg bg-accent/8 border border-dashed border-accent/25">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={10} className="text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wide">Symptom detected</span>
                </div>
                <div className="text-[12px] font-semibold text-text-primary mb-1">dry cough · 2 weeks</div>
                <div className="flex gap-1.5">
                  <button className="text-[11px] px-2 py-0.5 rounded bg-accent text-white font-semibold">Add to file</button>
                  <button className="text-[11px] px-2 py-0.5 rounded border border-border-subtle bg-surface-1 text-text-secondary">Dismiss</button>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-border-subtle flex justify-between text-[10.5px] text-text-muted">
              <span>Audio kept on-device · never leaves hospital</span>
              <span className="font-mono">EN-IN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
