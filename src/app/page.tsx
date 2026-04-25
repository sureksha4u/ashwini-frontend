"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Activity, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type { Token } from "@/lib/types";

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
      // Use the standard OAuth2 password flow endpoint
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/login/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Invalid credentials");
      }

      const data: Token = await res.json();
      
      // Store token in localStorage (for API client) and Cookie (for Middleware)
      localStorage.setItem("ashwini_token", data.access_token);
      document.cookie = `ashwini_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      // Success redirect
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 group cursor-default">
        <div className="bg-[#0F172A] p-2.5 rounded-xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Ashwini<span className="text-[#2563EB]">HMS</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
            Clinical Excellence
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0F172A]">Secure Access</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your professional credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                Professional Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  placeholder="doctor@ashwini.hms"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-center gap-2">
          <p className="text-xs text-slate-500 font-medium">Have an invitation code?</p>
          <button 
            onClick={() => router.push("/onboard")}
            className="text-xs font-bold text-[#2563EB] hover:underline decoration-2 underline-offset-4"
          >
            Activate Account
          </button>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="mt-12 flex items-center gap-2 text-slate-400">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest">End-to-End Encrypted Workspace</span>
      </div>
    </div>
  );
}
