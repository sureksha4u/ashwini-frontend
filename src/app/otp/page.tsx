"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function OTPPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(24);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  }

  function verify() {
    const code = digits.join("");
    if (code.length < 6) return;
    setVerifying(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  const isFilled = digits.every(d => d !== "");

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-page text-text-primary font-sans">
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

          <div className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-2">Two-factor verification</div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-1">Enter your one-time code</h1>
          <p className="text-[14px] text-text-secondary mb-7 leading-relaxed">
            We sent a 6-digit code to <span className="text-text-primary font-semibold">+91 98765 ••210</span>. Code expires in 4:32.
          </p>

          {/* OTP boxes */}
          <div className="flex gap-2.5 mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => {
              const isCurrent = i === digits.findIndex(x => x === "") || (digits.every(x => x !== "") && i === 5);
              return (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="flex-1 h-16 text-center text-[24px] font-semibold font-mono rounded-[10px] bg-surface-1 border-[1.5px] transition-all focus:outline-none"
                  style={{
                    borderColor: isCurrent && !d ? "var(--accent)" : d ? "var(--border-strong)" : "var(--border-subtle)",
                    boxShadow: isCurrent && !d ? "0 0 0 4px rgba(var(--accent-rgb, 59 130 246) / 0.12)" : "none",
                    caretColor: "var(--accent)",
                  }}
                />
              );
            })}
          </div>

          <button
            onClick={verify} disabled={!isFilled || verifying}
            className="h-[44px] w-full rounded-lg bg-accent text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60 mb-3.5"
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : "Verify & continue"}
          </button>

          <div className="flex items-center justify-between text-[12px] text-text-secondary">
            <span>Didn&apos;t get the code?</span>
            <div className="flex gap-3.5">
              <span className="text-text-muted">
                {resendTimer > 0 ? `Resend in 0:${String(resendTimer).padStart(2, "0")}` : (
                  <button onClick={() => setResendTimer(60)} className="text-accent font-semibold">Resend code</button>
                )}
              </span>
              <span className="text-accent font-semibold cursor-pointer">Use email instead</span>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-lg bg-surface-2 flex items-center gap-2 text-[12px] text-text-secondary">
            <ShieldCheck size={14} className="text-success flex-shrink-0" />
            Your hospital requires 2FA for clinical roles.
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] text-text-muted">
          © 2026 Ashwini HMS · v4.2.1 · HIPAA-aware · ISO 27001
        </div>
      </div>
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
