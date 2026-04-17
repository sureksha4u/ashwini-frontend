export type ConsultationState = "not_started" | "active" | "completed";

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  state: ConsultationState;
  startedAt?: string;
  endedAt?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  clinicalFindings?: string;
  notes?: string;
}

export interface LabReport {
  id: string;
  testName: string;
  orderedAt: string;
  resultAvailable: boolean;
  resultUrl?: string;
}

export interface RadiologyReport {
  id: string;
  type: "X-Ray" | "USG" | "MRI" | "CT";
  orderedAt: string;
  uploadedAt?: string;
  fileUrl?: string;
  notes?: string;
}

export interface AnalyticsData {
  xRayAdherence: number;
  pharmacyRefills: { filled: number; total: number };
  riskLevel: "Low" | "Moderate" | "High";
  riskFactors: string[];
}
