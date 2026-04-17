"use client";

import { useRef, useState } from "react";
import { Stage, Layer, Circle, Line, Group, RegularPolygon } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Drawing, DrawingTool, CircleDrawing, FreehandDrawing, PinDrawing } from "./types";

const DRAW_COLOR = "#ef4444";

interface Props {
  width: number;
  height: number;
  tool: DrawingTool;
  drawings: Drawing[];
  isEditable: boolean;
  onDrawingsChange: (drawings: Drawing[]) => void;
  stageRef: React.RefObject<any>;
}

export function DrawingLayer({ width, height, tool, drawings, isEditable, onDrawingsChange, stageRef }: Props) {
  const isDrawing = useRef(false);
  const [inProgress, setInProgress] = useState<Drawing | null>(null);

  function getPos(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    return pos ?? { x: 0, y: 0 };
  }

  function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
    if (!isEditable || tool === "select") return;
    const { x, y } = getPos(e);
    isDrawing.current = true;

    if (tool === "circle") {
      setInProgress({ type: "circle", x, y, r: 1, color: DRAW_COLOR });
    } else if (tool === "freehand") {
      setInProgress({ type: "freehand", points: [x, y], color: DRAW_COLOR });
    } else if (tool === "pin") {
      const pin: PinDrawing = { type: "pin", x, y, label: "", color: DRAW_COLOR };
      onDrawingsChange([...drawings, pin]);
      isDrawing.current = false;
    }
  }

  function handleMouseMove(e: KonvaEventObject<MouseEvent>) {
    if (!isDrawing.current || !inProgress) return;
    const { x, y } = getPos(e);

    if (inProgress.type === "circle") {
      const dx = x - inProgress.x;
      const dy = y - inProgress.y;
      setInProgress({ ...inProgress, r: Math.max(4, Math.sqrt(dx * dx + dy * dy)) });
    } else if (inProgress.type === "freehand") {
      setInProgress({ ...inProgress, points: [...inProgress.points, x, y] });
    }
  }

  function handleMouseUp() {
    if (!isDrawing.current || !inProgress) return;
    isDrawing.current = false;
    if (
      (inProgress.type === "circle" && inProgress.r > 4) ||
      (inProgress.type === "freehand" && inProgress.points.length > 4)
    ) {
      onDrawingsChange([...drawings, inProgress]);
    }
    setInProgress(null);
  }

  const allDrawings = inProgress ? [...drawings, inProgress] : drawings;
  const cursorStyle = tool === "pin" ? "crosshair" : "crosshair";

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, cursor: cursorStyle }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {allDrawings.map((d, i) => {
          if (d.type === "circle") {
            return (
              <Circle
                key={i}
                x={d.x}
                y={d.y}
                radius={d.r}
                stroke={d.color}
                strokeWidth={2}
                fill="transparent"
              />
            );
          }
          if (d.type === "freehand") {
            return (
              <Line
                key={i}
                points={d.points}
                stroke={d.color}
                strokeWidth={2}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
              />
            );
          }
          if (d.type === "pin") {
            return (
              <Group key={i} x={d.x} y={d.y}>
                <RegularPolygon sides={3} radius={7} fill={d.color} rotation={180} y={-7} />
                <Circle radius={4} fill={d.color} />
              </Group>
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}
