import { apiFetch } from "./client";

export interface RadioQueueItem {
  id: string;
  radiology_id: string;
  patient_id: string;
  patient_name?: string;
  type: string;
  body_part: string;
  status: "requested" | "captured" | "uploaded" | "reviewed";
  impression?: string;
  findings?: string;
  uploaded_at?: string;
  reviewed_at?: string;
}

export async function getRadiologyQueue(): Promise<RadioQueueItem[]> {
  return apiFetch<RadioQueueItem[]>("/radiology");
}

export async function getCriticalRadiology(): Promise<RadioQueueItem[]> {
  return apiFetch<RadioQueueItem[]>("/radiology/critical");
}
