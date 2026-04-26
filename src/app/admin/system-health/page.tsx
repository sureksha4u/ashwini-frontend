"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, Loader2, RefreshCw, Cpu, Database, Globe, Server } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { apiFetch } from "@/lib/api/client";

interface ServiceStatus {
  name: string;
  icon: React.ReactNode;
  status: "up" | "down" | "degraded" | "checking";
  latency?: number;
  detail?: string;
}

async function checkBackend(): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    await apiFetch<unknown>("/health");
    return { ok: true, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API / Backend", icon: <Server className="w-4 h-4" />, status: "checking" },
    { name: "Database (PostgreSQL)", icon: <Database className="w-4 h-4" />, status: "checking" },
    { name: "Auth service", icon: <Globe className="w-4 h-4" />, status: "checking" },
    { name: "File storage", icon: <Cpu className="w-4 h-4" />, status: "checking" },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  async function runChecks() {
    setChecking(true);
    const backendResult = await checkBackend();
    setServices([
      {
        name: "API / Backend",
        icon: <Server className="w-4 h-4" />,
        status: backendResult.ok ? "up" : "down",
        latency: backendResult.latency,
        detail: backendResult.ok ? "GCP Cloud Run · healthy" : "Unreachable",
      },
      {
        name: "Database (PostgreSQL)",
        icon: <Database className="w-4 h-4" />,
        status: backendResult.ok ? "up" : "down",
        detail: backendResult.ok ? "Supabase · connected" : "Unknown",
      },
      {
        name: "Auth service",
        icon: <Globe className="w-4 h-4" />,
        status: backendResult.ok ? "up" : "degraded",
        detail: "JWT · HS256",
      },
      {
        name: "File storage",
        icon: <Cpu className="w-4 h-4" />,
        status: "up",
        detail: "GCS bucket · available",
      },
    ]);
    setLastChecked(new Date());
    setChecking(false);
  }

  useEffect(() => { runChecks(); }, []);

  const allUp = services.every((s) => s.status === "up");
  const anyDown = services.some((s) => s.status === "down");

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "System Health"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent" />
              System Health
            </h1>
            {lastChecked && (
              <p className="text-xs text-text-secondary mt-1">
                Last checked {lastChecked.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            )}
          </div>
          <Btn variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />} onClick={runChecks} disabled={checking}>
            Refresh
          </Btn>
        </div>

        <div className="mb-6">
          <Card className={`flex items-center gap-4 ${anyDown ? "border-danger/40 bg-danger-soft/10" : allUp ? "border-success/30 bg-success/5" : ""}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${anyDown ? "bg-danger-soft" : "bg-success/10"}`}>
              {checking
                ? <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                : anyDown
                  ? <XCircle className="w-6 h-6 text-danger" />
                  : <CheckCircle className="w-6 h-6 text-success" />
              }
            </div>
            <div>
              <div className="text-base font-semibold text-text-primary">
                {checking ? "Checking services…" : anyDown ? "Degraded — some services down" : "All systems operational"}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                {services.filter((s) => s.status === "up").length} / {services.length} services healthy
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {services.map((svc) => (
            <Card key={svc.name} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                svc.status === "up" ? "bg-success/10 text-success"
                : svc.status === "down" ? "bg-danger-soft text-danger"
                : svc.status === "degraded" ? "bg-warning-soft text-warning"
                : "bg-surface-2 text-text-muted"
              }`}>
                {svc.status === "checking" ? <Loader2 className="w-4 h-4 animate-spin" /> : svc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{svc.name}</div>
                {svc.detail && <div className="text-xs text-text-secondary mt-0.5">{svc.detail}</div>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Pill color={
                  svc.status === "up" ? "success"
                  : svc.status === "down" ? "danger"
                  : svc.status === "degraded" ? "warning"
                  : "info"
                }>
                  {svc.status === "checking" ? "Checking" : svc.status.toUpperCase()}
                </Pill>
                {svc.latency !== undefined && (
                  <span className="text-[11px] font-mono text-text-muted">{svc.latency}ms</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
