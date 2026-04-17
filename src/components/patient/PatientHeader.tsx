"use client";

import { X, Play, Square, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Patient } from "@/lib/types/patient";

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
    <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark px-6 py-3 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-navy-dark flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shrink-0">
        {patient.name.charAt(0)}
      </div>

      {/* Name block */}
      <div className="shrink-0 min-w-[140px]">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{patient.name}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {patient.gender} &bull; {patient.uhid}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200 dark:bg-border-dark shrink-0" />

      {/* Chief Complaint */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Chief Complaint</p>
        {isEditable ? (
          <input
            type="text"
            value={chiefComplaint}
            onChange={(e) => onChiefComplaintChange(e.target.value)}
            placeholder="Enter chief complaint..."
            className="w-full text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none border-b border-dashed border-gray-300 dark:border-border-dark focus:border-primary pb-0.5 placeholder-gray-300"
          />
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {chiefComplaint || <span className="text-gray-400">—</span>}
          </p>
        )}
      </div>

      {/* Status dot + Consultation button */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`w-2 h-2 rounded-full ${consultationActive ? "bg-green-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`}
        />
        {consultationActive ? (
          <button
            onClick={onEndConsultation}
            disabled={consultationLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-colors"
          >
            {consultationLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Square className="w-3 h-3" />
            )}
            {consultationLoading ? "Saving…" : "End Consultation"}
          </button>
        ) : (
          <button
            onClick={onStartConsultation}
            disabled={consultationLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {consultationLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {consultationLoading ? "Starting…" : "Start Consultation"}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => router.back()}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-dark text-gray-400 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
