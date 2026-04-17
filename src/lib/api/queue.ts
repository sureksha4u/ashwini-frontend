import { apiFetch } from "./client";
import type { QueuePatient, PatientStatus } from "@/lib/types/patient";

interface QueueItem {
  id: string;
  patient_id: string;
  token_number: string | null;
  state: "waiting" | "in_consultation" | "completed" | "cancelled";
  patient?: { patient_id: string; full_name: string };
}

function stateToPatientStatus(state: QueueItem["state"]): PatientStatus {
  switch (state) {
    case "in_consultation": return "In Consultation";
    case "completed": return "Completed";
    default: return "Waiting";
  }
}

export async function getQueue(): Promise<QueuePatient[]> {
  const items = await apiFetch<QueueItem[]>("/queue");

  return items.map((item) => ({
    consultationId: item.id,
    tokenNumber: item.token_number ?? item.patient_id,
    status: stateToPatientStatus(item.state),
    patient: {
      id: item.patient?.patient_id ?? item.patient_id,
      uhid: "",
      name: item.patient?.full_name ?? item.patient_id,
      age: 0,
      gender: "Other" as const,
      phone: "",
      bloodGroup: "",
      weight: 0,
      height: 0,
      allergies: [],
    },
  }));
}
