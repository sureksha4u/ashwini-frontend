"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import type { Token } from "@/lib/types";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { Btn } from "@/components/ui/Btn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        },
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
    <div className="min-h-screen w-full bg-page text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Soft accent backdrop — adds depth without distraction */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 480px at 20% 0%, var(--accent-soft), transparent 60%), radial-gradient(700px 420px at 80% 100%, var(--info-soft), transparent 60%)",
        }}
      />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Logo size={36} />
        <div>
          <Wordmark size={22} />
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-text-muted mt-1">
            Clinical Excellence
          </p>
        </div>
      </div>

      <div className="w-full max-w-md bg-surface-1 rounded-2xl shadow-soft border border-border-subtle overflow-hidden">
        <div className="p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">Secure Access</h2>
            <p className="text-text-secondary text-sm mt-1">
              Enter your professional credentials to continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-danger-soft border border-danger/20 rounded-lg flex items-start gap-2.5 text-danger text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              label="Professional Email"
              icon={<Mail size={14} />}
              type="email"
              required
              value={email}
              onChange={setEmail}
              placeholder="doctor@ashwini.hms"
            />
            <FormField
              label="Password"
              icon={<Lock size={14} />}
              type="password"
              required
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-strong text-accent focus:ring-accent"
                />
                <span className="text-xs text-text-secondary">Remember me</span>
              </label>
              <button type="button" className="text-xs font-semibold text-accent hover:text-accent-hover">
                Forgot password?
              </button>
            </div>

            <Btn type="submit" full size="lg" disabled={isLoading} className="mt-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Btn>
          </form>
        </div>

        <div className="bg-surface-2 px-6 py-4 border-t border-border-subtle flex items-center justify-center gap-2">
          <p className="text-xs text-text-secondary font-medium">Have an invitation code?</p>
          <button
            onClick={() => router.push("/onboard")}
            className="text-xs font-semibold text-accent hover:underline underline-offset-4"
          >
            Activate Account
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 text-text-muted">
        <ShieldCheck size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-widest">
          End-to-End Encrypted Workspace
        </span>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

function FormField({ label, icon, type, required, value, onChange, placeholder }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-text-secondary ml-0.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent transition-colors">
          {icon}
        </div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3.5 py-3 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
