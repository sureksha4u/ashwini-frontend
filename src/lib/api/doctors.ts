import { apiFetch } from "./client";

export interface DoctorProfile {
  doctor_id: string;
  name: string;
  specialty: string;
  is_active: boolean;
}

export async function getCurrentDoctor(): Promise<DoctorProfile> {
  return apiFetch<DoctorProfile>("/doctors/me");
}
