"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingLayer } from "./DrawingLayer";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { getTemplate } from "./templates/registry";
import type { AnnotationState, Condition, Drawing, DrawingTool } from "./types";

// ─── Condition panel ─────────────────────────────────────────────────────────
// Single-select: clicking a condition selects it and closes the panel.
// Clicking the already-selected condition deselects (removes) the part.

interface ConditionPanelProps {
  partId: string;
  conditions: Condition[];
  selected: string[];
  onSelect: (conditionId: string) => void;
}

function ConditionPanel({ partId, conditions, selected, onSelect }: ConditionPanelProps) {
  return (
    <div className="flex items-center gap-3 bg-surface-2 border border-border-subtle rounded-xl p-3">
      <div className="flex-1">
        <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium mb-2">
          {partId} — mark condition
        </p>
        <div className="flex flex-wrap gap-1.5">
          {conditions.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors"
              style={{
                background: selected.includes(c.id) ? c.color + "22" : "transparent",
                borderColor: selected.includes(c.id) ? c.color : "#e5e7eb",
                color: selected.includes(c.id) ? c.color : "#6b7280",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: selected.includes(c.id) ? c.color : "#d1d5db" }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  specialty: string | null | undefined;
  initialState?: AnnotationState | null;
  isEditable: boolean;
  isEnlarged?: boolean;
  onChange?: (state: AnnotationState) => void;
  canvasRef?: React.RefObject<AnnotationCanvasHandle | null>;
}

export interface AnnotationCanvasHandle {
  captureSnapshot: () => Promise<string | null>;
  getState: () => AnnotationState;
}

export function AnnotationCanvas({ specialty, initialState, isEditable, isEnlarged, onChange, canvasRef }: Props) {
  const template = getTemplate(specialty);

  const [selectedParts, setSelectedParts] = useState<Record<string, string[]>>(
    initialState?.selectedParts ?? {}
  );
  const [drawings, setDrawings] = useState<Drawing[]>(initialState?.drawings ?? []);
  const [notes, setNotes] = useState(initialState?.notes ?? "");

  // Re-hydrate state when a saved annotation loads asynchronously
  useEffect(() => {
    if (!initialState) return;
    setSelectedParts(initialState.selectedParts ?? {});
    setDrawings(initialState.drawings ?? []);
    setNotes(initialState.notes ?? "");
  }, [initialState]);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [pickerPartId, setPickerPartId] = useState<string | null>(null);

  // Track container dimensions properly via ResizeObserver
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 480, height: 380 });
  const stageRef = useRef<any>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Expose handle to parent
  if (canvasRef) {
    (canvasRef as React.RefObject<AnnotationCanvasHandle>).current = {
      captureSnapshot: async () => {
        if (!containerRef.current) return null;
        const { default: html2canvas } = await import("html2canvas");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canvas = await html2canvas(containerRef.current, { useCORS: true } as any);
        return canvas.toDataURL("image/png");
      },
      getState: () => ({ templateId: template?.id ?? "", selectedParts, drawings, notes }),
    };
  }

  const notify = useCallback(
    (parts: Record<string, string[]>, drws: Drawing[], nts: string) => {
      onChange?.({ templateId: template?.id ?? "", selectedParts: parts, drawings: drws, notes: nts });
    },
    [onChange, template]
  );

  function handlePartClick(partId: string) {
    if (!isEditable || activeTool !== "select") return;

    const alreadyMarked = selectedParts[partId]?.length > 0;

    if (alreadyMarked) {
      // Part already has a condition — open picker to change it
      setPickerPartId((prev) => (prev === partId ? null : partId));
    } else {
      // No condition yet — immediately mark with the first condition for instant feedback
      const firstCondition = template?.conditions[0];
      if (!firstCondition) return;
      const next = { ...selectedParts, [partId]: [firstCondition.id] };
      setSelectedParts(next);
      notify(next, drawings, notes);
      // Also open the picker so the doctor can change to a different condition
      setPickerPartId(partId);
    }
  }

  // Single-select: replace existing condition with chosen one.
  // Clicking the already-selected condition removes the part entirely.
  function handleConditionSelect(conditionId: string) {
    if (!pickerPartId) return;
    const existing = selectedParts[pickerPartId] ?? [];
    let next: Record<string, string[]>;
    if (existing.includes(conditionId)) {
      // Already selected → deselect (remove the part)
      next = { ...selectedParts };
      delete next[pickerPartId];
    } else {
      // Replace with the new single condition
      next = { ...selectedParts, [pickerPartId]: [conditionId] };
    }
    setSelectedParts(next);
    notify(next, drawings, notes);
    setPickerPartId(null); // auto-close after selection
  }

  function handleDrawingsChange(next: Drawing[]) {
    setDrawings(next);
    notify(selectedParts, next, notes);
  }

  function handleNotesChange(value: string) {
    setNotes(value);
    notify(selectedParts, drawings, value);
  }

  function handleClear() {
    setDrawings([]);
    setSelectedParts({});
    setPickerPartId(null);
    notify({}, [], notes);
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted">
        <p className="text-xs">No diagram available for this specialty</p>
      </div>
    );
  }

  const { Component, conditions } = template;

  return (
    <div className="flex flex-col gap-2">
      {/* Header row: template label + drawing toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-primary">{template.label}</span>
        {isEditable ? (
          <AnnotationToolbar
            activeTool={activeTool}
            onToolChange={(t) => { setActiveTool(t); setPickerPartId(null); }}
            onClear={handleClear}
            isEditable={isEditable}
          />
        ) : (
          <span className="text-[10px] text-text-muted">Start a consultation to annotate</span>
        )}
      </div>

      {/* Canvas container — no overflow-hidden so drawing layer isn't clipped */}
      <div
        ref={containerRef}
        className="relative bg-surface-1 border border-border-subtle rounded-xl"
        style={{ minHeight: 340 }}
      >
        {/* Base diagram */}
        <div className="p-3">
          <Component
            selectedParts={selectedParts}
            onPartClick={handlePartClick}
            isEditable={isEditable}
            conditions={conditions}
            isEnlarged={isEnlarged}
          />
        </div>

        {/* Drawing layer — only active for draw tools, sits above diagram */}
        {activeTool !== "select" && (
          <DrawingLayer
            width={containerSize.width}
            height={containerSize.height}
            tool={activeTool}
            drawings={drawings}
            isEditable={isEditable}
            onDrawingsChange={handleDrawingsChange}
            stageRef={stageRef}
          />
        )}
      </div>

      {/* Condition panel — rendered OUTSIDE the canvas so it's never clipped */}
      {pickerPartId && isEditable && (
        <ConditionPanel
          partId={pickerPartId}
          conditions={conditions}
          selected={selectedParts[pickerPartId] ?? []}
          onSelect={handleConditionSelect}
        />
      )}

      {/* Annotation notes */}
      <textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        disabled={!isEditable}
        placeholder="Add annotation notes (e.g. patient-reported symptoms, clinical observations)..."
        rows={2}
        className="w-full text-xs text-text-primary bg-surface-1 border border-border-subtle rounded-lg px-3 py-2 outline-none resize-none placeholder:text-text-muted dark:placeholder-gray-600 focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
      />
    </div>
  );
}
