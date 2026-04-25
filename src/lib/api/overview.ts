import { apiFetch } from "./client";

export interface VitalsData {
  height_cm?: number;
  weight_kg?: number;
  temperature_c?: number;
  pulse_bpm?: number;
  blood_pressure?: string;        // "systolic/diastolic" e.g. "126/82"
  spo2_percent?: number;
  respiratory_rate?: number;
}

// Shape sent to PUT /overview — matches backend VitalsUpdate model
export interface VitalsUpdate {
  height_cm?: number;
  weight_kg?: number;
  temperature_f?: number;         // backend converts F → C
  pulse_bpm?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  spo2_percent?: number;
  respiratory_rate?: number;
}

export interface OverviewResponse {
  patient: {
    id: string;
    patient_id: string;
    uhid: string;
    full_name: string;
    age: number;
    gender: string;
    blood_group: string;
  };
  chief_complaint: string | null;
  vitals: VitalsData;
  patient_summary: string | null;
  total_visits: number;
  last_visit_date: string | null;
  last_visit_summary: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
}

export async function getOverview(patientId: string): Promise<OverviewResponse> {
  return apiFetch<OverviewResponse>(`/lookup/${patientId}/overview`);
}

export async function updateOverview(
  patientId: string,
  consultationId: string,
  data: { chief_complaint?: string; vitals?: VitalsUpdate; patient_summary?: string }
): Promise<OverviewResponse> {
  return apiFetch<OverviewResponse>(`/lookup/${patientId}/overview`, {
    method: "PUT",
    body: JSON.stringify({ consultation_id: consultationId, ...data }),
  });
}
