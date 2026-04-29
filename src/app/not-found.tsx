"use client";

import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex-1 h-screen flex items-center justify-center">
      <div className="w-[480px] text-center">
        <div className="w-[120px] h-[120px] mx-auto mb-6 relative">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="54" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="2,4"/>
            <circle cx="60" cy="60" r="36" stroke="var(--accent)" strokeWidth="2" opacity="0.4"/>
            <text x="60" y="72" textAnchor="middle" fontSize="36" fontWeight="600" fill="var(--accent)" fontFamily="Inter, system-ui, sans-serif">?</text>
          </svg>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight mb-3">Patient not found in this hospital</h1>
        <p className="text-[14px] text-text-secondary leading-relaxed mb-6">
          We couldn&apos;t locate the requested record within your hospital. Records are scoped to the tenant — try switching hospitals if you have access.
        </p>
        <div className="flex gap-2.5 justify-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-1 border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-surface-2 transition-colors">
            <ArrowLeft size={14} /> Go back
          </button>
          <button onClick={() => router.push("/patients")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">
            <Search size={14} /> Search patients
          </button>
        </div>
      </div>
    </div>
  );
}
