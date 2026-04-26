"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown, AlertTriangle, CheckCircle, Loader2, Calendar,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { registerPatient, type RegisterRequest, type RegisterResponse } from "@/lib/api/reception";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  wide?: boolean;
}

function FormField({ label, required, children, wide }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "col-span-2")}>
      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-9 px-3 rounded-lg bg-surface-2 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all";

const selectCls = inputCls + " appearance-none cursor-pointer";

export default function RegisterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<PatientSearchResult[]>([]);
  const [dupSearching, setDupSearching] = useState(false);

  const [form, setForm] = useState<RegisterRequest>({
    full_name: "",
    phone: "",
    email: "",
    gender: "",
    blood_group: "",
    department: "",
    chief_complaint: "",
    address: { line1: "", city: "", state: "", zip_code: "" },
  });

  function set(key: keyof RegisterRequest, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAddr(key: string, value: string) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  async function checkDuplicates(name: string) {
    if (name.length < 3) { setDuplicates([]); return; }
    setDupSearching(true);
    try {
      const res = await searchPatients(name);
      setDuplicates(res.slice(0, 3));
    } catch {
      setDuplicates([]);
    } finally {
      setDupSearching(false);
    }
  }

  async function handleRegister() {
    if (!form.full_name.trim()) { setError("Full name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await registerPatient(form);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col h-screen bg-page">
        <Header breadcrumb={["Reception", "Register patient"]} />
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center py-10 px-8">
            <CheckCircle className="w-14 h-14 text-success mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-text-primary mb-1">Patient registered</h2>
            <p className="text-sm text-text-secondary mb-6">
              {result.patient.full_name} added to queue with token{" "}
              <span className="font-mono font-bold text-accent">{result.consultation.token_number}</span>
            </p>
            <div className="bg-surface-2 rounded-lg p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">UHID</span>
                <span className="font-mono font-semibold text-text-primary">{result.patient.uhid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Token</span>
                <span className="font-mono font-bold text-accent">{result.consultation.token_number}</span>
              </div>
              {result.consultation.department && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Department</span>
                  <span className="text-text-primary">{result.consultation.department}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Btn variant="secondary" full onClick={() => router.push("/reception/queue")}>
                View queue
              </Btn>
              <Btn
                full
                onClick={() => {
                  setResult(null);
                  setForm({ full_name: "", phone: "", email: "", gender: "", blood_group: "", department: "", chief_complaint: "", address: { line1: "", city: "", state: "", zip_code: "" } });
                  setDuplicates([]);
                }}
              >
                Register another
              </Btn>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Reception", "Register patient"]} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Page header */}
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-1 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">Register new patient</h1>
            <p className="text-xs text-text-muted mt-0.5">
              UHID auto-generates on save · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => router.push("/reception/queue")}>Cancel</Btn>
            <Btn onClick={handleRegister} disabled={saving} icon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}>
              {saving ? "Saving…" : "Register & add to queue →"}
            </Btn>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-3 p-3 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex gap-4 max-w-6xl mx-auto">
            {/* Main form */}
            <div className="flex-[2] flex flex-col gap-4 min-w-0">
              {/* Identity */}
              <Card>
                <h3 className="text-sm font-semibold mb-4 text-text-primary">Identity</h3>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Full name" required wide>
                    <input
                      className={inputCls}
                      placeholder="Ananya Reddy"
                      value={form.full_name}
                      onChange={(e) => {
                        set("full_name", e.target.value);
                        checkDuplicates(e.target.value);
                      }}
                    />
                  </FormField>
                  <FormField label="Date of birth">
                    <div className="relative">
                      <input
                        type="date"
                        className={inputCls + " w-full pr-8"}
                        onChange={(e) => set("date_of_birth", e.target.value)}
                      />
                      <Calendar className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </FormField>
                  <FormField label="Sex">
                    <div className="relative">
                      <select
                        className={selectCls + " w-full pr-7"}
                        value={form.gender}
                        onChange={(e) => set("gender", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </FormField>
                  <FormField label="Blood group">
                    <div className="relative">
                      <select
                        className={selectCls + " w-full pr-7"}
                        value={form.blood_group}
                        onChange={(e) => set("blood_group", e.target.value)}
                      >
                        <option value="">Select</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </FormField>
                </div>
              </Card>

              {/* Contact */}
              <Card>
                <h3 className="text-sm font-semibold mb-4 text-text-primary">Contact & address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Mobile">
                    <div className="flex items-center gap-0">
                      <span className="h-9 px-2.5 rounded-l-lg bg-surface-2 border border-border-subtle border-r-0 text-xs font-mono font-semibold text-text-muted flex items-center">
                        +91
                      </span>
                      <input
                        className="flex-1 h-9 px-3 rounded-r-lg bg-surface-2 border border-border-subtle text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    </div>
                  </FormField>
                  <FormField label="Email (optional)">
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="patient@email.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </FormField>
                  <FormField label="PIN code">
                    <input
                      className={inputCls + " font-mono"}
                      placeholder="110018"
                      maxLength={6}
                      value={form.address?.zip_code}
                      onChange={(e) => setAddr("zip_code", e.target.value)}
                    />
                  </FormField>
                  <FormField label="City">
                    <input
                      className={inputCls}
                      placeholder="New Delhi"
                      value={form.address?.city}
                      onChange={(e) => setAddr("city", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Address line" wide>
                    <input
                      className={inputCls}
                      placeholder="B-12 Lajpat Nagar Phase 2"
                      value={form.address?.line1}
                      onChange={(e) => setAddr("line1", e.target.value)}
                    />
                  </FormField>
                </div>
              </Card>

              {/* Visit details */}
              <Card>
                <h3 className="text-sm font-semibold mb-4 text-text-primary">Visit details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Department">
                    <div className="relative">
                      <select
                        className={selectCls + " w-full pr-7"}
                        value={form.department}
                        onChange={(e) => set("department", e.target.value)}
                      >
                        <option value="">Select department</option>
                        {["Cardiology", "Orthopedics", "General Medicine", "Dermatology", "Pediatrics", "Gynecology", "ENT", "Ophthalmology"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </FormField>
                  <FormField label="Chief complaint" wide>
                    <input
                      className={inputCls}
                      placeholder="Routine follow-up, chest pain, fever…"
                      value={form.chief_complaint}
                      onChange={(e) => set("chief_complaint", e.target.value)}
                    />
                  </FormField>
                </div>
              </Card>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Auto-assigned */}
              <Card>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">
                  Auto-assigned on save
                </p>
                <div className="space-y-2.5">
                  {[
                    { k: "UHID", v: "UHID-2026-XXXX" },
                    { k: "Token", v: "A-XXX", accent: true },
                    { k: "Hospital", v: "Your hospital" },
                  ].map(({ k, v, accent }) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">{k}</span>
                      <span className={cn("text-sm font-semibold font-mono", accent ? "text-accent" : "text-text-muted")}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Possible duplicates */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Possible duplicates</h3>
                  {dupSearching && <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />}
                </div>
                {duplicates.length === 0 && !dupSearching && (
                  <p className="text-xs text-text-muted">Enter name to check for duplicates.</p>
                )}
                {duplicates.map((d) => (
                  <div
                    key={d.patient_id}
                    className="p-3 mb-2 rounded-lg bg-surface-2 border border-border-subtle cursor-pointer hover:border-accent/40 transition-colors"
                    onClick={() => router.push(`/patients/${d.patient_id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{d.full_name}</span>
                      <Pill color="warning" soft>possible match</Pill>
                    </div>
                    <div className="text-[11px] text-text-muted font-mono mt-1">{d.uhid}</div>
                    <div className="text-[11px] text-text-muted font-mono">{d.phone}</div>
                  </div>
                ))}
              </Card>

              {/* Policy note */}
              <Card className="bg-warning-soft border-warning/20">
                <div className="flex gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Verify Aadhaar/ID at counter before discharge — required by hospital insurance policy.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
