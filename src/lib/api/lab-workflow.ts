import { apiFetch } from "./client";

export interface LabQueueItem {
  id: string;
  lab_id: string;
  patient_id: string;
  patient_name?: string;
  test_name: string;
  test_category?: string;
  status: "ordered" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  ordered_at?: string;
  completed_at?: string;
  has_critical: boolean;
}

export async function getLabQueue(): Promise<LabQueueItem[]> {
  return apiFetch<LabQueueItem[]>("/labs");
}

export async function getCriticalLabs(): Promise<LabQueueItem[]> {
  return apiFetch<LabQueueItem[]>("/labs/critical");
}
