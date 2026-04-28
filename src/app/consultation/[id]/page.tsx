"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles, Search, X, Plus, Trash2, Loader2, Check,
  Pill, FlaskConical, Calendar, FileText, ArrowLeft, Save, AlertTriangle, ChevronRight,
} from "lucide-react";
import { getConsultation, syncConsultation, endConsultation } from "@/lib/api/consultation";
import { listTemplates, type TemplateRecord, type TemplateMed } from "@/lib/api/templates";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MedRow extends TemplateMed {
  fromTemplate: boolean;
  edited: boolean;
  id: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldBox({
  label, filled, children, sub,
}: {
  label: string; filled?: boolean; children: React.ReactNode; sub?: string;
}) {
  return (
    <div className={cn(
      "relative p-3.5 rounded-[10px] border transition-all duration-200",
      filled
        ? "bg-accent/5 border-accent/20"
        : "bg-surface-1 border-border-subtle",
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-[10.5px] font-bold tracking-[0.08em] uppercase",
          filled ? "text-accent" : "text-text-muted",
        )}>{label}</span>
        {filled && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-accent tracking-[0.04em] uppercase">
            <Sparkles className="w-2.5 h-2.5" /> from template
          </span>
        )}
        {sub && !filled && <span className="text-[10.5px] text-text-muted font-mono">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function TemplateTag({ children, color = "muted" }: { children: React.ReactNode; color?: "muted" | "accent" | "success" | "danger" | "warning" }) {
  const map = {
    muted: "bg-surface-2 text-text-muted border-border-subtle",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger-soft text-danger border-danger/20",
    warning: "bg-warning-soft text-warning border-warning/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold", map[color])}>
      {children}
    </span>
  );
}

function TemplatePicker({
  templates, onApply, onClose,
}: {
  templates: TemplateRecord[];
  onApply: (t: TemplateRecord) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = templates.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.template_name.toLowerCase().includes(q) ||
      (t.template_data.symptoms ?? "").toLowerCase().includes(q) ||
      (t.template_data.diagnosis ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="absolute top-full mt-2 right-0 w-[520px] z-50 bg-surface-1 border border-border-subtle rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[480px]">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="text-sm font-semibold text-text-primary">Load a template</div>
            <div className="text-xs text-text-secondary mt-0.5">Auto-fills complaint, diagnosis, meds, labs, follow-up. Verify before submit.</div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface-2 border border-border-subtle">
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            placeholder="Search symptom, diagnosis, name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && selectedId) {
                const t = filtered.find((x) => x.template_id === selectedId);
                if (t) onApply(t);
              }
            }}
          />
          {search && <span className="text-xs text-text-muted">{filtered.length} match{filtered.length !== 1 ? "es" : ""}</span>}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] font-mono text-text-secondary">esc</kbd>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((tpl) => {
          const sel = tpl.template_id === selectedId;
          const medCount = tpl.template_data.medicines?.length ?? 0;
          const followup = tpl.template_data.follow_up_days;
          return (
            <div
              key={tpl.template_id}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-lg mb-1 cursor-pointer border transition-colors",
                sel ? "bg-accent-soft border-accent-border" : "border-transparent hover:bg-surface-2",
              )}
              onClick={() => setSelectedId(sel ? null : tpl.template_id)}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                sel ? "bg-accent text-white" : "bg-surface-2 text-text-secondary",
              )}>
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-text-primary">{tpl.template_name}</span>
                </div>
                <div className="text-xs text-text-secondary truncate">{tpl.template_data.symptoms ?? "—"}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex gap-1">
                  <TemplateTag color="muted"><Pill className="w-2 h-2" /> {medCount}</TemplateTag>
                  {followup && <TemplateTag color="muted"><Calendar className="w-2 h-2" /> {followup}d</TemplateTag>}
                </div>
                <span className="text-[10px] text-text-muted font-mono">v{tpl.version}</span>
              </div>
              {sel && (
                <button
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold flex-shrink-0 hover:bg-accent-hover transition-colors"
                  onClick={(e) => { e.stopPropagation(); onApply(tpl); }}
                >
                  Apply
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-text-muted text-sm">No templates match.</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border-subtle bg-surface-2 text-xs text-text-secondary font-mono">
        <span><kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] text-text-primary font-semibold">↑↓</kbd> navigate</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] text-text-primary font-semibold">↵</kbd> apply</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] text-text-primary font-semibold">esc</kbd> close</span>
        <div className="flex-1" />
        <button
          className="text-accent font-semibold hover:underline"
          onClick={() => window.open("/templates", "_blank")}
        >
          Manage templates →
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConsultationRxPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.id as string;

  // Data
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loadingConsult, setLoadingConsult] = useState(true);
  const [patientName, setPatientName] = useState("Patient");
  const [patientUhid, setPatientUhid] = useState("");
  const [patientId, setPatientId] = useState("");

  // Rx state
  const [appliedTemplate, setAppliedTemplate] = useState<TemplateRecord | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState<MedRow[]>([]);
  const [labs, setLabs] = useState<string[]>([]);
  const [followupDays, setFollowupDays] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [referral, setReferral] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getConsultation(consultationId),
      listTemplates(),
    ]).then(([consult, tmpl]) => {
      setTemplates(tmpl);
      if (consult) {
        setPatientId(consult.patient_id);
        setPatientUhid(consult.patient_id);
        setChiefComplaint(consult.chief_complaint ?? "");
        setClinicalNotes(consult.clinical_notes ?? "");
        setDiagnosis(consult.diagnosis ?? "");
      }
    }).finally(() => setLoadingConsult(false));
  }, [consultationId]);

  // Keyboard shortcut ⌘T
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "t") { e.preventDefault(); setPickerOpen((p) => !p); }
      if (e.key === "Escape") setPickerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function applyTemplate(tpl: TemplateRecord) {
    setAppliedTemplate(tpl);
    setPickerOpen(false);
    const d = tpl.template_data;
    if (d.chief_complaint) setChiefComplaint(d.chief_complaint);
    if (d.clinical_notes) setClinicalNotes(d.clinical_notes);
    if (d.diagnosis) setDiagnosis(d.diagnosis);
    setMeds((d.medicines ?? []).map((m, i) => ({
      ...m,
      fromTemplate: true,
      edited: false,
      id: `tpl-${i}-${Date.now()}`,
    })));
    setLabs(d.labs ?? []);
    setFollowupDays(d.follow_up_days ?? null);
    setInstructions(d.instructions ?? "");
    setReferral(d.referral ?? "");

    // auto-save template reference
    syncConsultation(consultationId, { source_template_id: tpl.template_id }).catch(() => null);
  }

  function clearTemplate() {
    setAppliedTemplate(null);
    setChiefComplaint(""); setClinicalNotes(""); setDiagnosis("");
    setMeds([]); setLabs([]); setFollowupDays(null); setInstructions(""); setReferral("");
  }

  function updateMed(id: string, field: keyof TemplateMed, value: string) {
    setMeds((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value, edited: m.fromTemplate ? true : m.edited } : m));
  }

  function removeMed(id: string) {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  }

  function addMed() {
    setMeds((prev) => [...prev, { drug: "", route: "PO", freq: "", dur: "", when: "", fromTemplate: false, edited: false, id: `new-${Date.now()}` }]);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await syncConsultation(consultationId, {
        chief_complaint: chiefComplaint,
        clinical_notes: clinicalNotes,
        diagnosis,
        prescription_data: {
          medicines: meds.map(({ fromTemplate, edited, id, ...rest }) => rest),
          labs,
          follow_up_days: followupDays,
          instructions,
          referral,
        },
        source_template_id: appliedTemplate?.template_id,
      });
      await endConsultation(consultationId, { diagnosis, clinical_notes: clinicalNotes });
      setSubmitted(true);
      setTimeout(() => router.push(`/patients/${patientId}`), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingConsult) {
    return (
      <div className="flex items-center justify-center h-screen bg-page gap-2 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading consultation…</span>
      </div>
    );
  }

  const editedCount = meds.filter((m) => m.edited).length;

  return (
    <div className="flex flex-col h-screen bg-page overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-1 border-b border-border-subtle flex-shrink-0">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary transition-colors p-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border-subtle" />
        <div>
          <span className="text-sm font-semibold text-text-primary">{patientName}</span>
          {patientUhid && <span className="text-xs text-text-muted font-mono ml-2">· {patientUhid}</span>}
        </div>
        <div className="flex-1" />

        {/* Template command bar */}
        <div className="relative">
          <button
            onClick={() => setPickerOpen((p) => !p)}
            className={cn(
              "flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors",
              appliedTemplate
                ? "bg-accent-soft border-accent-border text-accent"
                : "bg-surface-2 border-border-subtle text-text-muted hover:border-border-strong",
            )}
          >
            {appliedTemplate ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Template</span>
                <span className="text-sm font-semibold text-text-primary">{appliedTemplate.template_name}</span>
                <span className="text-xs text-text-secondary font-mono">· {appliedTemplate.template_data.medicines?.length ?? 0}m · {appliedTemplate.template_data.follow_up_days}d</span>
                <button
                  onClick={(e) => { e.stopPropagation(); clearTemplate(); }}
                  className="ml-1 text-accent hover:text-danger transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span className="flex-1">Search a template…</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] font-mono text-text-secondary">⌘T</kbd>
              </>
            )}
          </button>

          {pickerOpen && (
            <TemplatePicker
              templates={templates}
              onApply={applyTemplate}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <div className="flex-1 max-w-24" />
        <span className="text-xs text-text-muted font-mono">Auto-saved</span>
      </div>

      {/* Applied ribbon */}
      {appliedTemplate && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-accent-soft border-b border-accent-border flex-shrink-0">
          <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Template applied</span>
            <span className="text-sm font-semibold text-text-primary ml-2">{appliedTemplate.template_name}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-white border border-accent/20 text-accent font-mono font-semibold">
            {appliedTemplate.template_data.medicines?.length ?? 0} meds · {appliedTemplate.template_data.labs?.length ?? 0} labs · {appliedTemplate.template_data.follow_up_days}d follow-up
          </span>
          <div className="flex-1" />
          {editedCount > 0 && (
            <span className="text-xs text-warning font-semibold">{editedCount} edit{editedCount > 1 ? "s" : ""} after template</span>
          )}
          <span className="text-xs text-text-secondary">All fields editable. Verify before submit.</span>
          <button onClick={clearTemplate} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-accent/20 bg-white text-accent text-xs font-semibold hover:bg-accent-soft transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        </div>
      )}

      {/* Two-column body */}
      <div className="flex-1 grid grid-cols-[40%_60%] min-h-0 overflow-hidden">
        {/* LEFT — Patient context */}
        <div className="flex flex-col gap-3 p-4 overflow-y-auto border-r border-border-subtle bg-page">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-text-muted tracking-widest uppercase">Patient context</span>
          </div>

          <FieldBox label="Chief complaint" filled={!!appliedTemplate && !!chiefComplaint}>
            <textarea
              className="w-full text-sm text-text-primary bg-transparent resize-none focus:outline-none leading-relaxed min-h-[52px]"
              placeholder="Type or dictate the chief complaint…"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
            />
          </FieldBox>

          <FieldBox label="Clinical notes (SOAP)" filled={!!appliedTemplate && !!clinicalNotes}>
            <textarea
              className="w-full text-sm text-text-primary bg-transparent resize-none focus:outline-none leading-relaxed min-h-[90px]"
              placeholder="Subjective · Objective · Assessment · Plan"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={6}
            />
          </FieldBox>

          <FieldBox label="Diagnosis" filled={!!appliedTemplate && !!diagnosis}>
            <input
              className="w-full text-sm font-semibold text-text-primary bg-transparent focus:outline-none"
              placeholder="—"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            {appliedTemplate && diagnosis && (
              <div className="mt-2 flex gap-1.5">
                <TemplateTag color="success">primary</TemplateTag>
                <TemplateTag color="muted">+ secondary</TemplateTag>
              </div>
            )}
          </FieldBox>

          <FieldBox label="Allergies & alerts">
            <div className="flex flex-wrap gap-1.5">
              <TemplateTag color="danger">⚠ Document allergies</TemplateTag>
            </div>
          </FieldBox>
        </div>

        {/* RIGHT — Rx board */}
        <div className="flex flex-col gap-3 p-4 overflow-y-auto">
          {/* Medicines */}
          <div className="bg-surface-1 border border-border-subtle rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Pill className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-sm font-semibold text-text-primary">Medicines</span>
                {appliedTemplate && (
                  <TemplateTag color="accent">{meds.filter((m) => m.fromTemplate).length} from template</TemplateTag>
                )}
              </div>
              <button
                onClick={addMed}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add medicine
              </button>
            </div>

            {/* Table head */}
            <div className="grid px-3 py-2 bg-surface-2 text-[9.5px] font-bold text-text-muted tracking-widest uppercase"
              style={{ gridTemplateColumns: "1.7fr 70px 90px 90px 1.4fr 28px" }}>
              <span>Drug</span><span>Route</span><span>Freq</span><span>Duration</span><span>Notes</span><span />
            </div>

            {meds.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-muted italic">
                No medicines yet. Add manually or load a template above.
              </div>
            ) : (
              meds.map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    "grid px-3 py-2.5 items-center gap-2 border-b border-border-subtle last:border-0",
                    m.edited && "bg-warning/5",
                  )}
                  style={{ gridTemplateColumns: "1.7fr 70px 90px 90px 1.4fr 28px" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.fromTemplate && <div className="w-0.5 h-5 bg-accent rounded-full flex-shrink-0" />}
                    <div className="min-w-0">
                      <input
                        className="w-full text-[12.5px] font-semibold text-text-primary bg-transparent focus:outline-none"
                        value={m.drug}
                        onChange={(e) => updateMed(m.id, "drug", e.target.value)}
                        placeholder="Drug name"
                      />
                      {m.edited && <div className="text-[9.5px] text-warning font-semibold uppercase tracking-wider">edited</div>}
                    </div>
                  </div>
                  <input className="text-xs font-mono text-text-secondary bg-transparent focus:outline-none" value={m.route} onChange={(e) => updateMed(m.id, "route", e.target.value)} />
                  <input className="text-xs font-mono font-semibold text-accent bg-transparent focus:outline-none" value={m.freq} onChange={(e) => updateMed(m.id, "freq", e.target.value)} />
                  <input className="text-xs font-mono text-text-primary bg-transparent focus:outline-none" value={m.dur} onChange={(e) => updateMed(m.id, "dur", e.target.value)} />
                  <input className="text-xs text-text-secondary italic bg-transparent focus:outline-none" value={m.when} onChange={(e) => updateMed(m.id, "when", e.target.value)} placeholder="timing notes" />
                  <button onClick={() => removeMed(m.id)} className="text-text-muted hover:text-danger transition-colors flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Labs + Follow-up row */}
          <div className="grid grid-cols-2 gap-3">
            <FieldBox label="Lab orders" filled={!!appliedTemplate && labs.length > 0} sub={`${labs.length} ordered`}>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labs.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-2 border border-border-subtle text-xs text-text-primary font-medium">
                    <FlaskConical className="w-2.5 h-2.5 text-accent flex-shrink-0" />
                    {l}
                    <button onClick={() => setLabs((prev) => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-danger ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                className="w-full text-xs text-text-muted bg-transparent focus:outline-none border border-dashed border-border-strong rounded-md px-2 py-1 placeholder:text-text-muted"
                placeholder="+ add lab"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    setLabs((prev) => [...prev, e.currentTarget.value.trim()]);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </FieldBox>

            <FieldBox label="Follow-up" filled={!!appliedTemplate && followupDays != null}>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  className="w-16 text-2xl font-semibold font-mono text-accent bg-transparent focus:outline-none"
                  value={followupDays ?? ""}
                  onChange={(e) => setFollowupDays(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="—"
                />
                <span className="text-sm text-text-secondary">days</span>
              </div>
              {followupDays != null && (
                <div className="text-xs text-text-muted font-mono mt-1">
                  {new Date(Date.now() + followupDays * 864e5).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              )}
            </FieldBox>
          </div>

          <FieldBox label="General instructions" filled={!!appliedTemplate && !!instructions}>
            <textarea
              className="w-full text-sm text-text-primary bg-transparent resize-none focus:outline-none leading-relaxed"
              placeholder="—"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </FieldBox>

          <FieldBox label="Referral / special notes" filled={!!appliedTemplate && !!referral}>
            <textarea
              className="w-full text-sm text-text-primary bg-transparent resize-none focus:outline-none leading-relaxed"
              placeholder="None."
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              rows={2}
            />
          </FieldBox>

          <div className="flex-1 min-h-4" />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-1 border-t border-border-subtle flex-shrink-0">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors"
          onClick={() => router.push("/templates/new")}
        >
          <Save className="w-3.5 h-3.5" /> Save as template
        </button>
        <button
          className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:text-text-secondary transition-colors"
          onClick={() => syncConsultation(consultationId, {
            chief_complaint: chiefComplaint, clinical_notes: clinicalNotes, diagnosis,
          })}
        >
          Save draft
        </button>
        <div className="flex-1" />
        {appliedTemplate && (
          <span className="text-xs text-text-secondary">
            {editedCount > 0 && <span className="text-warning font-semibold mr-1">{editedCount} edit{editedCount > 1 ? "s" : ""}</span>}
            after applying template
          </span>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors",
            submitted
              ? "bg-success text-white"
              : "bg-accent text-white hover:bg-accent-hover",
            (submitting || submitted) && "opacity-70 cursor-not-allowed",
          )}
        >
          {submitted ? (
            <><Check className="w-4 h-4" /> Submitted</>
          ) : submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Check className="w-4 h-4" /> Submit prescription</>
          )}
        </button>
      </div>
    </div>
  );
}
