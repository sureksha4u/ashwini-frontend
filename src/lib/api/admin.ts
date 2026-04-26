import { apiFetch } from "./client";

export interface StaffRecord {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  is_active: boolean;
  hospital_id: string | null;
  created_at: string | null;
}

export interface HospitalRecord {
  id: string;
  hospital_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
}

export async function getAdminStaff(): Promise<StaffRecord[]> {
  return apiFetch<StaffRecord[]>("/admin/users");
}

export async function getAdminHospitals(): Promise<HospitalRecord[]> {
  return apiFetch<HospitalRecord[]>("/admin/hospitals");
}
