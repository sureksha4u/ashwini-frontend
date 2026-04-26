"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { callPatient } from "@/lib/api/consultation";
import type { QueuePatient, PatientStatus } from "@/lib/types/patient";

function statusToBadgeVariant(status: PatientStatus) {
  switch (status) {
    case "Waiting": return "waiting";
    case "Calling": return "in-consultation"; // Reusing in-consultation style for calling
    case "In Consultation": return "in-consultation";
    case "Completed": return "completed";
    case "X-Ray Pending": return "x-ray-pending";
    case "Done": return "done";
    default: return "default";
  }
}

interface PatientCardProps {
  queuePatient: QueuePatient;
  isSelected?: boolean;
  onRefresh?: () => void;
}

export function PatientCard({ queuePatient, isSelected, onRefresh }: PatientCardProps) {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const { consultationId, patient, tokenNumber, status } = queuePatient;

  const handleCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalling(true);
    try {
      await callPatient(consultationId);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to call patient:", err);
    } finally {
      setCalling(false);
    }
  };

  const isWaiting = status === "Waiting";
  const isCalling = status === "Calling";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all min-w-[130px]",
        isSelected
          ? "border-accent bg-accent/5 dark:bg-accent/10"
          : "border-border-subtle bg-surface-1"
      )}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-semibold text-text-secondary dark:text-text-muted">
        {patient.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-xs font-medium text-text-primary leading-tight">
          {patient.name.split(" ")[0]}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">{tokenNumber}</p>
      </div>

      <Badge label={status} variant={statusToBadgeVariant(status)} />

      {/* Action buttons */}
      <div className="flex gap-1.5 w-full mt-0.5">
        {isWaiting || isCalling ? (
          <button
            onClick={handleCall}
            disabled={calling}
            className={cn(
              "flex-1 text-[10px] font-medium py-1 px-1.5 rounded-md border transition-colors flex items-center justify-center gap-1",
              isCalling 
                ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800"
                : "border-border-subtle text-text-secondary hover:bg-surface-2"
            )}
          >
            {calling ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Phone className={cn("w-3 h-3", isCalling && "animate-pulse")} />
            )}
            {isCalling ? "Calling" : "Call"}
          </button>
        ) : (
          <button
            onClick={() => router.push(`/patients/${patient.id}`)}
            className="flex-1 text-[10px] font-medium py-1 px-1.5 rounded-md border border-border-subtle text-text-secondary hover:bg-surface-2 transition-colors"
          >
            View
          </button>
        )}
        
        <button
          onClick={() => router.push(`/patients/${patient.id}?autoStart=true`)}
          className={cn(
            "flex-1 text-[10px] font-medium py-1 px-1.5 rounded-md transition-colors",
            isCalling 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-accent text-white hover:bg-accent/90"
          )}
        >
          Start
        </button>
      </div>
    </div>
  );
}
