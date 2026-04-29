"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-page text-text-primary font-sans">
      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-16 relative">
        <div className="w-[420px]">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h4l2-7 4 14 2-7h6"/>
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 text-[18px] font-semibold">
              <span>Ashwini</span><span className="text-text-muted font-medium">HMS</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-2">Account recovery</div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-1">Forgot your password?</h1>
          <p className="text-[14px] text-text-secondary mb-7 leading-relaxed">Enter your work email and we&apos;ll send you a recovery link. The link expires in 30 minutes.</p>

          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-success-soft flex items-center justify-center">
                <CheckCircle2 size={28} className="text-success" />
              </div>
              <div>
                <div className="text-[16px] font-semibold">Recovery link sent</div>
                <div className="text-[13px] text-text-secondary mt-1">Check your inbox at <span className="font-semibold text-text-primary">{email}</span></div>
              </div>
              <button onClick={() => router.push("/")} className="text-[13px] font-semibold text-accent hover:underline flex items-center gap-1.5">
                <ArrowLeft size={13} /> Back to sign in
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Work email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@hospital.health"
                    className="w-full h-[42px] pl-10 pr-4 bg-surface-1 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => { if (email) setSent(true); }}
                className="h-[44px] w-full rounded-lg bg-accent text-white text-[13px] font-semibold flex items-center justify-center hover:bg-accent-hover transition-colors"
              >
                Send recovery link
              </button>
              <button
                onClick={() => router.push("/")}
                className="h-[40px] w-full rounded-lg text-[13px] font-medium text-text-secondary flex items-center justify-center gap-2 hover:bg-surface-2 transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            </div>
          )}

          {!sent && (
            <div className="mt-6 p-3.5 rounded-[10px] bg-info-soft border border-info/20 flex gap-2.5">
              <ShieldCheck size={18} className="text-info flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-text-secondary leading-relaxed">
                For security, recovery links are sent only to the email registered with your hospital admin. Suspect unauthorized access?{" "}
                <span className="text-accent font-semibold">Contact security</span>.
              </p>
            </div>
          )}
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-text-muted">
          © 2026 Ashwini HMS · v4.2.1 · HIPAA-aware · ISO 27001
        </div>
      </div>

      {/* Hero panel */}
      <AuthHero />
    </div>
  );
}

function AuthHero() {
  return (
    <div className="w-[600px] flex-shrink-0 relative overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)", color: "#fff", padding: 56 }}>
      <svg className="absolute" style={{ top: -120, right: -120, opacity: 0.18 }} width="500" height="500" viewBox="0 0 500 500">
        <circle cx="250" cy="250" r="240" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="250" cy="250" r="180" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="250" cy="250" r="120" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="250" cy="250" r="60" fill="none" stroke="white" strokeWidth="1"/>
      </svg>
      <svg className="absolute" style={{ bottom: 60, left: 40, opacity: 0.25 }} width="520" height="80" viewBox="0 0 520 80" fill="none">
        <path d="M0 40 L60 40 L80 10 L100 70 L120 20 L140 60 L160 40 L520 40" stroke="white" strokeWidth="1.5"/>
      </svg>
      <div className="flex items-center gap-3 relative">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12h4l2-7 4 14 2-7h6"/>
          </svg>
        </div>
        <div className="flex items-baseline gap-1.5 text-[18px] font-semibold">
          <span>Ashwini</span><span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>HMS</span>
        </div>
      </div>
      <div className="flex-1" />
      <div className="relative z-10">
        <p className="text-[13px] font-medium mb-3" style={{ opacity: 0.7 }}>THE OPERATING SYSTEM FOR INDIAN HOSPITALS</p>
        <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight mb-4">One platform for the<br/>entire hospital lifecycle.</h1>
        <p className="text-[15px] leading-relaxed mb-8 max-w-[460px]" style={{ opacity: 0.78 }}>From OP registration through inpatient discharge — clinical, pharmacy, lab, radiology and billing, unified under a HIPAA-aware role model.</p>
        <div className="flex gap-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {[["142", "Hospitals"], ["18.4M", "Patient files"], ["99.99%", "Uptime"]].map(([n, l]) => (
            <div key={l}><div className="text-[22px] font-semibold">{n}</div><div className="text-[11px]" style={{ opacity: 0.7 }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
