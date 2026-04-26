"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scan, Search, Loader2, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getRadiologyQueue, type RadioQueueItem } from "@/lib/api/radiology-workflow";
import { cn } from "@/lib/utils";

const STATUS_PILL = {
  requested: { color: "info" as const, label: "Requested" },
  captured: { color: "warning" as const, label: "Captured" },
  uploaded: { color: "accent" as const, label: "Uploaded" },
  reviewed: { color: "success" as const, label: "Reviewed" },
};

export default function RadiologyQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<RadioQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getRadiologyQueue();
      setQueue(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = queue.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.type.toLowerCase().includes(q) ||
      r.body_part.toLowerCase().includes(q) ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.patient_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Radiology", "Queue"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Radiology Queue</h1>
            <p className="text-xs text-text-secondary mt-1">
              {queue.length} orders · {queue.filter((r) => r.status === "requested").length} pending capture
            </p>
          </div>
          <Btn variant="ghost" size="sm" icon={<RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />} onClick={() => load(true)} />
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
          <input
            className="h-9 pl-9 pr-3 w-full rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
            placeholder="Search type, body part, patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_120px_140px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Study</span><span>Patient</span><span>Type</span><span>Body part</span><span>Status</span><span className="text-right">Action</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
                <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
              </div>
            )}
            {error && <div className="p-4 m-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}
            {!loading && filtered.length === 0 && !error && (
              <div className="flex items-center justify-center py-16 text-center text-text-muted">
                <div><Scan className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No radiology orders today.</p></div>
              </div>
            )}
            {!loading && filtered.map((r) => {
              const sp = STATUS_PILL[r.status] ?? { color: "info" as const, label: r.status };
              return (
                <div key={r.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_120px_140px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{r.type} · {r.body_part}</div>
                    <div className="text-[11px] font-mono text-text-muted">{r.radiology_id}</div>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={r.patient_name ?? r.patient_id} role="staff" size={24} />
                    <div className="min-w-0">
                      <div className="text-sm text-text-primary truncate">{r.patient_name ?? "—"}</div>
                      <div className="text-[11px] font-mono text-text-muted truncate">{r.patient_id}</div>
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">{r.type}</span>
                  <span className="text-sm text-text-secondary">{r.body_part}</span>
                  <Pill color={sp.color}>{sp.label}</Pill>
                  <div className="flex justify-end">
                    <Btn variant="secondary" size="sm" onClick={() => router.push(`/patients/${r.patient_id}`)}>
                      Open file →
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
