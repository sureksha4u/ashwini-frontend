"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { onboardUser } from "@/lib/api/users";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { Btn } from "@/components/ui/Btn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function OnboardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invitation token is missing");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onboardUser({ token, username, password });
      setIsSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to activate account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-10 bg-surface-1 rounded-2xl border border-border-subtle shadow-soft">
        <div className="mx-auto w-14 h-14 bg-danger-soft rounded-full flex items-center justify-center mb-5 text-danger">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Invalid Link</h2>
        <p className="text-text-secondary text-sm mt-1.5">
          The invitation token is missing or malformed.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-accent font-semibold text-sm hover:underline"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-surface-1 rounded-2xl border border-border-subtle shadow-soft">
        <div className="mx-auto w-14 h-14 bg-success-soft rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Account Activated</h2>
        <p className="text-text-secondary text-sm mt-1.5">Your professional workspace is ready.</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to login…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-surface-1 rounded-2xl shadow-soft border border-border-subtle overflow-hidden">
      <div className="p-8">
        <div className="mb-7 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-soft rounded-xl mb-4">
            <User className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            Set Up Your Account
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Complete your profile to join the workspace.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-danger-soft border border-danger/20 rounded-lg flex items-start gap-2.5 text-danger text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Desired Username" value={username} onChange={setUsername} placeholder="e.g. dr.smith" />
          <Field label="Create Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <Field
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setPasswordConfirm}
            placeholder="••••••••"
          />

          <Btn
            type="submit"
            full
            size="lg"
            disabled={isLoading || password !== confirmPassword || !password}
            className="mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Activate Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Btn>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

function Field({ label, type = "text", value, onChange, placeholder }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-text-secondary ml-0.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-3 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

export default function OnboardPage() {
  return (
    <div className="min-h-screen w-full bg-page text-text-primary flex flex-col items-center justify-center p-6 relative">
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
        <Wordmark size={22} />
      </div>

      <Suspense
        fallback={
          <div className="text-text-muted font-medium text-center flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
            Verifying invitation…
          </div>
        }
      >
        <OnboardForm />
      </Suspense>

      <div className="mt-10 flex items-center gap-2 text-text-muted">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[11px] font-semibold uppercase tracking-widest">
          Enterprise Security Active
        </span>
      </div>
    </div>
  );
}
