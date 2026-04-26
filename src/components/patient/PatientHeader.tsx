"use client";

import { X, Play, Square, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Patient } from "@/lib/types/patient";
import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { Btn } from "@/components/ui/Btn";

interface PatientHeaderProps {
  patient: Patient;
  chiefComplaint: string;
  isEditable: boolean;
  onChiefComplaintChange: (value: string) => void;
  consultationActive: boolean;
  consultationLoading: boolean;
  onStartConsultation: () => void;
  onEndConsultation: () => void;
}

export function PatientHeader({
  patient,
  chiefComplaint,
  isEditable,
  onChiefComplaintChange,
  consultationActive,
  consultationLoading,
  onStartConsultation,
  onEndConsultation,
}: PatientHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-surface-1 border-b border-border-subtle px-5 py-2.5 flex items-center gap-4">
      <Avatar name={patient.name} role="staff" size={36} />

      <div className="shrink-0 min-w-[140px]">
        <h1 className="text-sm font-semibold text-text-primary leading-tight">{patient.name}</h1>
        <p className="text-[11px] text-text-muted mt-0.5 font-mono">
          {patient.gender} · {patient.uhid}
        </p>
      </div>

      <div className="w-px h-9 bg-border-subtle shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5 font-semibold">
          Chief Complaint
        </p>
        {isEditable ? (
          <input
            type="text"
            value={chiefComplaint}
            onChange={(e) => onChiefComplaintChange(e.target.value)}
            placeholder="Enter chief complaint…"
            className="w-full text-sm text-text-primary bg-transparent outline-none border-b border-dashed border-border-strong focus:border-accent pb-0.5 placeholder:text-text-muted"
          />
        ) : (
          <p className="text-sm text-text-primary truncate">
            {chiefComplaint || <span className="text-text-muted">—</span>}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <StatusDot color={consultationActive ? "success" : "muted"} pulse={consultationActive} />
        {consultationActive ? (
          <Btn variant="danger" size="sm" disabled={consultationLoading} onClick={onEndConsultation}>
            {consultationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
            {consultationLoading ? "Saving…" : "End Consultation"}
          </Btn>
        ) : (
          <Btn variant="primary" size="sm" disabled={consultationLoading} onClick={onStartConsultation}>
            {consultationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {consultationLoading ? "Starting…" : "Start Consultation"}
          </Btn>
        )}
      </div>

      <button
        onClick={() => router.back()}
        aria-label="Close patient file"
        className="w-8 h-8 grid place-items-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
