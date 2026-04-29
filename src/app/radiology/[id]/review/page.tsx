"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = ["Pan", "Zoom", "Win/Lvl", "Measure", "Annotate", "Compare"];

export default function RadioReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState("Zoom");
  const [signed, setSigned] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Radiology", id, "Review"]} />
      <main className="flex-1 overflow-hidden px-4 py-4">
        <div className="grid h-full gap-3" style={{ gridTemplateColumns: "120px 1fr 380px" }}>
          {/* Prior studies panel */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-2.5 overflow-hidden flex flex-col">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2.5">Priors</div>
            {["25-Apr", "12-Mar", "08-Feb", "24-Nov"].map((date, i) => (
              <div key={i} className={cn("w-full h-20 rounded-lg mb-2 relative overflow-hidden", i === 0 && "ring-2 ring-accent")}
                style={{ background: "#0a0a0a" }}>
                <svg width="100%" height="100%" viewBox="0 0 100 80" style={{ opacity: 0.7 }}>
                  <ellipse cx="50" cy="45" rx="32" ry="24" fill="#1f2937"/>
                  <ellipse cx="38" cy="47" rx="14" ry="18" fill="#0f1825"/>
                  <ellipse cx="62" cy="47" rx="14" ry="18" fill="#0f1825"/>
                </svg>
                <div className="absolute bottom-1 left-1 text-[8px] text-slate-400 font-mono">{date}</div>
              </div>
            ))}
          </div>

          {/* Viewer */}
          <div className="bg-black rounded-xl overflow-hidden relative flex flex-col border border-slate-800">
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-black/60 border-b border-slate-800">
              {TOOLS.map(tool => (
                <button key={tool} onClick={() => setActiveTool(tool)}
                  className={cn("px-2.5 py-1 rounded text-[11px] font-medium border transition-colors",
                    tool === activeTool ? "bg-blue-500 text-white border-blue-500" : "text-slate-400 border-slate-700 hover:border-slate-500"
                  )}>
                  {tool}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-[11px] text-slate-400 font-mono">W: 350 / L: 50 · 1.4×</span>
            </div>

            {/* Image */}
            <div className="flex-1 relative flex items-center justify-center" style={{ background: "#000" }}>
              <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="300" cy="250" rx="180" ry="190" fill="#1a2332"/>
                <ellipse cx="240" cy="260" rx="80" ry="150" fill="#0a1018"/>
                <ellipse cx="360" cy="260" rx="80" ry="150" fill="#0a1018"/>
                <line x1="300" y1="110" x2="300" y2="430" stroke="#4b5563" strokeWidth="2.5"/>
                <ellipse cx="320" cy="270" rx="40" ry="75" fill="#374151" opacity="0.5"/>
                <circle cx="240" cy="200" r="38" fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4,3"/>
                <text x="285" y="183" fill="#FBBF24" fontSize="10" fontFamily="monospace">opacity 4cm</text>
                <text x="20" y="22" fill="#94a3b8" fontSize="10" fontFamily="monospace">ROHAN MEHTA · M 52 · UHID-2026-0501</text>
                <text x="20" y="36" fill="#94a3b8" fontSize="10" fontFamily="monospace">ECHOCARDIOGRAM · 24-APR-2026 · 16:42</text>
                <text x="20" y="484" fill="#94a3b8" fontSize="10" fontFamily="monospace">Ashwini HMS · Tilak Nagar</text>
                <text x="490" y="484" fill="#94a3b8" fontSize="10" fontFamily="monospace">L</text>
                <text x="85" y="484" fill="#94a3b8" fontSize="10" fontFamily="monospace">R</text>
              </svg>
            </div>
          </div>

          {/* Findings panel */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3.5 border-b border-border-subtle">
              <div className="text-[14px] font-semibold">Echocardiogram report</div>
              <div className="text-[11px] text-text-muted mt-0.5">Rohan Mehta · 24-Apr-2026</div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">Findings</div>
                <div className="p-2.5 bg-surface-2 rounded-lg text-[12px] leading-relaxed text-text-secondary">
                  LV: dilated, severe systolic dysfunction. EF 32%. Regional wall motion abnormality in LAD territory. RV: normal size &amp; function. Valves: mild MR, trivial TR. No pericardial effusion. IVC: normal.
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">Impression</div>
                <div className="p-2.5 bg-danger-soft border border-danger/20 rounded-lg text-[12px] leading-relaxed">
                  <span className="text-danger font-bold">1.</span> Severe LV systolic dysfunction · EF 32%<br/>
                  <span className="text-danger font-bold">2.</span> Regional wall motion abnormality (LAD) — old infarct<br/>
                  <span className="text-danger font-bold">3.</span> Mild functional mitral regurgitation
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">Recommendation</div>
                <textarea defaultValue="Optimize HF therapy. Cardiology follow-up. Consider CRT-D evaluation."
                  className="w-full p-2.5 bg-surface-2 border border-border-subtle rounded-lg text-[12px] leading-relaxed text-text-secondary resize-none h-20 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
              </div>
            </div>
            <div className="px-3 py-3 border-t border-border-subtle flex gap-2">
              <button className="px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">Save draft</button>
              <button
                onClick={() => { setSigned(true); setTimeout(() => router.push("/radiology/queue"), 1200); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent-hover"
              >
                {signed ? <Check size={14} /> : null}
                {signed ? "Signed!" : "Sign & release →"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
