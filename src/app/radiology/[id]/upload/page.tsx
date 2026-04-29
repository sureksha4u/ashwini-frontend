"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Upload, Image, Check } from "lucide-react";

export default function RadioUploadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState(72);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Radiology", id, "Upload"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid gap-4 h-full" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          {/* Left — upload form */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl p-5 flex flex-col gap-4">
            <div>
              <div className="text-[11px] font-mono text-text-muted mb-1">{id} · CHEST X-RAY PA</div>
              <h2 className="text-[20px] font-semibold">Upload images</h2>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2">
              <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-semibold text-[13px]">MT</div>
              <div className="flex-1">
                <div className="font-semibold">Mansi Tiwari</div>
                <div className="text-[12px] text-text-muted">F · 34y · UHID-2026-0481 · Dr. Tiwari</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">URGENT</span>
            </div>

            {/* Drop zone */}
            <div className="h-[280px] rounded-xl border-2 border-dashed border-accent bg-accent-soft/30 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Upload size={36} className="text-accent" />
              <div className="text-[16px] font-semibold">Drag DICOM / JPEG files here</div>
              <div className="text-[12px] text-text-secondary">or <span className="text-accent font-semibold cursor-pointer">browse</span> · max 50 MB per file</div>
              <div className="text-[11px] font-mono text-text-muted">Files upload via presigned URL → object storage</div>
            </div>

            {/* Upload progress */}
            <div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <Image size={18} className="text-accent" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">chest_PA_001.dcm</div>
                  <div className="text-[11px] text-text-muted font-mono">14.2 MB · DICOM · uploading…</div>
                </div>
                <span className="text-[12px] text-accent font-mono font-semibold">{progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-surface-2 mt-2 overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Right — capture details + preview */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="text-[13px] font-semibold mb-3">Capture details</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ["Modality", "DR · digital radiography"],
                  ["Tube", "Room 1"],
                  ["kVp", "120"],
                  ["mAs", "64"],
                  ["Position", "PA + Lateral"],
                  ["Technologist", "A. Iyer"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <label className="text-[11px] font-semibold text-text-muted mb-1 block uppercase tracking-wide">{label}</label>
                    <input defaultValue={val} className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-border-subtle text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="text-[13px] font-semibold mb-3">Image preview</div>
              <div className="h-48 rounded-lg overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0a0a, #1f1f1f)" }}>
                <svg width="100%" height="100%" viewBox="0 0 360 200" style={{ opacity: 0.85 }}>
                  <ellipse cx="180" cy="110" rx="120" ry="80" fill="#1f2937"/>
                  <ellipse cx="140" cy="115" rx="48" ry="68" fill="#0f1825"/>
                  <ellipse cx="220" cy="115" rx="48" ry="68" fill="#0f1825"/>
                  <line x1="180" y1="40" x2="180" y2="190" stroke="#4b5563" strokeWidth="2"/>
                  <text x="12" y="20" fill="#94a3b8" fontSize="9" fontFamily="monospace">MANSI TIWARI · F 34</text>
                  <text x="12" y="194" fill="#94a3b8" fontSize="9" fontFamily="monospace">25-APR-2026 · CXR-PA</text>
                </svg>
              </div>
            </div>

            <button
              onClick={() => { setProgress(100); setTimeout(() => { setSubmitted(true); setTimeout(() => router.push("/radiology/queue"), 1500); }, 500); }}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors"
            >
              {submitted ? <Check size={16} /> : <Upload size={15} />}
              {submitted ? "Submitted!" : "Submit for radiologist review"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
