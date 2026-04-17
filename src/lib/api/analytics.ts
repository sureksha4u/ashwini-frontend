import { apiFetch } from "./client";

export interface AnalyticsResponse {
  patient_id: string;
  xray_adherence: {
    ordered: number;
    completed: number;
    adherence_percent: number;
    status: string;
  };
  pharmacy_refills: {
    medications: string[];
    refill_due: number;
    status: string;
  };
  risk_assessment: {
    chronic_conditions: number;
    medication_count: number;
    visit_frequency: string;
    risk_level: string;
  };
  compliance: {
    appointment_show_rate: number;
    prescription_adherence: number;
    follow_up_completion: number;
  };
}

export async function getAnalytics(patientId: string): Promise<AnalyticsResponse> {
  return apiFetch<AnalyticsResponse>(`/patients/${patientId}/analytics`);
}
