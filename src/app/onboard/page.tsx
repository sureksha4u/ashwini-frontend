"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Building, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { onboardUser } from "@/lib/api/users";

function OnboardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [hipaa, setHipaa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!token) { setError("Invitation token is missing"); return; }
    setIsLoading(true);
    setError(null);
    try {
      await onboardUser({ token, username, password });
      setIsSuccess(true);
      setTimeout(() => router.push("/"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to activate account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-10">
        <div className="mx-auto w-14 h-14 bg-danger-soft rounded-full flex items-center justify-center mb-5 text-danger"><AlertCircle size={28} /></div>
        <h2 className="text-[18px] font-semibold">Invalid link</h2>
        <p className="text-text-secondary text-[13px] mt-1.5">Invitation token is missing or malformed.</p>
        <button onClick={() => router.push("/")} className="mt-6 text-accent font-semibold text-sm hover:underline">Return to login</button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center p-10">
        <div className="mx-auto w-14 h-14 bg-success-soft rounded-full flex items-center justify-center mb-5"><CheckCircle2 size={28} className="text-success" /></div>
        <h2 className="text-[18px] font-semibold">Account activated</h2>
        <p className="text-text-secondary text-[13px] mt-1.5">Your professional workspace is ready.</p>
        <div className="mt-5 flex items-center justify-center gap-2 text-text-muted text-sm"><Loader2 size={15} className="animate-spin" /><span>Redirecting to sign in…</span></div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-2">Invitation · valid for 6 days</div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-1">Welcome, Dr. Aarav</h1>
      <p className="text-[14px] text-text-secondary mb-5">Set up your account to join your team.</p>

      {/* Doctor identity card */}
      <div className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white font-semibold text-[14px] flex-shrink-0">AK</div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">Dr. Aarav Khanna</div>
          <div className="text-[12px] text-text-secondary">aarav.k@ashwini.health</div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent text-[10px] font-bold uppercase tracking-wide">Doctor</span>
      </div>

      {/* Hospital info card */}
      <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle flex items-center gap-2.5 mb-5">
        <Building size={16} className="text-accent flex-shrink-0" />
        <div>
          <div className="text-[12px] font-semibold">Ashwini HMS — Saket, New Delhi</div>
          <div className="text-[11px] text-text-muted">Cardiology · Invited by Dr. Mansi Tiwari (Admin)</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-lg flex items-start gap-2 text-danger text-[13px]">
          <AlertCircle size={15} className="shrink-0 mt-0.5" /><p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Username</label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)} required
              placeholder="e.g. aarav.khanna"
              className="w-full h-[40px] pl-10 pr-4 bg-surface-1 border border-border-subtle rounded-lg text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Set password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full h-[40px] pl-10 pr-10 bg-surface-1 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
              placeholder="••••••••••••"
            />
            <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Confirm password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              className="w-full h-[40px] pl-10 pr-4 bg-surface-1 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
              placeholder="••••••••••••"
            />
          </div>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Mobile (for OTP)</label>
          <div className="flex rounded-lg overflow-hidden border border-border-subtle focus-within:ring-2 focus-within:ring-accent/15 focus-within:border-accent transition-all bg-surface-1">
            <span className="flex items-center px-3 text-[12px] font-semibold font-mono text-text-primary border-r border-border-subtle bg-surface-2">+91</span>
            <input
              type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
              placeholder="98765 12345" className="flex-1 h-[40px] px-3 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
          <span
            onClick={() => setHipaa(h => !h)}
            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border mt-0.5 transition-colors ${hipaa ? "bg-accent border-accent" : "border-border-strong bg-surface-1"}`}
          >
            {hipaa && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </span>
          <span className="text-[12px] text-text-secondary leading-relaxed">
            I agree to the HIPAA-aware data handling policy and the hospital&apos;s clinical-role responsibilities.
          </span>
        </label>

        <button
          type="submit" disabled={isLoading || !hipaa || !username || !password}
          className="h-[44px] w-full rounded-lg bg-accent text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-50 mt-1"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Accept invitation & continue <ArrowRight size={15} /></>}
        </button>
      </form>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-page text-text-primary font-sans">
      {/* Hero on LEFT */}
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

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-16 overflow-y-auto relative">
        <div className="w-[420px] py-12">
          <Suspense fallback={<div className="flex items-center gap-2 text-text-muted"><Loader2 size={16} className="animate-spin" /> Verifying invitation…</div>}>
            <OnboardForm />
          </Suspense>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-text-muted">
          © 2026 Ashwini HMS · v4.2.1 · HIPAA-aware · ISO 27001
        </div>
      </div>
    </div>
  );
}
