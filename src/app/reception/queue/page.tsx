"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Filter, Search, Loader2, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getReceptionQueue, type ReceptionQueueItem } from "@/lib/api/reception";
import { cn } from "@/lib/utils";

type StatusFilter = "All" | "waiting" | "calling" | "in_consultation" | "completed";

const STATUS_PILL: Record<string, { color: "accent" | "success" | "warning" | "danger" | "info"; label: string }> = {
  waiting: { color: "info", label: "Waiting" },
  calling: { color: "warning", label: "Calling" },
  in_consultation: { color: "accent", label: "In consultation" },
  completed: { color: "success", label: "Completed" },
  cancelled: { color: "danger", label: "Cancelled" },
};

export default function ReceptionQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<ReceptionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await getReceptionQueue();
      setQueue(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = queue.filter((item) => {
    if (statusFilter !== "All" && item.state !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.token_number?.toLowerCase().includes(q) ||
        item.patient?.full_name?.toLowerCase().includes(q) ||
        item.patient_id?.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: queue.length,
    waiting: queue.filter((i) => i.state === "waiting").length,
    calling: queue.filter((i) => i.state === "calling").length,
    in_consultation: queue.filter((i) => i.state === "in_consultation").length,
    completed: queue.filter((i) => i.state === "completed").length,
  };

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Reception", "OP Queue"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              OP Queue · Today
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
              {" · "}{counts.total} registered · {counts.waiting} waiting · {counts.in_consultation} in consultation · {counts.completed} completed
            </p>
          </div>
          <div className="flex gap-2">
            <Btn
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />}
              onClick={() => load(true)}
            />
            <Btn variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Btn>
            <Btn size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => router.push("/reception/register")}>
              Register patient
            </Btn>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: counts.total, color: "text-text-primary" },
            { label: "Waiting", value: counts.waiting, color: "text-warning" },
            { label: "Calling", value: counts.calling, color: "text-info" },
            { label: "In consultation", value: counts.in_consultation, color: "text-accent" },
            { label: "Completed", value: counts.completed, color: "text-success" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-3.5">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">{label}</div>
              <div className={cn("text-2xl font-semibold mt-1", color)}>{value}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <input
              className="h-9 pl-9 pr-3 rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all w-72"
              placeholder="Search token, name, UHID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(["All", "waiting", "calling", "in_consultation", "completed"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                statusFilter === f
                  ? "bg-text-primary text-bg-page border-text-primary"
                  : "bg-surface-1 text-text-secondary border-border-subtle hover:bg-surface-2"
              )}
            >
              {f === "All" ? "All" : STATUS_PILL[f]?.label ?? f}
            </button>
          ))}
          <div className="flex-1" />
          <Btn variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>Filters</Btn>
        </div>

        {/* Table */}
        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[80px_1.8fr_1fr_1fr_120px_1fr] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Token</span>
            <span>Patient</span>
            <span>UHID</span>
            <span>Department</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16 text-text-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading queue…</span>
              </div>
            )}
            {error && (
              <div className="p-4 m-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">
                {error}
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex items-center justify-center py-16 text-text-muted">
                <span className="text-sm">No patients match current filter.</span>
              </div>
            )}
            {!loading && filtered.map((item, i) => {
              const status = STATUS_PILL[item.state] ?? { color: "info" as const, label: item.state };
              const name = item.patient?.full_name ?? item.patient_id;
              const isActive = item.state === "in_consultation";
              return (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[80px_1.8fr_1fr_1fr_120px_1fr] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 transition-colors",
                    isActive ? "bg-accent-soft/50" : "hover:bg-surface-2/60"
                  )}
                >
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {item.token_number ?? "—"}
                  </span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={name} role="receptionist" size={28} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">{name}</div>
                      {item.chief_complaint && (
                        <div className="text-[11px] text-text-muted truncate">{item.chief_complaint}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-text-secondary truncate">
                    {item.patient_id}
                  </span>
                  <span className="text-sm text-text-secondary">{item.department ?? "—"}</span>
                  <Pill color={status.color}>{status.label}</Pill>
                  <div className="flex gap-2 justify-end">
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/patients/${item.patient?.patient_id ?? item.patient_id}`)}
                    >
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
