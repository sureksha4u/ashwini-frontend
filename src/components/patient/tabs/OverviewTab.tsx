"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { ScanLine, Pill, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getOverview, updateOverview, type OverviewResponse } from "@/lib/api/overview";

interface OverviewTabProps {
  patientId: string;
  consultationId: string | null;
  isEditable: boolean;
  onSyncPayloadChange?: (patch: Record<string, unknown>) => void;
  markDirty?: () => void;
}

export interface OverviewTabHandle {
  save: () => Promise<void>;
}

function getPatientStatus(totalVisits: number, lastVisitDate: string | null) {
  if (totalVisits === 0) return { label: "New Patient", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" };
  if (!lastVisitDate) return { label: "Active Patient", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" };
  const lastVisit = new Date(lastVisitDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (lastVisit >= sixMonthsAgo) return { label: "Active Patient", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" };
  return { label: "Inactive", bg: "bg-surface-2 dark:bg-gray-800/40", text: "text-text-secondary" };
}

export const OverviewTab = forwardRef<OverviewTabHandle, OverviewTabProps>(
  function OverviewTab({ patientId, consultationId, isEditable, onSyncPayloadChange, markDirty }, ref) {
    const [data, setData] = useState<OverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Vitals editable state
    const [bpInput, setBpInput] = useState("");
    const [pulseInput, setPulseInput] = useState("");
    const [tempInput, setTempInput] = useState("");
    const [spo2Input, setSpo2Input] = useState("");

    function notifyChange(patch: Record<string, unknown>) {
      markDirty?.();
      onSyncPayloadChange?.(patch);
    }

    const fetchOverview = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOverview(patientId);
        setData(result);
        setBpInput(result.vitals.blood_pressure ?? "");
        setPulseInput(result.vitals.pulse_bpm?.toString() ?? "");
        setTempInput(result.vitals.temperature_c?.toString() ?? "");
        setSpo2Input(result.vitals.spo2_percent?.toString() ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    }, [patientId]);

    useEffect(() => {
      fetchOverview();
    }, [fetchOverview]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!consultationId) return;
        const [sys, dia] = bpInput.split("/").map(Number);
        try {
          const updated = await updateOverview(patientId, consultationId, {
            vitals: {
              blood_pressure_systolic: sys || undefined,
              blood_pressure_diastolic: dia || undefined,
              pulse_bpm: pulseInput ? parseInt(pulseInput) : undefined,
              temperature_f: tempInput ? parseFloat(tempInput) : undefined,
              spo2_percent: spo2Input ? parseFloat(spo2Input) : undefined,
            },
          });
          setData(updated);
        } catch (err) {
          console.error("Failed to auto-save overview", err);
        }
      },
    }));

    async function handleSave() {
      if (!consultationId) return;
      setSaving(true);
      const [sys, dia] = bpInput.split("/").map(Number);
      try {
        const updated = await updateOverview(patientId, consultationId, {
          vitals: {
            blood_pressure_systolic: sys || undefined,
            blood_pressure_diastolic: dia || undefined,
            pulse_bpm: pulseInput ? parseInt(pulseInput) : undefined,
            temperature_f: tempInput ? parseFloat(tempInput) : undefined,
            spo2_percent: spo2Input ? parseFloat(spo2Input) : undefined,
          },
        });
        setData(updated);
      } catch (err) {
        console.error("Failed to save overview", err);
      } finally {
        setSaving(false);
      }
    }

    if (loading) {
      return (
        <div className="flex items-center gap-2 py-8 text-text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading overview...
        </div>
      );
    }

    if (error || !data) {
      return <p className="text-sm text-red-500 py-4">{error ?? "No data"}</p>;
    }

    const v = data.vitals;
    const bp = v.blood_pressure ? `${v.blood_pressure} mmHg` : "—";
    const pulse = v.pulse_bpm ? `${v.pulse_bpm} bpm` : "—";
    const temp = v.temperature_c ? `${v.temperature_c}°C` : "—";
    const spo2 = v.spo2_percent ? `${v.spo2_percent}%` : "—";
    const status = getPatientStatus(data.total_visits, data.last_visit_date);

    return (
      <div className="flex flex-col gap-4">
        {/* Vitals */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Vitals
          </h3>
          {isEditable ? (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Blood Pressure</p>
                <input
                  type="text"
                  value={bpInput}
                  onChange={(e) => { setBpInput(e.target.value); notifyChange({ blood_pressure: e.target.value }); }}
                  placeholder="e.g. 120/80"
                  className="w-full text-sm font-semibold text-text-primary bg-surface-1/60 dark:bg-surface-2/60 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-text-muted mt-0.5">mmHg</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Pulse Rate</p>
                <input
                  type="number"
                  value={pulseInput}
                  onChange={(e) => { setPulseInput(e.target.value); notifyChange({ pulse_bpm: e.target.value ? parseInt(e.target.value) : undefined }); }}
                  placeholder="e.g. 72"
                  className="w-full text-sm font-semibold text-text-primary bg-surface-1/60 dark:bg-surface-2/60 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-text-muted mt-0.5">bpm</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Temperature</p>
                <input
                  type="number"
                  step="0.1"
                  value={tempInput}
                  onChange={(e) => { setTempInput(e.target.value); notifyChange({ temperature_c: e.target.value ? parseFloat(e.target.value) : undefined }); }}
                  placeholder="e.g. 98.6"
                  className="w-full text-sm font-semibold text-text-primary bg-surface-1/60 dark:bg-surface-2/60 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-text-muted mt-0.5">°F</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">SpO2</p>
                <input
                  type="number"
                  value={spo2Input}
                  onChange={(e) => { setSpo2Input(e.target.value); notifyChange({ spo2_percent: e.target.value ? parseFloat(e.target.value) : undefined }); }}
                  placeholder="e.g. 98"
                  className="w-full text-sm font-semibold text-text-primary bg-surface-1/60 dark:bg-surface-2/60 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-text-muted mt-0.5">%</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Blood Pressure</p>
                <p className="text-sm font-semibold text-text-primary">{bp}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Pulse Rate</p>
                <p className="text-sm font-semibold text-text-primary">{pulse}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Temperature</p>
                <p className="text-sm font-semibold text-text-primary">{temp}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">SpO2</p>
                <p className="text-sm font-semibold text-text-primary">{spo2}</p>
              </div>
            </div>
          )}
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 self-end text-xs text-accent hover:underline disabled:opacity-50 float-right"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {/* Patient Summary */}
        <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Patient Summary
          </h3>
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Total Visits</p>
              <p className="text-xl font-bold text-text-primary">{data.total_visits}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Last Visit</p>
              <p className="text-sm font-semibold text-text-primary">
                {data.last_visit_date ? new Date(data.last_visit_date).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Status</p>
              <span className={`inline-block mt-1 px-2 py-0.5 ${status.bg} ${status.text} text-xs font-medium rounded-full`}>
                {status.label}
              </span>
            </div>
          </div>
          {data.patient_summary && (
            <p className="text-xs text-text-secondary mt-3">{data.patient_summary}</p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button variant="outline" icon={<ScanLine className="w-4 h-4" />} className="w-full justify-center py-3">
            Request X-Ray
          </Button>
          <Button icon={<Pill className="w-4 h-4" />} className="w-full justify-center py-3">
            Write Prescription
          </Button>
        </div>
      </div>
    );
  }
);
