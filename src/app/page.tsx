"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import type { Token } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/login/token`,
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Invalid credentials");
      }
      const data: Token = await res.json();
      localStorage.setItem("ashwini_token", data.access_token);
      document.cookie = `ashwini_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-page text-text-primary font-sans">
      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-16 relative">
        <div className="w-[420px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h4l2-7 4 14 2-7h6"/>
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 text-[18px] font-semibold">
              <span>Ashwini</span>
              <span className="text-text-muted font-medium">HMS</span>
            </div>
          </div>

          <h1 className="text-[28px] font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-[14px] text-text-secondary mb-7">Sign in to your hospital workspace.</p>

          {error && (
            <div className="mb-5 p-3 bg-danger-soft border border-danger/20 rounded-lg flex items-start gap-2.5 text-danger text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[12px] font-semibold text-text-primary mb-1.5 block">Work email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-[42px] pl-10 pr-4 bg-surface-1 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                  placeholder="you@hospital.health"
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-text-primary">Password</label>
                <button type="button" onClick={() => router.push("/forgot-password")} className="text-[11px] font-medium text-accent">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-[42px] pl-10 pr-10 bg-surface-1 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                  placeholder="••••••••••••"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[13px] text-text-secondary mt-1 cursor-pointer">
              <span
                onClick={() => setRemember(r => !r)}
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${remember ? "bg-accent border-accent" : "border-border-strong bg-surface-1"}`}
              >
                {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              Remember this device for 30 days
            </label>

            <button
              type="submit" disabled={isLoading}
              className="mt-2 h-[44px] w-full rounded-lg bg-accent text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in to Ashwini HMS <ArrowRight size={15} /></>}
            </button>

            <div className="flex items-center gap-2.5 my-1 text-text-muted text-[11px] font-semibold uppercase tracking-widest">
              <div className="flex-1 h-px bg-border-subtle" /> or <div className="flex-1 h-px bg-border-subtle" />
            </div>

            <button
              type="button"
              className="h-[42px] w-full rounded-lg bg-surface-1 border border-border-subtle text-[13px] font-semibold text-text-secondary flex items-center justify-center gap-2 hover:bg-surface-2 transition-colors"
            >
              <ShieldCheck size={15} className="text-accent" /> Continue with hospital SSO
            </button>
          </form>

          <p className="text-center text-[12px] text-text-secondary mt-6">
            New hospital?{" "}
            <span className="text-accent font-semibold cursor-pointer">Talk to onboarding →</span>
          </p>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-text-muted">
          © 2026 Ashwini HMS · v4.2.1 · HIPAA-aware · ISO 27001
        </div>
      </div>

      {/* Hero panel */}
      <div className="w-[600px] flex-shrink-0 relative overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)", color: "#fff", padding: 56 }}>
        {/* Decorative circles */}
        <svg className="absolute" style={{ top: -120, right: -120, opacity: 0.18 }} width="500" height="500" viewBox="0 0 500 500">
          <circle cx="250" cy="250" r="240" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="250" cy="250" r="180" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="250" cy="250" r="120" fill="none" stroke="white" strokeWidth="1"/>
          <circle cx="250" cy="250" r="60" fill="none" stroke="white" strokeWidth="1"/>
        </svg>
        {/* ECG line */}
        <svg className="absolute" style={{ bottom: 60, left: 40, opacity: 0.25 }} width="520" height="80" viewBox="0 0 520 80" fill="none">
          <path d="M0 40 L60 40 L80 10 L100 70 L120 20 L140 60 L160 40 L520 40" stroke="white" strokeWidth="1.5"/>
        </svg>

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center border" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)", backdropFilter: "blur(10px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h4l2-7 4 14 2-7h6"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5 text-[18px] font-semibold">
            <span>Ashwini</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>HMS</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="relative z-10">
          <p className="text-[13px] font-medium mb-3 tracking-wide" style={{ opacity: 0.7 }}>THE OPERATING SYSTEM FOR INDIAN HOSPITALS</p>
          <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight mb-4">
            One platform for the<br/>entire hospital lifecycle.
          </h1>
          <p className="text-[15px] leading-relaxed mb-8 max-w-[460px]" style={{ opacity: 0.78 }}>
            From OP registration through inpatient discharge — clinical, pharmacy, lab, radiology and billing, unified under a HIPAA-aware role model.
          </p>
          <div className="flex gap-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {[["142", "Hospitals"], ["18.4M", "Patient files"], ["99.99%", "Uptime"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-[22px] font-semibold">{n}</div>
                <div className="text-[11px] tracking-wide" style={{ opacity: 0.7 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
