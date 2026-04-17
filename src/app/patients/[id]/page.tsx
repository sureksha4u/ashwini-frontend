"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientTabs } from "@/components/patient/PatientTabs";
import { SendPrescriptionModal } from "@/components/patient/SendPrescriptionModal";
import { getPatient } from "@/lib/api/patients";
import { startConsultation, endConsultation, getLatestConsultation } from "@/lib/api/consultation";
import { getCurrentDoctor } from "@/lib/api/doctors";
import { getOverview } from "@/lib/api/overview";
import { useConsultationAutoSave } from "@/lib/hooks/useConsultationAutoSave";
import type { Patient } from "@/lib/types/patient";
import type { OverviewTabHandle } from "@/components/patient/tabs/OverviewTab";
import type { PrescriptionTabHandle } from "@/components/patient/tabs/PrescriptionTab";
import type { ConsultationSyncPayload } from "@/lib/api/consultation";

export default function PatientConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const autoStart = searchParams.get("autoStart") === "true";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorSpecialty, setDoctorSpecialty] = useState<string | null>(null);

  const [chiefComplaint, setChiefComplaint] = useState("");

  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [consultationActive, setConsultationActive] = useState(false);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [latestConsultationId, setLatestConsultationId] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [completedConsultationId, setCompletedConsultationId] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  // Refs to child tabs — used only for prescription save on end
  const overviewRef = useRef<OverviewTabHandle>(null);
  const prescriptionRef = useRef<PrescriptionTabHandle>(null);

  // Ref-only: no re-render needed, auto-save hook reads it directly
  const syncPayloadRef = useRef<ConsultationSyncPayload>({});

  const updateSyncPayload = useCallback((patch: Partial<ConsultationSyncPayload>) => {
    syncPayloadRef.current = { ...syncPayloadRef.current, ...patch };
  }, []);

  const autoSave = useConsultationAutoSave(
    consultationId,
    () => syncPayloadRef.current
  );

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

    getLatestConsultation(id).then((c) => {
      if (c) setLatestConsultationId(c.consultation_id);
    });
  }, [id]);

  useEffect(() => {
    if (autoStart && !loading && patient && !consultationActive) {
      handleStartConsultation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, loading, patient]);

  function handleChiefComplaintChange(value: string) {
    setChiefComplaint(value);
    updateSyncPayload({ chief_complaint: value });
    autoSave.markDirty();
  }

  async function handleStartConsultation() {
    setConsultationLoading(true);
    try {
      const result = await startConsultation(id);
      setConsultationId(result.consultation_id);
      setConsultationActive(true);
      syncPayloadRef.current = { chief_complaint: chiefComplaint };
    } catch (err) {
      console.error("Failed to start consultation", err);
    } finally {
      setConsultationLoading(false);
    }
  }

  async function handleEndConsultation() {
    if (!consultationId) return;
    setConsultationLoading(true);
    try {
      // Force-flush any dirty auto-save data first
      await autoSave.forceSave();

      // Save prescription tab annotation data
      await prescriptionRef.current?.save();

      await endConsultation(consultationId);

      setCompletedConsultationId(consultationId);
      setConsultationActive(false);
      setConsultationId(null);
      setLatestConsultationId(consultationId);
      setHistoryRefreshKey((k) => k + 1);
      setShowSendModal(true);
    } catch (err) {
      console.error("Failed to end consultation", err);
    } finally {
      setConsultationLoading(false);
    }
  }

  function handleSendModalClose() {
    setShowSendModal(false);
    setCompletedConsultationId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading patient...
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          {error ?? "Patient not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PatientHeader
        patient={patient}
        chiefComplaint={chiefComplaint}
        isEditable={consultationActive}
        onChiefComplaintChange={handleChiefComplaintChange}
        consultationActive={consultationActive}
        consultationLoading={consultationLoading}
        onStartConsultation={handleStartConsultation}
        onEndConsultation={handleEndConsultation}
      />

      <PatientTabs
        patientId={id}
        consultationId={consultationId ?? latestConsultationId}
        isConsultationActive={consultationActive}
        doctorSpecialty={doctorSpecialty}
        overviewRef={overviewRef}
        prescriptionRef={prescriptionRef}
        historyRefreshKey={historyRefreshKey}
        onSyncPayloadChange={updateSyncPayload}
        markDirty={autoSave.markDirty}
      />

      {showSendModal && completedConsultationId && (
        <SendPrescriptionModal
          consultationId={completedConsultationId}
          patientPhone={patient.phone}
          onClose={handleSendModalClose}
        />
      )}
    </div>
  );
}
