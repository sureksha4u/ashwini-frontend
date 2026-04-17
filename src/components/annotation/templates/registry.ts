/**
 * Template registry — maps doctor specialty strings to AnnotationTemplate configs.
 *
 * Adding a new specialty:
 *   1. Create a wrapper component in this folder.
 *   2. Add an entry to TEMPLATE_REGISTRY below.
 *   Zero changes to the AnnotationCanvas engine.
 */
import type { AnnotationTemplate } from "../types";
import { DentalTemplate } from "./DentalTemplate";
import { OrthopedicTemplate } from "./OrthopedicTemplate";

const dentalTemplate: AnnotationTemplate = {
  id: "dental_adult",
  label: "Dental Chart",
  Component: DentalTemplate,
  conditions: [
    { id: "cavity",     label: "Cavity",          color: "#ef4444" },
    { id: "missing",    label: "Missing",          color: "#6b7280" },
    { id: "crown",      label: "Crown",            color: "#f59e0b" },
    { id: "filling",    label: "Filling",          color: "#3b82f6" },
    { id: "pain",       label: "Pain / Sensitive", color: "#8b5cf6" },
    { id: "implant",    label: "Implant",          color: "#10b981" },
  ],
};

const orthopedicTemplate: AnnotationTemplate = {
  id: "orthopedic_body",
  label: "Body Map",
  Component: OrthopedicTemplate,
  conditions: [
    { id: "pain",       label: "Pain",             color: "#ef4444" },
    { id: "swelling",   label: "Swelling",         color: "#f59e0b" },
    { id: "fracture",   label: "Fracture",         color: "#8b5cf6" },
    { id: "sprain",     label: "Sprain / Strain",  color: "#3b82f6" },
    { id: "surgery",    label: "Surgical site",    color: "#10b981" },
  ],
};

const dermatologyTemplate: AnnotationTemplate = {
  id: "dermatology_body",
  label: "Skin / Body Map",
  Component: OrthopedicTemplate, // same body map component, different conditions
  conditions: [
    { id: "rash",       label: "Rash",             color: "#ef4444" },
    { id: "lesion",     label: "Lesion",           color: "#f59e0b" },
    { id: "burn",       label: "Burn",             color: "#f97316" },
    { id: "infection",  label: "Infection",        color: "#8b5cf6" },
    { id: "scar",       label: "Scar",             color: "#6b7280" },
  ],
};

/**
 * Maps doctor.specialty values (case-insensitive) → template config.
 * Specialties with no visual diagram return null and the canvas won't render.
 */
export const TEMPLATE_REGISTRY: Record<string, AnnotationTemplate> = {
  dental:        dentalTemplate,
  dentistry:     dentalTemplate,

  orthopedic:    orthopedicTemplate,
  orthopedics:   orthopedicTemplate,
  orthopaedics:  orthopedicTemplate,

  dermatology:   dermatologyTemplate,
  dermatologist: dermatologyTemplate,
};

export function getTemplate(specialty: string | null | undefined): AnnotationTemplate | null {
  if (!specialty) return null;
  return TEMPLATE_REGISTRY[specialty.toLowerCase()] ?? null;
}
