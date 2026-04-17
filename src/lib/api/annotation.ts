import { apiFetch } from "./client";
import type { AnnotationState } from "@/components/annotation/types";
import type { Medicine } from "@/lib/types/prescription";

export async function saveAnnotation(
  consultationId: string,
  state: AnnotationState,
  snapshot: string | null,
  clinicalFindings?: string,
  medicines?: Medicine[]
): Promise<void> {
  await apiFetch(`/consultations/${consultationId}/prescription`, {
    method: "PUT",
    body: JSON.stringify({
      prescription_data: {
        annotation_data: state,
        annotation_snapshot: snapshot,
        clinical_findings: clinicalFindings,
        medicines: medicines,
      },
    }),
  });
}

export async function generatePdf(consultationId: string): Promise<string> {
  const res = await apiFetch<{ pdf_url: string }>(
    `/consultations/${consultationId}/prescription/generate-pdf`,
    { method: "POST" }
  );
  return res.pdf_url;
}

export interface FullAnnotationData extends AnnotationState {
  clinical_findings?: string;
  medicines?: Medicine[];
}

export async function getAnnotation(consultationId: string): Promise<FullAnnotationData | null> {
  try {
    const res = await apiFetch<{ prescription_data?: { annotation_data?: AnnotationState; clinical_findings?: string; medicines?: Medicine[] } }>(
      `/consultations/${consultationId}/prescription`
    );
    if (!res.prescription_data) return null;
    const { annotation_data, clinical_findings, medicines } = res.prescription_data;
    return {
      ...(annotation_data ?? { templateId: "", selectedParts: {}, drawings: [], notes: "" }),
      clinical_findings,
      medicines,
    };
  } catch {
    return null;
  }
}
