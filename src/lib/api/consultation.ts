import { apiFetch } from "./client";

export interface ConsultationResponse {
  id: string;
  consultation_id: string;
  patient_id: string;
  state: "waiting" | "in_consultation" | "completed" | "cancelled";
  token_number: string | null;
  chief_complaint: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  clinical_notes: string | null;
  prescription_data: Record<string, unknown> | null;
  source_template_id: string | null;
  consultation_start: string | null;
  consultation_end: string | null;
  last_synced_at: string | null;
}

export interface ConsultationSyncPayload {
  chief_complaint?: string;
  clinical_notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  prescription_data?: Record<string, unknown>;
  source_template_id?: string;
  blood_pressure?: string;
  pulse_bpm?: number;
  temperature_c?: number;
  spo2_percent?: number;
  height_cm?: number;
  weight_kg?: number;
  respiratory_rate?: number;
}

export async function startConsultation(patientId: string): Promise<ConsultationResponse> {
  return apiFetch<ConsultationResponse>("/consultations/start", {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId }),
  });
}

export async function syncConsultation(
  consultationId: string,
  data: ConsultationSyncPayload
): Promise<ConsultationResponse> {
  return apiFetch<ConsultationResponse>(`/consultations/${consultationId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function endConsultation(
  consultationId: string,
  data?: { diagnosis?: string; treatment_plan?: string; clinical_notes?: string }
): Promise<ConsultationResponse> {
  return apiFetch<ConsultationResponse>(`/consultations/${consultationId}/end`, {
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });
}

export async function getLatestConsultation(patientId: string): Promise<ConsultationResponse | null> {
  try {
    return await apiFetch<ConsultationResponse>(`/consultations/patient/${patientId}/latest`);
  } catch {
    return null;
  }
}

export async function getConsultation(consultationId: string): Promise<ConsultationResponse | null> {
  try {
    return await apiFetch<ConsultationResponse>(`/consultations/${consultationId}`);
  } catch {
    return null;
  }
}
