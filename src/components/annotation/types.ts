import type { ComponentType } from "react";

// ─── Drawing shapes ───────────────────────────────────────────────────────────

export type DrawingTool = "select" | "circle" | "freehand" | "pin";

export interface CircleDrawing {
  type: "circle";
  x: number;
  y: number;
  r: number;
  color: string;
}

export interface FreehandDrawing {
  type: "freehand";
  points: number[]; // flat [x1,y1,x2,y2,...] for konva Line
  color: string;
}

export interface PinDrawing {
  type: "pin";
  x: number;
  y: number;
  label: string;
  color: string;
}

export type Drawing = CircleDrawing | FreehandDrawing | PinDrawing;

// ─── Condition (what a doctor can mark on a selected part) ───────────────────

export interface Condition {
  id: string;
  label: string;
  color: string; // hex — applied as fill/stroke on the selected part
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface TemplateComponentProps {
  selectedParts: Record<string, string[]>; // partId → condition ids
  onPartClick: (partId: string) => void;
  isEditable: boolean;
  conditions: Condition[];
  isEnlarged?: boolean;
}

export interface AnnotationTemplate {
  id: string;
  label: string;
  Component: ComponentType<TemplateComponentProps>;
  conditions: Condition[];
  // Optional drill-down: clicking a top-level region opens a sub-template
  drillDown?: Record<string, AnnotationTemplate>;
}

// ─── Saved state (stored as annotation_data in prescription) ─────────────────

export interface AnnotationState {
  templateId: string;
  selectedParts: Record<string, string[]>;
  drawings: Drawing[];
  notes: string;
}
