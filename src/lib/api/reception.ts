import { apiFetch } from "./client";

export interface RegisterRequest {
  full_name: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  department?: string;
  chief_complaint?: string;
  doctor_id?: string;
}

export interface RegisteredPatient {
  patient_id: string;
  uhid: string;
  full_name: string;
  phone?: string;
  age?: number;
  gender?: string;
}

export interface RegisteredConsultation {
  id: string;
  consultation_id: string;
  patient_id: string;
  token_number: string | null;
  state: string;
  department?: string;
  chief_complaint?: string;
}

export interface RegisterResponse {
  patient: RegisteredPatient;
  consultation: RegisteredConsultation;
}

export async function registerPatient(body: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/reception/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function enqueuePatient(body: {
  patient_id: string;
  department?: string;
  chief_complaint?: string;
  doctor_id?: string;
}): Promise<RegisteredConsultation> {
  return apiFetch<RegisteredConsultation>("/reception/enqueue", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface ReceptionQueueItem {
  id: string;
  consultation_id: string;
  patient_id: string;
  token_number: string | null;
  state: "waiting" | "calling" | "in_consultation" | "completed" | "cancelled";
  department?: string;
  chief_complaint?: string;
  doctor_id?: string;
  created_at: string;
  patient?: { patient_id: string; full_name: string };
}

export async function getReceptionQueue(): Promise<ReceptionQueueItem[]> {
  return apiFetch<ReceptionQueueItem[]>("/reception/queue");
}
