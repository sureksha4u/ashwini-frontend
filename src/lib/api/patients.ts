import { apiFetch } from "./client";
import type { Patient } from "@/lib/types/patient";

// Shape returned by GET /api/v1/patients/{id}
interface PatientInDB {
  id: string;
  patient_id: string;
  uhid: string;
  full_name: string;
  phone: string;
  age: number;
  gender: string;
  blood_group: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
}

function mapPatient(p: PatientInDB): Patient {
  return {
    id: p.patient_id,
    uhid: p.uhid,
    name: p.full_name,
    age: p.age,
    gender: p.gender as Patient["gender"],
    phone: p.phone,
    bloodGroup: p.blood_group,
    weight: 0,   // not in GET /patients response — comes from overview vitals
    height: 0,
    allergies: p.allergies ?? [],
  };
}

export async function getPatient(id: string): Promise<Patient> {
  const data = await apiFetch<PatientInDB>(`/patients/${id}`);
  return mapPatient(data);
}

export interface PatientSearchResult {
  id: string;
  patient_id: string;
  full_name: string;
  phone: string;
  uhid: string;
  age: number;
  gender: string;
}

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  return apiFetch<PatientSearchResult[]>(`/patients/search?query=${encodeURIComponent(query)}`);
}
