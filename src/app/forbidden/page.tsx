"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Check, X, MessageSquare, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-[480px]">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-warning-soft flex items-center justify-center text-warning mb-5">
          <ShieldCheck size={42} />
        </div>
        <h2 className="text-[22px] font-semibold mb-2">403 — Restricted record</h2>
        <p className="text-[13px] text-text-secondary leading-relaxed mb-5">
          Your role <strong>Pharmacist</strong> can only view a HIPAA-restricted slice of this patient. Full clinical history is reserved for the consulting doctor and supervising nurse.
        </p>
        <div className="p-4 rounded-[10px] bg-surface-2 text-left mb-5">
          <div className="text-[11px] font-bold text-text-muted tracking-widest uppercase mb-3">What you can do</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px]">
              <Check size={13} className="text-success flex-shrink-0" strokeWidth={2.5} />
              Open the dispensing view (allergies + active Rx)
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <Check size={13} className="text-success flex-shrink-0" strokeWidth={2.5} />
              Request elevated access from the consulting doctor
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-muted">
              <X size={13} className="text-danger flex-shrink-0" />
              View clinical notes, history, contacts
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 justify-center mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-surface-2">
            <ArrowLeft size={14} /> Go back
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">
            <MessageSquare size={13} /> Request access
          </button>
        </div>
        <div className="text-[11px] font-mono text-text-muted">This denial is logged · audit-id 2026-04-25-14-22-7</div>
      </div>
    </div>
  );
}
