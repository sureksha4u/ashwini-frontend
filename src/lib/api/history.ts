import { apiFetch } from "./client";

export interface VisitHistoryItem {
  consultation_id: string;
  visit_date: string | null;
  department: string | null;
  doctor_id: string | null;
  chief_complaint: string | null;
  summary: string | null;
  diagnosis: string | null;
  treatment: string | null;
}

export async function getVisitHistory(patientId: string): Promise<VisitHistoryItem[]> {
  return apiFetch<VisitHistoryItem[]>(`/lookup/${patientId}/history`);
}
