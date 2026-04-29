"use client";

import { useParams, useRouter } from "next/navigation";
import { Receipt, Download, Send, X } from "lucide-react";

const RX_LINES = [
  { num: "1.", drug: "Tab. Montelukast 10 mg", sig: "1 tab · HS · 14 days" },
  { num: "2.", drug: "Tab. Telmisartan 40 mg", sig: "1 tab · OD morning · continue" },
  { num: "3.", drug: "Asthalin Inhaler 100 mcg", sig: "2 puffs · PRN" },
];

export default function PdfPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px) saturate(0.85)" }}>
      <div className="w-[920px] h-[780px] rounded-[14px] bg-surface-1 border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border-subtle">
          <Receipt size={16} className="text-accent" />
          <span className="text-[14px] font-semibold">Prescription preview · A4</span>
          <span className="text-[11px] text-text-muted font-mono">Rx-2026-04-25-0481</span>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2">
            <Download size={13} /> Download
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-secondary hover:bg-surface-2">
            <Send size={13} /> SMS to patient
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent-hover">
            Finalize &amp; dispense
          </button>
          <button onClick={() => router.back()} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {/* Paper preview */}
        <div className="flex-1 overflow-hidden bg-surface-2 flex items-center justify-center p-7">
          <div className="w-[600px] h-full bg-white text-[#0F172A] shadow-2xl p-9 flex flex-col overflow-hidden"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            {/* Hospital header */}
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "2px solid #2563EB" }}>
              <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background: "linear-gradient(135deg,#2563EB,#1E40AF)" }} />
              <div>
                <div className="font-semibold" style={{ fontSize: 16, color: "#0F172A" }}>Ashwini HMS — Tilak Nagar</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>D-22 Tilak Nagar Main Rd · New Delhi 110018 · +91 11 4108 4108</div>
              </div>
              <div className="flex-1" />
              <div style={{ fontSize: 11, color: "#64748B", textAlign: "right", fontFamily: "monospace" }}>
                Rx-2026-04-25-0481<br />25-Apr-2026 12:48
              </div>
            </div>

            {/* Patient + doctor */}
            <div className="grid grid-cols-2 gap-4 py-4" style={{ borderBottom: "1px solid #E2E8F0", fontSize: 11 }}>
              <div>
                <b>Patient</b><br />
                Mansi Tiwari · F · 34y · O+<br />
                <span style={{ fontFamily: "monospace" }}>UHID-2026-0481</span><br />
                +91 98765 43210
              </div>
              <div>
                <b>Consulting Doctor</b><br />
                Dr. Mansi Tiwari, MD (Cardiology)<br />
                DMC Reg <span style={{ fontFamily: "monospace" }}>DMC/R/12482</span><br />
                OPD-2 Cardiology
              </div>
            </div>

            {/* Rx lines */}
            <div className="pt-4" style={{ fontSize: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", letterSpacing: "0.04em", marginBottom: 8 }}>℞</div>
              {RX_LINES.map(r => (
                <div key={r.num} className="grid py-2" style={{ gridTemplateColumns: "24px 1fr 200px", borderBottom: "1px dashed #E2E8F0" }}>
                  <span style={{ fontFamily: "monospace", color: "#64748B" }}>{r.num}</span>
                  <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.drug}</span>
                  <span style={{ color: "#475569" }}>{r.sig}</span>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-lg" style={{ background: "#F1F5F9", fontSize: 11, lineHeight: 1.6 }}>
                <b>Advice:</b> Avoid known triggers. Spirometry on 02-May-2026 at 10:00. Review in 2 weeks.
              </div>
            </div>

            <div className="flex-1" />

            {/* Footer: QR + signature */}
            <div className="flex items-end justify-between pt-4">
              <div className="grid p-1.5 rounded border border-[#CBD5E1]"
                style={{ gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)", gap: 1, width: 72, height: 72 }}>
                {Array.from({ length: 64 }).map((_, k) => (
                  <div key={k} style={{ background: k % 3 === 0 || k % 7 === 0 ? "#0F172A" : "transparent" }} />
                ))}
              </div>
              <div className="text-center" style={{ fontSize: 11 }}>
                <div style={{ borderTop: "1px solid #CBD5E1", width: 180, paddingTop: 4, color: "#0F172A", fontWeight: 600 }}>
                  Dr. Mansi Tiwari
                </div>
                <div style={{ color: "#64748B" }}>Digital signature · verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
