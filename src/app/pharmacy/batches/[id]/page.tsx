"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSACTIONS = [
  ["25-Apr 14:22", "Dispense", "Mansi Tiwari · UHID-2026-0481", "−6", "Rohan Mehta"],
  ["25-Apr 13:05", "Dispense", "Aarav Khanna · UHID-2026-0512", "−10", "Rohan Mehta"],
  ["25-Apr 11:48", "Dispense", "Sunita Patel · UHID-2025-9921", "−14", "Rohan Mehta"],
  ["24-Apr 17:10", "Adjust", "Stock-take correction", "−2", "Pharm Lead"],
  ["24-Apr 09:30", "Dispense", "Krishna M · UHID-2026-0488", "−4", "Rohan Mehta"],
  ["18-Apr 15:00", "Receive", "PO #PO-2026-0418", "+500", "Inventory"],
  ["12-Apr 10:00", "Dispense", "Devika Rao · UHID-2026-0398", "−8", "Rohan Mehta"],
  ["08-Aug 09:00", "Stock in", "Initial receipt", "+2,000", "Inventory"],
];

const TX_COLOR: Record<string, string> = {
  Receive: "bg-success-soft text-success", "Stock in": "bg-success-soft text-success",
  Adjust: "bg-warning-soft text-warning", Dispense: "bg-info-soft text-info",
};

export default function PharmacyBatchDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Pharmacy", "Batches", id]} />
      <main className="flex-1 overflow-hidden px-6 py-6">
        <div className="flex gap-4 h-full">
          {/* Batch info card */}
          <div className="w-[360px] flex-shrink-0 bg-surface-1 border border-border-subtle rounded-xl p-5 flex flex-col gap-3">
            <div className="text-[11px] font-mono text-text-muted">BATCH</div>
            <div className="text-[22px] font-semibold font-mono">{id}</div>
            <div>
              <div className="text-[13px] font-semibold">Crocin Advance 500mg</div>
              <div className="text-[12px] text-text-secondary">Paracetamol · GSK Pharmaceuticals</div>
            </div>
            <div className="h-px bg-border-subtle" />
            {[
              ["MFG date", "08-Aug-2025", true],
              ["EXP date", "08-Aug-2027", true],
              ["Initial qty", "2,000 strips", true],
              ["Current qty", "1,248 strips", true, true],
              ["MRP", "₹ 32", false],
              ["Location", "Shelf A-12", false],
            ].map(([k, v, mono, accent]) => (
              <div key={String(k)} className="flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{String(k)}</span>
                <span className={cn("text-[13px] font-semibold", mono ? "font-mono" : "", accent ? "text-accent" : "text-text-primary")}>{String(v)}</span>
              </div>
            ))}
            <div className="mt-2">
              <span className="px-2.5 py-1 rounded-full bg-success-soft text-success text-[10.5px] font-semibold">In stock · 62% remaining</span>
            </div>
          </div>

          {/* Transaction history */}
          <div className="flex-1 bg-surface-1 border border-border-subtle rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
              <div>
                <div className="text-[14px] font-semibold">Transaction history</div>
                <div className="text-[11px] text-text-muted">752 strips dispensed across 184 transactions</div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
                <Download size={13} /> Export
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {TRANSACTIONS.map((r, i) => (
                <div key={i} className="grid px-5 py-3 border-b border-border-subtle last:border-b-0 items-center text-[12px] gap-2.5"
                  style={{ gridTemplateColumns: "120px 80px 1fr 80px 1fr" }}>
                  <span className="font-mono text-text-muted">{r[0]}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10.5px] font-semibold w-fit", TX_COLOR[r[1]] || "bg-surface-2 text-text-secondary")}>{r[1]}</span>
                  <span className="text-text-primary">{r[2]}</span>
                  <span className={cn("font-mono font-semibold", r[3].startsWith("+") ? "text-success" : "text-danger")}>{r[3]}</span>
                  <span className="text-text-muted">{r[4]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
