import { apiFetch } from "./client";

export type LabStatus = "ordered" | "in_progress" | "completed" | "cancelled";

export interface LabResult {
  [parameter: string]: {
    value: string | number;
    unit?: string;
    reference?: string;
    flag?: "normal" | "high" | "low" | "critical";
  };
}

export interface Lab {
  id: string;
  lab_id: string;
  patient_id: string;
  test_name: string;
  test_category?: string;
  status: LabStatus;
  results?: LabResult;
  reference_values?: Record<string, unknown>;
  notes?: string;
  ordered_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LabListResponse {
  items: Lab[];
  total: number;
}

export async function getPatientLabs(patientId: string): Promise<Lab[]> {
  const res = await apiFetch<LabListResponse>(`/lookup/${patientId}/labs`);
  return res.items ?? [];
}

export async function orderLab(patientId: string, body: {
  test_name: string;
  test_category?: string;
  notes?: string;
}): Promise<Lab> {
  return apiFetch<Lab>(`/lookup/${patientId}/labs`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
