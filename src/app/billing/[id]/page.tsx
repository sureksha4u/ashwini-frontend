"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { X, Check, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const LINE_ITEMS = [
  { desc: "Consultation · Cardiology", sub: "Dr. M. Tiwari · 25-Apr", qty: 1, rate: 600, amount: 600 },
  { desc: "CBC + ESR", sub: "Lab L-2026-1881", qty: 1, rate: 480, amount: 480 },
  { desc: "Tab Montelukast 10mg", sub: "Strip x 1.4", qty: 14, rate: 8, amount: 112 },
  { desc: "Tab Telma 40", sub: "Strip x 3", qty: 30, rate: 16.8, amount: 504 },
  { desc: "Asthalin Inhaler 100mcg", sub: "Salbutamol", qty: 1, rate: 280, amount: 280 },
];

export default function BillingInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [payMode, setPayMode] = useState("UPI");
  const [showQr, setShowQr] = useState(false);
  const [paid, setPaid] = useState(false);

  const subtotal = LINE_ITEMS.reduce((s, l) => s + l.amount, 0);
  const discount = 100;
  const taxable = subtotal - discount;
  const cgst = taxable * 0.06;
  const sgst = taxable * 0.06;
  const total = Math.round(taxable + cgst + sgst);

  function handlePay() {
    if (payMode === "UPI") { setShowQr(true); }
    else { setPaid(true); setTimeout(() => router.push("/billing/queue"), 1500); }
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Billing", "Invoice", "Mansi Tiwari"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid gap-4 h-full" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
          {/* Invoice */}
          <div className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Tax invoice</div>
                <div className="text-[11px] font-mono text-text-muted">INV-2026-04-{id ?? "25-0481"} · GSTIN 07AAACA1234B1Z5</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[10.5px] font-semibold">Draft</span>
            </div>

            <div className="px-5 py-4 grid grid-cols-2 gap-4 text-[12px] border-b border-border-subtle">
              <div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Bill to</div>
                <div className="font-semibold">Mansi Tiwari</div>
                <div className="text-text-secondary">F · 34y · O+ · UHID-2026-0481</div>
                <div className="text-text-secondary">+91 98765 43210</div>
                <div className="text-text-secondary">B-12 Lajpat Nagar Phase 2, New Delhi</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Invoice details</div>
                <div className="font-mono text-text-secondary">Date · 25-Apr-2026</div>
                <div className="font-mono text-text-secondary">Visit · OPD-2 Cardiology</div>
                <div className="font-mono text-text-secondary">Doctor · Dr. M. Tiwari</div>
                <div className="font-mono text-text-secondary">Insurance · Star Health</div>
              </div>
            </div>

            <div className="flex-1 px-5 py-3">
              <div className="grid text-[10px] font-semibold text-text-muted uppercase tracking-widest py-2 border-b border-border-subtle mb-1"
                style={{ gridTemplateColumns: "2fr 80px 80px 100px 40px" }}>
                <span>Item / Description</span><span className="text-right">Qty</span><span className="text-right">Rate ₹</span><span className="text-right">Amount ₹</span><span />
              </div>
              {LINE_ITEMS.map((l, i) => (
                <div key={i} className="grid py-2.5 items-center border-b border-border-subtle"
                  style={{ gridTemplateColumns: "2fr 80px 80px 100px 40px" }}>
                  <div>
                    <div className="text-[13px] font-semibold">{l.desc}</div>
                    <div className="text-[11px] text-text-muted">{l.sub}</div>
                  </div>
                  <span className="text-[12px] font-mono text-right">{l.qty}</span>
                  <span className="text-[12px] font-mono text-right">{l.rate}</span>
                  <span className="text-[13px] font-mono font-semibold text-right">{l.amount}</span>
                  <div className="flex justify-end"><button className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-soft"><X size={12} /></button></div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + payment */}
          <div className="flex flex-col gap-3">
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="text-[13px] font-semibold mb-3">Summary</div>
              {[["Subtotal", subtotal.toFixed(0), ""], ["Discount", `− ${discount}`, "text-success"], ["CGST 6%", cgst.toFixed(0), ""], ["SGST 6%", sgst.toFixed(0), ""]].map(([k, v, c]) => (
                <div key={k} className="flex justify-between py-1.5 text-[13px] text-text-secondary">
                  <span>{k}</span><span className={cn("font-mono font-semibold", c)}>₹ {v}</span>
                </div>
              ))}
              <div className="h-px bg-border-subtle my-2" />
              <div className="flex justify-between py-1.5 text-[18px] font-semibold">
                <span>Total</span>
                <span className="font-mono text-accent">₹ {total.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-[11px] text-text-muted text-right mt-0.5">Rupees one thousand eight hundred twenty only</div>
            </div>

            <div className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="text-[13px] font-semibold mb-2.5">Payment mode</div>
              <div className="grid grid-cols-2 gap-2">
                {["Cash", "Card", "UPI", "Insurance"].map(m => (
                  <button key={m} onClick={() => setPayMode(m)}
                    className={cn("p-3 rounded-lg text-[12px] font-semibold flex items-center gap-2 transition-colors",
                      payMode === m ? "bg-accent-soft border-2 border-accent text-accent" : "bg-surface-2 border border-transparent text-text-secondary hover:bg-surface-2"
                    )}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {paid ? (
              <div className="flex items-center justify-center gap-2 h-11 rounded-lg bg-success text-white text-[13px] font-semibold">
                <Check size={16} /> Payment confirmed
              </div>
            ) : (
              <button onClick={handlePay}
                className="h-11 rounded-lg bg-success text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90">
                <Check size={15} /> Confirm payment & generate receipt
              </button>
            )}
          </div>
        </div>

        {/* UPI QR modal */}
        {showQr && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(15,23,42,0.5)" }}>
            <div className="w-[480px] rounded-2xl bg-surface-1 border border-border-subtle shadow-2xl p-7">
              <div className="flex items-center gap-2.5 mb-4">
                <QrCode size={20} className="text-accent" />
                <span className="text-[16px] font-semibold">Pay via UPI</span>
                <div className="flex-1" />
                <button onClick={() => setShowQr(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
              </div>
              <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 grid mb-2.5"
                style={{ gridTemplateColumns: "repeat(15, 1fr)", gridTemplateRows: "repeat(15, 1fr)", gap: 1 }}>
                {Array.from({ length: 225 }).map((_, k) => (
                  <div key={k} style={{ background: Math.random() > 0.45 ? "#0F172A" : "transparent" }} />
                ))}
              </div>
              <div className="text-center text-[11px] font-mono text-text-muted mb-4">ashwini@hdfcbank · ₹ {total.toLocaleString("en-IN")}</div>
              <div className="flex justify-between items-center py-3 border-t border-border-subtle mb-4">
                <span className="text-[13px] text-text-secondary">Mansi Tiwari · INV-2026-04-25-0481</span>
                <span className="text-[16px] font-semibold font-mono text-accent">₹ {total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-2 text-[12px] text-text-secondary mb-4">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" /> Waiting for confirmation…
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowQr(false)} className="flex-1 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[13px] font-semibold text-text-secondary">Cancel</button>
                <button onClick={() => { setShowQr(false); setPaid(true); }} className="flex-1 py-2 rounded-lg bg-success text-white text-[13px] font-semibold">Mark paid manually</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
