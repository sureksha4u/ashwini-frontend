import { apiFetch } from "./client";

export interface RadiologyItem {
  id: string;
  radiology_id: string;
  patient_id: string;
  type: string;
  body_part: string;
  status: string;
  file_key: string | null;
  file_url: string | null;
  impression: string | null;
  findings: string | null;
  radiologist_notes: string | null;
  uploaded_at: string;
}

export async function getRadiology(patientId: string): Promise<RadiologyItem[]> {
  return apiFetch<RadiologyItem[]>(`/patients/${patientId}/radiology`);
}
