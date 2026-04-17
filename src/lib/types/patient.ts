export type Gender = "Male" | "Female" | "Other";

export type PatientStatus = "Waiting" | "In Consultation" | "Completed" | "X-Ray Pending" | "Done";

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  bloodGroup: string;
  weight: number;
  height: number;
  allergies: string[];
  avatarUrl?: string;
}

export interface QueuePatient {
  consultationId: string;
  tokenNumber: string;
  patient: Patient;
  status: PatientStatus;
  appointmentTime?: string;
}

export interface PatientSummary {
  totalVisits: number;
  lastVisit: string;
  status: "Active Patient" | "Inactive";
}
