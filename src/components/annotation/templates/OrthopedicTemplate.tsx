"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ExtendedBodyPart } from "react-muscle-highlighter";
import type { Condition, TemplateComponentProps } from "../types";

const Body = dynamic(() => import("react-muscle-highlighter"), { ssr: false });

// ─── Part ID helpers ──────────────────────────────────────────────────────────
// Format: "slug" or "slug:left" / "slug:right"  (patient-perspective L/R)
// Convention: ":right" = patient's right.
//   Front view → patient's right is on SCREEN LEFT
//   Back view  → patient's right is on SCREEN RIGHT  (mirror)
//
// react-muscle-highlighter calls onBodyPartPress with SCREEN perspective
// ("left" = screen-left, "right" = screen-right).
// For the FRONT view, screen-left = patient's right, so we FLIP when:
//   - converting front-view clicks → stored patient-side IDs
//   - converting stored patient-side IDs → front Body highlight data
// The back view's screen already matches patient perspective, so no flip.

function toPartId(slug: string, side?: "left" | "right"): string {
  return side ? `${slug}:${side}` : slug;
}

function fromPartId(partId: string): { slug: string; side?: "left" | "right" } {
  const [slug, side] = partId.split(":");
  return { slug, side: side as "left" | "right" | undefined };
}

function flipSide(side?: "left" | "right"): "left" | "right" | undefined {
  if (side === "left") return "right";
  if (side === "right") return "left";
  return undefined;
}

// ─── Skeleton (Bones) View ────────────────────────────────────────────────────

interface SkeletonViewProps {
  selectedParts: Record<string, string[]>;
  onBoneClick: (partId: string) => void;
  isEditable: boolean;
  conditions: Condition[];
  gender: "male" | "female";
}

function SkeletonView({ selectedParts, onBoneClick, isEditable, conditions, gender }: SkeletonViewProps) {
  const isFemale = gender === "female";

  function condColor(partId: string): string | undefined {
    const ids = selectedParts[partId];
    if (!ids?.length) return undefined;
    return conditions.find(c => c.id === ids[0])?.color;
  }

  function stroke(id: string) { return condColor(id) ?? "#b0b0b0"; }
  function fill(id: string) {
    const c = condColor(id);
    return c ? c + "44" : "transparent";
  }
  function lw(id: string, base: number) {
    return condColor(id) ? base + 1 : base;
  }

  const cur = isEditable ? "pointer" : "default";

  function click(partId: string) {
    if (!isEditable) return;
    onBoneClick(partId);
  }

  // Female pelvis is wider and has a different shape
  const pelvisPath = isFemale
    ? "M 55 222 Q 33 214 36 232 Q 40 256 66 263 Q 100 270 134 263 Q 160 256 164 232 Q 167 214 145 222 Q 122 231 100 232 Q 78 231 55 222Z"
    : "M 62 220 Q 42 212 45 230 Q 48 250 70 258 Q 100 264 130 258 Q 152 250 155 230 Q 158 212 138 220 Q 118 228 100 229 Q 82 228 62 220Z";

  // Female hip joints are slightly wider apart
  const hipR = isFemale ? 80 : 83;
  const hipL = isFemale ? 120 : 117;

  return (
    <svg viewBox="0 0 200 450" width={170} height={382} role="img" aria-label="skeleton-front">

      {/* ── Skull ── */}
      <g onClick={() => click("skull")} style={{ cursor: cur }}>
        <ellipse cx="100" cy="27" rx="21" ry="24"
          fill={fill("skull")} stroke={stroke("skull")} strokeWidth={lw("skull", 2)} />
        <path d="M 82 44 Q 100 57 118 44"
          fill="transparent" stroke={stroke("skull")} strokeWidth={lw("skull", 1.5)} />
        <rect x="79" y="3" width="42" height="58" fill="transparent" />
      </g>

      {/* ── Cervical spine ── */}
      <g onClick={() => click("cervical-spine")} style={{ cursor: cur }}>
        {[0, 1, 2].map(i => (
          <rect key={i} x="94" y={53 + i * 9} width="12" height="7" rx="1.5"
            fill={fill("cervical-spine")} stroke={stroke("cervical-spine")} strokeWidth={lw("cervical-spine", 1.5)} />
        ))}
        <rect x="88" y="50" width="24" height="36" fill="transparent" />
      </g>

      {/* ── Thoracic + lumbar spine (inside ribcage) ── */}
      <g onClick={() => click("spine")} style={{ cursor: cur }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <rect key={i} x="94" y={82 + i * 13} width="12" height="10" rx="2"
            fill={fill("spine")} stroke={stroke("spine")} strokeWidth={lw("spine", 1.5)} />
        ))}
        <rect x="88" y="82" width="24" height="130" fill="transparent" />
      </g>

      {/* ── Ribcage ── */}
      <g onClick={() => click("ribcage")} style={{ cursor: cur }}>
        {/* Sternum */}
        <rect x="97" y="82" width="6" height="58" rx="2"
          fill={condColor("ribcage") ? fill("ribcage") : "#e8e8e8"}
          stroke={stroke("ribcage")} strokeWidth={lw("ribcage", 1.5)} />
        {/* Left ribs (patient's right = screen left) */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <path key={`rl${i}`}
            d={`M 97 ${90 + i * 10} Q ${66} ${87 + i * 10} ${58} ${100 + i * 10} Q ${57} ${108 + i * 10} ${66} ${116 + i * 10} Q 97 ${118 + i * 10} 97 ${118 + i * 10}`}
            fill="transparent" stroke={stroke("ribcage")} strokeWidth={lw("ribcage", 1) * 0.7} />
        ))}
        {/* Right ribs (patient's left = screen right) */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <path key={`rr${i}`}
            d={`M 103 ${90 + i * 10} Q ${134} ${87 + i * 10} ${142} ${100 + i * 10} Q ${143} ${108 + i * 10} ${134} ${116 + i * 10} Q 103 ${118 + i * 10} 103 ${118 + i * 10}`}
            fill="transparent" stroke={stroke("ribcage")} strokeWidth={lw("ribcage", 1) * 0.7} />
        ))}
        <rect x="52" y="78" width="96" height="88" fill="transparent" />
      </g>

      {/* ── Pelvis (shape changes by gender) ── */}
      <g onClick={() => click("pelvis")} style={{ cursor: cur }}>
        <path d={pelvisPath} fill={fill("pelvis")} stroke={stroke("pelvis")} strokeWidth={lw("pelvis", 2)} />
        <rect x="33" y="210" width="134" height="65" fill="transparent" />
      </g>

      {/* ── Clavicles ── */}
      {/* clavicle:right = patient's right = screen LEFT */}
      <g onClick={() => click("clavicle:right")} style={{ cursor: cur }}>
        <line x1="94" y1="84" x2="50" y2="97"
          stroke={stroke("clavicle:right")} strokeWidth={lw("clavicle:right", 2.5)} strokeLinecap="round" />
        <circle cx="46" cy="99" r="5"
          fill={fill("clavicle:right")} stroke={stroke("clavicle:right")} strokeWidth={lw("clavicle:right", 1.5)} />
        <line x1="94" y1="84" x2="46" y2="99" stroke="transparent" strokeWidth="14" />
      </g>
      {/* clavicle:left = patient's left = screen RIGHT */}
      <g onClick={() => click("clavicle:left")} style={{ cursor: cur }}>
        <line x1="106" y1="84" x2="150" y2="97"
          stroke={stroke("clavicle:left")} strokeWidth={lw("clavicle:left", 2.5)} strokeLinecap="round" />
        <circle cx="154" cy="99" r="5"
          fill={fill("clavicle:left")} stroke={stroke("clavicle:left")} strokeWidth={lw("clavicle:left", 1.5)} />
        <line x1="106" y1="84" x2="154" y2="99" stroke="transparent" strokeWidth="14" />
      </g>

      {/* ── Humerus R (patient's right = screen LEFT) ── */}
      <g onClick={() => click("humerus:right")} style={{ cursor: cur }}>
        <line x1="43" y1="103" x2="27" y2="163"
          stroke={stroke("humerus:right")} strokeWidth={lw("humerus:right", 5)} strokeLinecap="round" />
        <line x1="43" y1="103" x2="27" y2="163" stroke="transparent" strokeWidth="16" />
        <circle cx="25" cy="166" r="5"
          fill={fill("humerus:right")} stroke={stroke("humerus:right")} strokeWidth={lw("humerus:right", 1.5)} />
      </g>

      {/* ── Humerus L (patient's left = screen RIGHT) ── */}
      <g onClick={() => click("humerus:left")} style={{ cursor: cur }}>
        <line x1="157" y1="103" x2="173" y2="163"
          stroke={stroke("humerus:left")} strokeWidth={lw("humerus:left", 5)} strokeLinecap="round" />
        <line x1="157" y1="103" x2="173" y2="163" stroke="transparent" strokeWidth="16" />
        <circle cx="175" cy="166" r="5"
          fill={fill("humerus:left")} stroke={stroke("humerus:left")} strokeWidth={lw("humerus:left", 1.5)} />
      </g>

      {/* ── Forearm R (screen left) ── */}
      <g onClick={() => click("forearm:right")} style={{ cursor: cur }}>
        <line x1="25" y1="171" x2="16" y2="215"
          stroke={stroke("forearm:right")} strokeWidth={lw("forearm:right", 4)} strokeLinecap="round" />
        <line x1="29" y1="171" x2="21" y2="213"
          stroke={stroke("forearm:right")} strokeWidth={lw("forearm:right", 2.5)} strokeLinecap="round" />
        <line x1="22" y1="169" x2="13" y2="217" stroke="transparent" strokeWidth="14" />
      </g>

      {/* ── Forearm L (screen right) ── */}
      <g onClick={() => click("forearm:left")} style={{ cursor: cur }}>
        <line x1="175" y1="171" x2="184" y2="215"
          stroke={stroke("forearm:left")} strokeWidth={lw("forearm:left", 4)} strokeLinecap="round" />
        <line x1="171" y1="171" x2="179" y2="213"
          stroke={stroke("forearm:left")} strokeWidth={lw("forearm:left", 2.5)} strokeLinecap="round" />
        <line x1="178" y1="169" x2="187" y2="217" stroke="transparent" strokeWidth="14" />
      </g>

      {/* ── Hand bones R (screen left) ── */}
      <g onClick={() => click("hand-bones:right")} style={{ cursor: cur }}>
        <ellipse cx="13" cy="226" rx="9" ry="13"
          fill={fill("hand-bones:right")} stroke={stroke("hand-bones:right")} strokeWidth={lw("hand-bones:right", 1.5)} />
        <rect x="4" y="213" width="18" height="27" fill="transparent" />
      </g>

      {/* ── Hand bones L (screen right) ── */}
      <g onClick={() => click("hand-bones:left")} style={{ cursor: cur }}>
        <ellipse cx="187" cy="226" rx="9" ry="13"
          fill={fill("hand-bones:left")} stroke={stroke("hand-bones:left")} strokeWidth={lw("hand-bones:left", 1.5)} />
        <rect x="178" y="213" width="18" height="27" fill="transparent" />
      </g>

      {/* ── Femur R (patient's right = screen LEFT) ── */}
      <g onClick={() => click("femur:right")} style={{ cursor: cur }}>
        <circle cx={hipR} cy={isFemale ? 272 : 270} r="7"
          fill={fill("femur:right")} stroke={stroke("femur:right")} strokeWidth={lw("femur:right", 1.5)} />
        <line x1={hipR} y1={isFemale ? 279 : 277} x2="72" y2="362"
          stroke={stroke("femur:right")} strokeWidth={lw("femur:right", 6)} strokeLinecap="round" />
        <line x1={hipR} y1={isFemale ? 279 : 277} x2="72" y2="362" stroke="transparent" strokeWidth="18" />
      </g>

      {/* ── Femur L (patient's left = screen RIGHT) ── */}
      <g onClick={() => click("femur:left")} style={{ cursor: cur }}>
        <circle cx={hipL} cy={isFemale ? 272 : 270} r="7"
          fill={fill("femur:left")} stroke={stroke("femur:left")} strokeWidth={lw("femur:left", 1.5)} />
        <line x1={hipL} y1={isFemale ? 279 : 277} x2="128" y2="362"
          stroke={stroke("femur:left")} strokeWidth={lw("femur:left", 6)} strokeLinecap="round" />
        <line x1={hipL} y1={isFemale ? 279 : 277} x2="128" y2="362" stroke="transparent" strokeWidth="18" />
      </g>

      {/* ── Tibia R (screen left) ── */}
      <g onClick={() => click("tibia:right")} style={{ cursor: cur }}>
        <circle cx="71" cy="365" r="6"
          fill={fill("tibia:right")} stroke={stroke("tibia:right")} strokeWidth={lw("tibia:right", 1.5)} />
        <line x1="70" y1="371" x2="64" y2="424"
          stroke={stroke("tibia:right")} strokeWidth={lw("tibia:right", 4)} strokeLinecap="round" />
        <line x1="75" y1="371" x2="70" y2="424"
          stroke={stroke("tibia:right")} strokeWidth={lw("tibia:right", 2.5)} strokeLinecap="round" />
        <line x1="67" y1="369" x2="60" y2="426" stroke="transparent" strokeWidth="14" />
      </g>

      {/* ── Tibia L (screen right) ── */}
      <g onClick={() => click("tibia:left")} style={{ cursor: cur }}>
        <circle cx="129" cy="365" r="6"
          fill={fill("tibia:left")} stroke={stroke("tibia:left")} strokeWidth={lw("tibia:left", 1.5)} />
        <line x1="130" y1="371" x2="136" y2="424"
          stroke={stroke("tibia:left")} strokeWidth={lw("tibia:left", 4)} strokeLinecap="round" />
        <line x1="125" y1="371" x2="130" y2="424"
          stroke={stroke("tibia:left")} strokeWidth={lw("tibia:left", 2.5)} strokeLinecap="round" />
        <line x1="133" y1="369" x2="140" y2="426" stroke="transparent" strokeWidth="14" />
      </g>

      {/* ── Foot R (screen left) ── */}
      <g onClick={() => click("foot-bones:right")} style={{ cursor: cur }}>
        <ellipse cx="60" cy="434" rx="15" ry="7"
          fill={fill("foot-bones:right")} stroke={stroke("foot-bones:right")} strokeWidth={lw("foot-bones:right", 1.5)} />
        <rect x="45" y="427" width="30" height="14" fill="transparent" />
      </g>

      {/* ── Foot L (screen right) ── */}
      <g onClick={() => click("foot-bones:left")} style={{ cursor: cur }}>
        <ellipse cx="140" cy="434" rx="15" ry="7"
          fill={fill("foot-bones:left")} stroke={stroke("foot-bones:left")} strokeWidth={lw("foot-bones:left", 1.5)} />
        <rect x="125" y="427" width="30" height="14" fill="transparent" />
      </g>
    </svg>
  );
}

// ─── Main Template ────────────────────────────────────────────────────────────

export function OrthopedicTemplate({ selectedParts, onPartClick, isEditable, conditions, isEnlarged }: TemplateComponentProps) {
  const [gender, setGender] = useState<"male" | "female">("male");

  const scale = isEnlarged ? 1.3 : 0.9;

  // Build highlighted array for the muscle Body component.
  // Stored IDs use PATIENT perspective (":right" = patient's right).
  // The library uses SCREEN perspective.
  // Front view: patient's right = screen LEFT  → flip sides for front Body.
  // Back view:  patient's right = screen RIGHT → no flip needed.
  //
  // KEY: when both ":left" and ":right" of the same slug are selected,
  // pass the slug WITHOUT a side so the library colours BOTH sides.
  function buildHighlighted(flipForFront: boolean): ExtendedBodyPart[] {
    // Group by slug to detect bilateral selection
    const slugMap = new Map<string, { color: string; sides: Set<"left" | "right" | undefined> }>();

    for (const [partId, conditionIds] of Object.entries(selectedParts)) {
      if (!conditionIds.length) continue;
      const firstCondition = conditions.find(c => c.id === conditionIds[0]);
      const { slug, side } = fromPartId(partId);
      const color = firstCondition?.color ?? "#ef4444";
      const existing = slugMap.get(slug);
      if (existing) {
        existing.sides.add(side);
      } else {
        slugMap.set(slug, { color, sides: new Set([side]) });
      }
    }

    return Array.from(slugMap.entries()).map(([slug, { color, sides }]) => {
      const bothSides = sides.has("left") && sides.has("right");
      if (bothSides) {
        // No side → library colours every path for this slug on both sides
        return { slug: slug as ExtendedBodyPart["slug"], color };
      }
      const side = [...sides][0] as "left" | "right" | undefined;
      const displaySide = flipForFront ? flipSide(side) : side;
      return {
        slug: slug as ExtendedBodyPart["slug"],
        color,
        ...(displaySide ? { side: displaySide } : {}),
      };
    });
  }

  // Front view click: library screen-side → flip → patient-side
  function handlePressFront(part: ExtendedBodyPart, side?: "left" | "right") {
    if (!isEditable || !part.slug) return;
    onPartClick(toPartId(part.slug, flipSide(side)));
  }

  // Back view click: library screen-side = patient-side → no flip
  function handlePressBack(part: ExtendedBodyPart, side?: "left" | "right") {
    if (!isEditable || !part.slug) return;
    onPartClick(toPartId(part.slug, side));
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">

      {/* ── Gender dropdown ── */}
      <div className="flex items-center gap-2 self-start">
        <span className="text-[10px] text-text-muted uppercase tracking-wide font-medium">Body</span>
        <select
          value={gender}
          onChange={e => setGender(e.target.value as "male" | "female")}
          className="text-xs px-2.5 py-1 rounded-lg border border-border-subtle bg-surface-1 text-text-primary outline-none focus:ring-2 focus:ring-accent/15"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* ── Muscles (Front + Back) ── */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 self-start">
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Muscles</span>
          <span className="text-[9px] text-text-muted">{gender === "female" ? "— female body" : "— male body"}</span>
        </div>
        <div className="flex gap-4 justify-center w-full items-start">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Front</span>
            <Body
              data={buildHighlighted(true)}
              side="front"
              gender={gender}
              onBodyPartPress={handlePressFront}
              scale={scale}
              border={gender === "female" ? "#9ca3af" : "#d1d5db"}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Back</span>
            <Body
              data={buildHighlighted(false)}
              side="back"
              gender={gender}
              onBodyPartPress={handlePressBack}
              scale={scale}
              border={gender === "female" ? "#9ca3af" : "#d1d5db"}
            />
          </div>
        </div>
      </div>

      {/* ── Bones (Front only) ── */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 self-start">
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Bones</span>
          <span className="text-[9px] text-text-muted">
            {gender === "female" ? "— wider pelvis" : "— skeletal view"}
          </span>
        </div>
        <SkeletonView
          selectedParts={selectedParts}
          onBoneClick={onPartClick}
          isEditable={isEditable}
          conditions={conditions}
          gender={gender}
        />
      </div>

      {/* ── Condition legend ── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {conditions.map(c => (
          <span key={c.id} className="flex items-center gap-1 text-[10px] text-text-secondary">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
