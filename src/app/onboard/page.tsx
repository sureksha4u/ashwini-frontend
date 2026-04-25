"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, CheckCircle2, ArrowRight, ShieldCheck, Activity, AlertCircle, Loader2 } from "lucide-react";
import { onboardUser } from "@/lib/api/users";

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
      await onboardUser({
        token,
        username,
        password
      });
      setIsSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to activate account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Invalid Link</h2>
        <p className="text-slate-500 mt-2">The invitation token is missing or malformed.</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-8 text-[#2563EB] font-bold text-sm hover:underline"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Account Activated</h2>
        <p className="text-slate-500 mt-2">Your professional workspace is ready.</p>
        <div className="mt-8 flex items-center justify-center gap-3 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
            <User className="w-6 h-6 text-[#2563EB]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A]">Set Up Your Account</h2>
          <p className="text-slate-500 text-sm mt-1">Complete your profile to join the workspace.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Desired Username</label>
            <div className="relative group">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                placeholder="e.g. dr.smith"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Create Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || password !== confirmPassword || !password}
            className="w-full mt-4 bg-[#0F172A] hover:bg-[#1e293b] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Activate Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-3 mb-10 group cursor-default">
        <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg shadow-slate-200">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Ashwini<span className="text-[#2563EB]">HMS</span>
        </h1>
      </div>

      <Suspense fallback={<div className="animate-pulse text-slate-400 font-medium text-center">
        <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin mx-auto mb-4" />
        Verifying invitation...
      </div>}>
        <OnboardForm />
      </Suspense>

      <div className="mt-12 flex items-center gap-2 text-slate-400">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest">Enterprise Security Active</span>
      </div>
    </div>
  );
}
