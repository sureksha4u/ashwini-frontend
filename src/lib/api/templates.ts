import { apiFetch } from "./client";

export interface TemplateMed {
  drug: string;
  route: string;
  freq: string;
  dur: string;
  when: string;
}

export interface TemplateData {
  symptoms?: string | null;
  chief_complaint?: string | null;
  clinical_notes?: string | null;
  diagnosis?: string | null;
  medicines?: TemplateMed[] | null;
  labs?: string[] | null;
  follow_up_days?: number | null;
  instructions?: string | null;
  referral?: string | null;
}

export interface TemplateRecord {
  template_id: string;
  doctor_id: string;
  procedure_type_id: string;
  template_name: string;
  description: string | null;
  template_data: TemplateData;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreatePayload {
  procedure_type_id: string;
  template_name: string;
  description?: string;
  template_data: TemplateData;
}

export interface TemplateUpdatePayload {
  template_name?: string;
  description?: string;
  template_data?: TemplateData;
}

export async function listTemplates(): Promise<TemplateRecord[]> {
  return apiFetch<TemplateRecord[]>("/templates");
}

export async function createTemplate(payload: TemplateCreatePayload): Promise<TemplateRecord> {
  return apiFetch<TemplateRecord>("/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTemplate(id: string, payload: TemplateUpdatePayload): Promise<TemplateRecord> {
  return apiFetch<TemplateRecord>(`/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function cloneTemplate(id: string): Promise<TemplateRecord> {
  return apiFetch<TemplateRecord>(`/templates/${id}/clone`, { method: "POST" });
}

export async function archiveTemplate(id: string): Promise<TemplateRecord> {
  return apiFetch<TemplateRecord>(`/templates/${id}/archive`, { method: "PATCH" });
}
