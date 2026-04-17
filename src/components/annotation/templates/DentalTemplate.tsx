"use client";

// Wraps react-odontogram — MIT licensed dental chart.
// API: onChange(selected: ToothDetail[]) fires on tooth click;
//      teethConditions groups teeth by condition with fill/outline colors.

import dynamic from "next/dynamic";
import type { ToothDetail, ToothConditionGroup } from "react-odontogram";
import type { TemplateComponentProps } from "../types";

const Odontogram = dynamic(() => import("react-odontogram"), { ssr: false });

export function DentalTemplate({ selectedParts, onPartClick, isEditable, conditions }: TemplateComponentProps) {
  // Build teethConditions: group teeth by their first assigned condition
  const teethConditions: ToothConditionGroup[] = conditions
    .map((c) => {
      const teeth = Object.entries(selectedParts)
        .filter(([, cids]) => cids.includes(c.id))
        .map(([toothId]) => toothId);
      return teeth.length > 0
        ? { label: c.label, teeth, fillColor: c.color + "55", outlineColor: c.color }
        : null;
    })
    .filter(Boolean) as ToothConditionGroup[];

  function handleChange(selected: ToothDetail[]) {
    if (!isEditable || selected.length === 0) return;
    // Fire for the last interacted tooth (react-odontogram manages multi-select internally)
    const last = selected[selected.length - 1];
    onPartClick(last.notations.universal);
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <Odontogram
        onChange={handleChange}
        teethConditions={teethConditions}
        readOnly={!isEditable}
        showLabels
        styles={{ width: "100%", maxWidth: 480 }}
      />

      {/* Condition legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {conditions.map((c) => (
          <span key={c.id} className="flex items-center gap-1 text-[10px] text-gray-500">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
