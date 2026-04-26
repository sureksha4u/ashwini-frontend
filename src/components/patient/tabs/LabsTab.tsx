"use client";

import { useEffect, useState } from "react";
import { Plus, Download, Loader2, Beaker, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { getPatientLabs, type Lab, type LabResult } from "@/lib/api/labs";
import { cn } from "@/lib/utils";

const STATUS_PILL: Record<string, { color: "accent" | "success" | "warning" | "danger" | "info"; label: string }> = {
  ordered: { color: "info", label: "Ordered" },
  in_progress: { color: "warning", label: "In progress" },
  completed: { color: "success", label: "Completed" },
  cancelled: { color: "danger", label: "Cancelled" },
};

function ResultsTable({ results }: { results: LabResult }) {
  const entries = Object.entries(results);
  if (entries.length === 0) return <p className="text-sm text-text-muted">No result parameters available.</p>;

  return (
    <div>
      <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_100px] px-3 py-2 bg-surface-2 rounded-lg text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">
        <span>Parameter</span>
        <span>Value</span>
        <span>Unit</span>
        <span>Reference</span>
        <span>Flag</span>
      </div>
      {entries.map(([param, data]) => {
        const flag = typeof data === "object" && data !== null ? (data as { flag?: string }).flag : undefined;
        const value = typeof data === "object" && data !== null ? (data as { value?: unknown }).value : data;
        const unit = typeof data === "object" && data !== null ? (data as { unit?: string }).unit : undefined;
        const reference = typeof data === "object" && data !== null ? (data as { reference?: string }).reference : undefined;
        const isAbnormal = flag === "high" || flag === "low" || flag === "critical";

        return (
          <div
            key={param}
            className={cn(
              "grid grid-cols-[2fr_1fr_1fr_1.5fr_100px] px-3 py-2.5 items-center gap-2 rounded-lg mb-0.5",
              isAbnormal ? "bg-danger-soft/60" : "hover:bg-surface-2/50"
            )}
          >
            <span className="text-sm font-medium text-text-primary">{param}</span>
            <span className={cn("text-sm font-semibold font-mono", isAbnormal ? "text-danger" : "text-text-primary")}>
              {String(value ?? "—")}
            </span>
            <span className="text-xs text-text-muted font-mono">{unit ?? "—"}</span>
            <span className="text-xs text-text-secondary font-mono">{reference ?? "—"}</span>
            {flag ? (
              <Pill color={isAbnormal ? "danger" : "success"} soft>
                {flag === "high" ? "↑ HIGH" : flag === "low" ? "↓ LOW" : flag === "critical" ? "⚠ CRIT" : "✓ normal"}
              </Pill>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface LabsTabProps {
  patientId: string;
}

export function LabsTab({ patientId }: LabsTabProps) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lab | null>(null);

  useEffect(() => {
    setLoading(true);
    getPatientLabs(patientId)
      .then((data) => {
        setLabs(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load labs"))
      .finally(() => setLoading(false));
  }, [patientId]);

  const abnormalCount = (lab: Lab) => {
    if (!lab.results) return 0;
    return Object.values(lab.results).filter((v) => {
      const f = typeof v === "object" && v !== null ? (v as { flag?: string }).flag : undefined;
      return f === "high" || f === "low" || f === "critical";
    }).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-16 text-text-muted gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading lab results…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 m-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[480px]">
      {/* Lab history list */}
      <Card noPadding className="w-72 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border-subtle flex justify-between items-center">
          <span className="text-sm font-semibold text-text-primary">Lab history</span>
          <Btn size="sm" icon={<Plus className="w-3 h-3" />}>Order</Btn>
        </div>
        <div className="flex-1 overflow-y-auto">
          {labs.length === 0 ? (
            <div className="p-6 text-center text-text-muted">
              <Beaker className="w-8 h-8 mx-auto mb-2 opacity-25" />
              <p className="text-xs">No lab orders yet.</p>
            </div>
          ) : (
            labs.map((lab, i) => {
              const abnormal = abnormalCount(lab);
              const isSelected = selected?.id === lab.id;
              return (
                <button
                  key={lab.id}
                  onClick={() => setSelected(lab)}
                  className={cn(
                    "w-full text-left p-3 border-b border-border-subtle last:border-0 transition-colors",
                    isSelected ? "bg-accent-soft/50" : "hover:bg-surface-2/50"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-text-primary">{lab.test_name}</span>
                    {abnormal > 0 && <Pill color="danger" soft>{abnormal} abnormal</Pill>}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Pill color={STATUS_PILL[lab.status]?.color ?? "info"} soft className="text-[10px]">
                      {STATUS_PILL[lab.status]?.label ?? lab.status}
                    </Pill>
                    {lab.ordered_at && (
                      <span className="text-[11px] text-text-muted font-mono">
                        {new Date(lab.ordered_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Result detail */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <Beaker className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a lab result to view details</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{selected.test_name}</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {selected.test_category && <span>{selected.test_category} · </span>}
                  {selected.lab_id}
                  {selected.completed_at && (
                    <> · Completed {new Date(selected.completed_at).toLocaleDateString("en-IN")}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>PDF</Btn>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selected.results ? (
                <ResultsTable results={selected.results} />
              ) : (
                <div className="text-sm text-text-muted py-6 text-center">
                  {selected.status === "ordered" || selected.status === "in_progress"
                    ? "Results pending — lab is processing the sample."
                    : "No results recorded."}
                </div>
              )}

              {selected.notes && (
                <div className="mt-4 p-3 rounded-lg bg-warning-soft border border-warning/20 text-sm text-text-secondary">
                  <strong>Notes:</strong> {selected.notes}
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
