"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Heart, Activity, Wind, Thermometer, Weight, Ruler,
  CheckCircle, Loader2, AlertTriangle, ArrowLeft,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { getPatient } from "@/lib/api/patients";
import { syncConsultation } from "@/lib/api/consultation";
import type { Patient } from "@/lib/types/patient";
import { cn } from "@/lib/utils";

interface VitalField {
  key: string;
  label: string;
  icon: React.ReactNode;
  unit: string;
  unit2?: string;
  key2?: string;
  normal?: [number, number];
  warn?: "high" | "low";
  step?: number;
  placeholder?: string;
  placeholder2?: string;
}

const VITAL_FIELDS: VitalField[] = [
  {
    key: "systolic", key2: "diastolic",
    label: "Blood Pressure",
    icon: <Heart className="w-5 h-5" strokeWidth={1.5} />,
    unit: "mmHg sys", unit2: "mmHg dia",
    normal: [90, 120], step: 1,
    placeholder: "128", placeholder2: "84",
  },
  {
    key: "pulse_bpm", label: "Pulse",
    icon: <Activity className="w-5 h-5" strokeWidth={1.5} />,
    unit: "bpm", normal: [60, 100], step: 1, placeholder: "76",
  },
  {
    key: "spo2_percent", label: "SpO₂",
    icon: <Wind className="w-5 h-5" strokeWidth={1.5} />,
    unit: "%", normal: [95, 100], warn: "low", step: 0.1, placeholder: "98",
  },
  {
    key: "temperature_c", label: "Temperature",
    icon: <Thermometer className="w-5 h-5" strokeWidth={1.5} />,
    unit: "°C", normal: [36.1, 37.5], step: 0.1, placeholder: "37.8",
  },
  {
    key: "weight_kg", label: "Weight",
    icon: <Weight className="w-5 h-5" strokeWidth={1.5} />,
    unit: "kg", step: 0.1, placeholder: "64.2",
  },
  {
    key: "height_cm", label: "Height",
    icon: <Ruler className="w-5 h-5" strokeWidth={1.5} />,
    unit: "cm", step: 1, placeholder: "162",
  },
];

function flagVital(field: VitalField, value: string): "normal" | "warning" | "danger" | null {
  if (!value || !field.normal) return null;
  const n = parseFloat(value);
  if (isNaN(n)) return null;
  const [lo, hi] = field.normal;
  if (field.warn === "low") return n < lo ? "danger" : "normal";
  if (n < lo) return "warning";
  if (n > hi) return "warning";
  return "normal";
}

function VitalsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const consultationId = params.get("consultationId");
  const patientId = params.get("patientId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!patientId) { setLoadingPatient(false); return; }
    getPatient(patientId)
      .then(setPatient)
      .catch(() => setPatient(null))
      .finally(() => setLoadingPatient(false));
  }, [patientId]);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!consultationId) { setError("No consultation ID in URL."); return; }
    setSaving(true);
    setError(null);
    try {
      const bp = values.systolic && values.diastolic
        ? `${values.systolic}/${values.diastolic}`
        : values.systolic || undefined;

      await syncConsultation(consultationId, {
        blood_pressure: bp,
        pulse_bpm: values.pulse_bpm ? parseInt(values.pulse_bpm) : undefined,
        spo2_percent: values.spo2_percent ? parseFloat(values.spo2_percent) : undefined,
        temperature_c: values.temperature_c ? parseFloat(values.temperature_c) : undefined,
        weight_kg: values.weight_kg ? parseFloat(values.weight_kg) : undefined,
        height_cm: values.height_cm ? parseFloat(values.height_cm) : undefined,
      });
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save vitals");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-sm w-full text-center py-10 px-8">
          <CheckCircle className="w-14 h-14 text-success mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Vitals submitted</h2>
          <p className="text-sm text-text-secondary mb-6">
            Vitals for <strong>{patient?.name ?? patientId}</strong> sent to the doctor in real time.
          </p>
          <Btn full onClick={() => router.push("/nurse/queue")}>
            Next patient →
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Patient banner */}
        <Card className="flex items-center gap-4 mb-4">
          {loadingPatient ? (
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          ) : (
            <>
              <Avatar name={patient?.name ?? patientId ?? "?"} role="nurse" size={52} />
              <div className="flex-1">
                <div className="text-lg font-semibold text-text-primary flex items-center gap-3">
                  {patient?.name ?? patientId}
                  {patient?.uhid && (
                    <span className="text-sm text-text-muted font-mono font-normal">{patient.uhid}</span>
                  )}
                </div>
                <div className="text-sm text-text-secondary">
                  {patient?.gender && <span>{patient.gender} · </span>}
                  {patient?.age && <span>{patient.age}y · </span>}
                  {patient?.bloodGroup && <span>{patient.bloodGroup} · </span>}
                  {patient?.allergies && patient.allergies.length > 0 && (
                    <span className="text-warning">Allergic to {patient.allergies.join(", ")}</span>
                  )}
                </div>
              </div>
              <Pill color="warning">
                <StatusDot pulse />
                Calling now
              </Pill>
            </>
          )}
        </Card>

        <p className="text-xs text-text-muted mb-4">
          Enter vitals — they stream to the doctor&apos;s patient file in real time.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Vitals grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {VITAL_FIELDS.map((field) => {
            const flag = flagVital(field, values[field.key]);
            const isWarning = flag === "warning" || flag === "danger";
            return (
              <Card
                key={field.key}
                className={cn(
                  "transition-colors",
                  isWarning && "border-warning/50 bg-warning-soft/40"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isWarning ? "bg-warning-soft text-warning" : "bg-surface-2 text-accent"
                  )}>
                    {field.icon}
                  </div>
                  {flag && (
                    <Pill color={flag === "normal" ? "success" : "warning"} soft>
                      {flag === "normal" ? "✓ in range" : "out of range"}
                    </Pill>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {field.label}
                </div>
                {field.key2 ? (
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      step={field.step}
                      placeholder={field.placeholder}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="w-20 text-3xl font-semibold font-mono bg-transparent border-b-2 border-border-strong focus:border-accent outline-none text-text-primary pb-0.5"
                    />
                    <span className="text-xs text-text-muted">{field.unit}</span>
                    <span className="text-2xl text-text-muted font-light">/</span>
                    <input
                      type="number"
                      step={field.step}
                      placeholder={field.placeholder2}
                      value={values[field.key2] ?? ""}
                      onChange={(e) => setValue(field.key2!, e.target.value)}
                      className="w-20 text-3xl font-semibold font-mono bg-transparent border-b-2 border-border-strong focus:border-accent outline-none text-text-primary pb-0.5"
                    />
                    <span className="text-xs text-text-muted">{field.unit2}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      step={field.step}
                      placeholder={field.placeholder}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="w-28 text-3xl font-semibold font-mono bg-transparent border-b-2 border-border-strong focus:border-accent outline-none text-text-primary pb-0.5"
                    />
                    <span className="text-xs text-text-muted">{field.unit}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end">
          <Btn variant="ghost" size="lg" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push("/nurse/queue")}>
            Back to queue
          </Btn>
          <Btn variant="secondary" size="lg" onClick={() => router.push("/nurse/queue")}>
            Save & next patient
          </Btn>
          <Btn size="lg" disabled={saving} icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} onClick={handleSubmit}>
            {saving ? "Submitting…" : "Submit vitals →"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function NurseVitalsPage() {
  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Nurse", "Vitals"]} />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
        </div>
      }>
        <VitalsContent />
      </Suspense>
    </div>
  );
}
