"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FlaskConical, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { createTemplate } from "@/lib/api/templates";
import type { TemplateMed } from "@/lib/api/templates";

const PROCEDURE_TYPE_ID = "proc-gp-001";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState<TemplateMed[]>([{ drug: "", route: "PO", freq: "", dur: "", when: "" }]);
  const [labInput, setLabInput] = useState("");
  const [labs, setLabs] = useState<string[]>([]);
  const [followUpDays, setFollowUpDays] = useState<number | "">("");
  const [instructions, setInstructions] = useState("");
  const [referral, setReferral] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMed(i: number, k: keyof TemplateMed, v: string) {
    setMeds(prev => prev.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
  }
  function addMed() { setMeds(prev => [...prev, { drug: "", route: "PO", freq: "", dur: "", when: "" }]); }
  function removeMed(i: number) { setMeds(prev => prev.filter((_, idx) => idx !== i)); }

  function addLab(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && labInput.trim()) { setLabs(prev => [...prev, labInput.trim()]); setLabInput(""); }
  }

  async function handleSave() {
    if (!name.trim()) { setError("Template name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await createTemplate({
        procedure_type_id: PROCEDURE_TYPE_ID,
        template_name: name,
        template_data: {
          symptoms: symptoms || null,
          chief_complaint: chiefComplaint || null,
          clinical_notes: clinicalNotes || null,
          diagnosis: diagnosis || null,
          medicines: meds.filter(m => m.drug),
          labs: labs.length > 0 ? labs : null,
          follow_up_days: followUpDays !== "" ? Number(followUpDays) : null,
          instructions: instructions || null,
          referral: referral || null,
        },
      });
      router.push("/templates");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Workspace", "Templates", "New template"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[900px] mx-auto flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold">New template</h1>
              <p className="text-[12px] text-text-secondary mt-1">Saved bundles you can apply to auto-fill the entire Rx board during a consult.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push("/templates")} className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-2 border border-border-subtle">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover disabled:opacity-60">
                <Save size={14} /> {saving ? "Saving…" : "Save template"}
              </button>
            </div>
          </div>

          {error && <div className="p-3 bg-danger-soft border border-danger/20 rounded-lg text-danger text-[13px]">{error}</div>}

          {/* Name */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2 block">Template name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Viral fever — adult"
              className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border-subtle text-[14px] font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
          </div>

          {/* Clinical context */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Symptoms / chief complaint pattern" value={symptoms} onChange={setSymptoms} rows={3} placeholder="Fever > 100°F, body ache, mild cough, headache, fatigue" />
            <Field label="Chief complaint (for Rx)" value={chiefComplaint} onChange={setChiefComplaint} rows={3} placeholder="Fever × 2 days with body ache and headache." />
            <Field label="Clinical notes (SOAP)" value={clinicalNotes} onChange={setClinicalNotes} rows={4} placeholder="Subjective: … Objective: … Assessment: … Plan: …" />
            <Field label="Diagnosis" value={diagnosis} onChange={setDiagnosis} rows={4} placeholder="Acute viral syndrome (J11.1)" />
          </div>

          {/* Medicines */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
              <span className="text-[13px] font-semibold">Medicines</span>
              <button onClick={addMed} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-text-secondary hover:bg-surface-2 border border-border-subtle">
                <Plus size={12} /> Add medicine
              </button>
            </div>
            <div className="px-5 pb-4 pt-3">
              <div className="grid text-[9.5px] font-bold text-text-muted uppercase tracking-widest px-3 py-2 bg-surface-2 rounded-lg mb-1.5"
                style={{ gridTemplateColumns: "1.7fr 70px 90px 90px 1.4fr 28px" }}>
                <span>Drug</span><span>Route</span><span>Freq</span><span>Duration</span><span>Notes</span><span />
              </div>
              {meds.map((m, i) => (
                <div key={i} className="grid gap-2 py-2 border-b border-border-subtle last:border-b-0 items-center"
                  style={{ gridTemplateColumns: "1.7fr 70px 90px 90px 1.4fr 28px" }}>
                  <input value={m.drug} onChange={e => updateMed(i, "drug", e.target.value)} placeholder="Drug name + strength"
                    className="w-full h-8 px-2.5 rounded-md bg-surface-2 border border-border-subtle text-[12.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  <input value={m.route} onChange={e => updateMed(i, "route", e.target.value)} placeholder="PO"
                    className="w-full h-8 px-2 rounded-md bg-surface-2 border border-border-subtle text-[11.5px] font-mono focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  <input value={m.freq} onChange={e => updateMed(i, "freq", e.target.value)} placeholder="1-1-1"
                    className="w-full h-8 px-2 rounded-md bg-surface-2 border border-border-subtle text-[12px] font-mono font-semibold text-accent focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  <input value={m.dur} onChange={e => updateMed(i, "dur", e.target.value)} placeholder="5 d"
                    className="w-full h-8 px-2 rounded-md bg-surface-2 border border-border-subtle text-[11.5px] font-mono focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  <input value={m.when} onChange={e => updateMed(i, "when", e.target.value)} placeholder="after food"
                    className="w-full h-8 px-2.5 rounded-md bg-surface-2 border border-border-subtle text-[11px] italic text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  <button onClick={() => removeMed(i)} className="flex items-center justify-center text-text-muted hover:text-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Labs + follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2 block">Lab orders</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labs.map((l, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-2 border border-border-subtle text-[11.5px]">
                    <FlaskConical size={10} className="text-accent" /> {l}
                    <button onClick={() => setLabs(ls => ls.filter((_, li) => li !== i))} className="text-text-muted hover:text-danger"><Trash2 size={10} /></button>
                  </span>
                ))}
              </div>
              <input value={labInput} onChange={e => setLabInput(e.target.value)} onKeyDown={addLab}
                placeholder="Type lab name and press Enter"
                className="w-full h-8 px-3 rounded-lg bg-surface-2 border border-border-subtle text-[12px] focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
            </div>
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2 block">Follow-up days</label>
              <input type="number" value={followUpDays} onChange={e => setFollowUpDays(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 7"
                className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border-subtle text-[18px] font-semibold font-mono text-accent focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
            </div>
          </div>

          {/* Instructions + referral */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient instructions" value={instructions} onChange={setInstructions} rows={4} placeholder="Plenty of fluids. Lukewarm sponging if T > 102°F." />
            <Field label="Referral" value={referral} onChange={setReferral} rows={4} placeholder="Ophthalmology — annual fundus check" />
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows: number; placeholder: string }) {
  return (
    <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
      <label className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-2 block">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[13px] text-text-primary placeholder:text-text-muted leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
    </div>
  );
}
