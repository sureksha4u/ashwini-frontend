"use client";

import { useState, useEffect, useCallback } from "react";
import { ScanLine, Pill, AlertTriangle, Info, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAnalytics, type AnalyticsResponse } from "@/lib/api/analytics";

interface AnalyticsTabProps {
  patientId: string;
}

const riskColors: Record<string, string> = {
  low: "text-green-600",
  moderate: "text-amber-600",
  high: "text-red-600",
};

export function AnalyticsTab({ patientId }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalytics(patientId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-text-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-red-500 py-4">{error ?? "No data"}</p>;
  }

  const xrayPct = data.xray_adherence.adherence_percent;
  const refillPct = data.compliance.prescription_adherence;
  const riskLevel = data.risk_assessment.risk_level;

  const riskFactors: string[] = [];
  if (data.risk_assessment.chronic_conditions > 0)
    riskFactors.push(`${data.risk_assessment.chronic_conditions} chronic condition(s) on record.`);
  if (data.risk_assessment.medication_count > 0)
    riskFactors.push(`Currently on ${data.risk_assessment.medication_count} medication(s).`);
  if (data.compliance.appointment_show_rate < 90)
    riskFactors.push(`Appointment show rate: ${data.compliance.appointment_show_rate}%.`);

  return (
    <div className="flex flex-col gap-4">
      {/* Adherence cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* X-Ray Adherence */}
        <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-text-primary">X-Ray Adherence</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              {xrayPct.toFixed(0)}%
            </span>
          </div>
          <ProgressBar value={xrayPct} color="bg-accent" />
          <p className="text-xs text-text-muted mt-2">
            {data.xray_adherence.completed} of {data.xray_adherence.ordered} X-rays completed
          </p>
        </div>

        {/* Pharmacy Refills */}
        <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-text-primary">Prescription Adherence</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              {refillPct.toFixed(0)}%
            </span>
          </div>
          <ProgressBar value={refillPct} color="bg-green-500" />
          <p className="text-xs text-text-muted mt-2">
            {data.pharmacy_refills.refill_due} refill(s) due
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Risk Assessment</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Visit frequency: {data.risk_assessment.visit_frequency}
            </p>
          </div>
          <span className={`text-sm font-semibold capitalize ${riskColors[riskLevel] ?? "text-text-secondary"}`}>
            {riskLevel} Risk
          </span>
        </div>

        {riskFactors.length > 0 ? (
          <ul className="space-y-2">
            {riskFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                {i === 0 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                )}
                {factor}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No significant risk factors identified.</p>
        )}
      </div>

      {/* Compliance breakdown */}
      <div className="bg-surface-1 border border-border-subtle rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Compliance Overview</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Appointment Show Rate</span>
              <span>{data.compliance.appointment_show_rate}%</span>
            </div>
            <ProgressBar value={data.compliance.appointment_show_rate} color="bg-accent" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Follow-up Completion</span>
              <span>{data.compliance.follow_up_completion}%</span>
            </div>
            <ProgressBar value={data.compliance.follow_up_completion} color="bg-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
