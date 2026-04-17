"use client";

import { Circle, Minus, MousePointer, Pin } from "lucide-react";
import type { DrawingTool } from "./types";

interface Props {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClear: () => void;
  isEditable: boolean;
}

const TOOLS: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { id: "select",   icon: <MousePointer className="w-3.5 h-3.5" />, label: "Select" },
  { id: "circle",   icon: <Circle className="w-3.5 h-3.5" />,       label: "Circle" },
  { id: "freehand", icon: <Minus className="w-3.5 h-3.5 rotate-45" />, label: "Draw" },
  { id: "pin",      icon: <Pin className="w-3.5 h-3.5" />,           label: "Pin" },
];

export function AnnotationToolbar({ activeTool, onToolChange, onClear, isEditable }: Props) {
  if (!isEditable) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-navy-dark border border-gray-200 dark:border-border-dark rounded-lg">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          className={[
            "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
            activeTool === tool.id
              ? "bg-white dark:bg-surface-dark shadow-sm text-primary border border-gray-200 dark:border-border-dark"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
          ].join(" ")}
        >
          {tool.icon}
          <span className="hidden sm:inline">{tool.label}</span>
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200 dark:bg-border-dark mx-1" />

      <button
        onClick={onClear}
        className="px-2 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
