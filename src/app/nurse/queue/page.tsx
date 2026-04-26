"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Loader2, Activity } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getReceptionQueue, type ReceptionQueueItem } from "@/lib/api/reception";

export default function NurseQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<ReceptionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReceptionQueue()
      .then(setQueue)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  // Nurse sees active queue (not completed/cancelled), with vitals status derived from
  // whether consultation has vitals data. For now vitals status is "pending" for all
  // waiting/calling patients.
  const active = queue.filter((i) => i.state !== "completed" && i.state !== "cancelled");
  const pendingVitals = active.filter((i) => i.state === "waiting" || i.state === "calling");

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Nurse", "Queue"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Vitals queue · all doctors</h1>
            <p className="text-xs text-text-secondary mt-1">
              {pendingVitals.length} patients pending vitals · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <Btn variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>By doctor</Btn>
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[80px_1.8fr_1fr_1fr_160px_200px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Token</span>
            <span>Patient</span>
            <span>Department</span>
            <span>Status</span>
            <span>Vitals</span>
            <span className="text-right">Action</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16 text-text-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            )}
            {error && (
              <div className="p-4 m-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>
            )}
            {!loading && active.length === 0 && !error && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center text-text-muted">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-sm font-medium">Queue is empty</p>
                  <p className="text-xs mt-1">No active patients today.</p>
                </div>
              </div>
            )}
            {!loading && active.map((item, i) => {
              const name = item.patient?.full_name ?? item.patient_id;
              const vitalsNeeded = item.state === "waiting" || item.state === "calling";
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[80px_1.8fr_1fr_1fr_160px_200px] px-4 py-4 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors"
                >
                  <span className="text-sm font-bold text-text-primary font-mono">{item.token_number ?? "—"}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={name} role="nurse" size={38} />
                    <span className="text-sm font-semibold text-text-primary truncate">{name}</span>
                  </div>
                  <span className="text-sm text-text-secondary">{item.department ?? "—"}</span>
                  <Pill color={item.state === "calling" ? "warning" : item.state === "in_consultation" ? "accent" : "info"}>
                    {item.state.replace("_", " ")}
                  </Pill>
                  {vitalsNeeded ? (
                    <Pill color="warning">⚠ vitals pending</Pill>
                  ) : (
                    <Pill color="success">✓ vitals done</Pill>
                  )}
                  <div className="flex justify-end">
                    <Btn
                      variant={vitalsNeeded ? "primary" : "secondary"}
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/nurse/vitals?consultationId=${item.consultation_id}&patientId=${item.patient?.patient_id ?? item.patient_id}`
                        )
                      }
                    >
                      {vitalsNeeded ? "Capture vitals →" : "Edit vitals"}
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
