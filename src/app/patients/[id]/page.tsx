"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientTabs } from "@/components/patient/PatientTabs";
import { SendPrescriptionModal } from "@/components/patient/SendPrescriptionModal";
import { getPatient } from "@/lib/api/patients";
import { getCurrentDoctor } from "@/lib/api/doctors";
import { getOverview } from "@/lib/api/overview";
import { useConsultation } from "@/lib/hooks/useConsultation";
import type { Patient } from "@/lib/types/patient";
import type { OverviewTabHandle } from "@/components/patient/tabs/OverviewTab";
import type { PrescriptionTabHandle } from "@/components/patient/tabs/PrescriptionTab";

export default function PatientConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("autoStart") === "true";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorSpecialty, setDoctorSpecialty] = useState<string | null>(null);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const {
    consultation,
    isActive,
    loading: consultationLoading,
    start,
    end,
    updatePayload,
    markDirty,
    forceSave
  } = useConsultation(id);

  // Refs to child tabs
  const overviewRef = useRef<OverviewTabHandle>(null);
  const prescriptionRef = useRef<PrescriptionTabHandle>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPatient(id),
      getCurrentDoctor(),
      getOverview(id),
    ])
      .then(([p, doctor, overview]) => {
        setPatient(p);
        setDoctorSpecialty(doctor.specialty);
        setChiefComplaint(overview.chief_complaint ?? "");
      })
      .catch((err) => setError(err?.message ?? "Failed to load patient"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (autoStart && !loading && patient && !isActive && !consultationLoading) {
      start().catch(console.error);
    }
  }, [autoStart, loading, patient, isActive, consultationLoading, start]);

  const handleChiefComplaintChange = (value: string) => {
    setChiefComplaint(value);
    updatePayload({ chief_complaint: value });
  };

  const handleEndConsultation = async () => {
    try {
      // Save prescription tab annotation data
      await prescriptionRef.current?.save();
      
      const result = await end();
      if (result) {
        setHistoryRefreshKey((k) => k + 1);
        setShowSendModal(true);
      }
    } catch (err) {
      console.error("Failed to end consultation", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading patient...
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-danger text-sm">
          {typeof error === 'string' ? error : (error as any)?.message ?? "Patient not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PatientHeader
        patient={patient}
        chiefComplaint={chiefComplaint}
        isEditable={isActive}
        onChiefComplaintChange={handleChiefComplaintChange}
        consultationActive={isActive}
        consultationLoading={consultationLoading}
        onStartConsultation={start}
        onEndConsultation={handleEndConsultation}
      />

      <PatientTabs
        patientId={id}
        consultationId={consultation?.consultation_id ?? null}
        isConsultationActive={isActive}
        doctorSpecialty={doctorSpecialty}
        overviewRef={overviewRef}
        prescriptionRef={prescriptionRef}
        historyRefreshKey={historyRefreshKey}
        onSyncPayloadChange={updatePayload}
        markDirty={markDirty}
      />

      {showSendModal && consultation && (
        <SendPrescriptionModal
          consultationId={consultation.consultation_id}
          patientPhone={patient.phone}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
}
