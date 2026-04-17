export type Specialty = "Orthopedics" | "Dental" | "General";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  specialty: Specialty;
  procedureType: string;
  medicines: Medicine[];
  notes?: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  medicines: Medicine[];
  diagnosis: string;
  clinicalFindings: string;
  annotationData?: string;
  createdAt: string;
}
