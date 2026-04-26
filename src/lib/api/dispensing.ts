import { apiFetch } from "./client";

export interface ActivePrescription {
  consultation_id: string;
  patient_id: string;
  doctor_id: string | null;
  finalized_at: string | null;
  prescription_data: Record<string, unknown>;
}

export interface DispenseItem {
  batch_id: number;
  quantity: number;
  notes?: string | null;
}

export interface DispenseRequest {
  patient_id: string;
  consultation_id?: string | null;
  items: DispenseItem[];
  notes?: string | null;
}

export interface DispensedTransaction {
  transaction_id: string;
  batch_id: number;
  medicine_id: number;
  medicine_name: string;
  quantity: number;
  remaining_stock: number;
}

export interface DispenseResponse {
  patient_id: string;
  consultation_id: string | null;
  pharmacist_id: string;
  transactions: DispensedTransaction[];
  dispensed_at: string;
}

export async function getActivePrescription(patientId: string): Promise<ActivePrescription | null> {
  try {
    return await apiFetch<ActivePrescription>(
      `/pharmacy/active-prescription/${encodeURIComponent(patientId)}`,
    );
  } catch (err: unknown) {
    // 404 = patient has no finalized Rx yet — surface as null instead of throwing
    if (err instanceof Error && /404/.test(err.message)) return null;
    throw err;
  }
}

export async function dispenseMedicines(req: DispenseRequest): Promise<DispenseResponse> {
  return apiFetch<DispenseResponse>("/pharmacy/dispense", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
