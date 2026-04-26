"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Loader2, Beaker, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getLabQueue, type LabQueueItem } from "@/lib/api/lab-workflow";
import { cn } from "@/lib/utils";

const STATUS_PILL = {
  ordered: { color: "info" as const, label: "Ordered" },
  in_progress: { color: "warning" as const, label: "In progress" },
  completed: { color: "success" as const, label: "Completed" },
  cancelled: { color: "danger" as const, label: "Cancelled" },
};

export default function LabOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<LabQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getLabQueue();
      setOrders(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.test_name.toLowerCase().includes(q) ||
      o.patient_name?.toLowerCase().includes(q) ||
      o.patient_id.toLowerCase().includes(q) ||
      o.test_category?.toLowerCase().includes(q)
    );
  });

  const counts = {
    ordered: orders.filter((o) => o.status === "ordered").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    critical: orders.filter((o) => o.has_critical).length,
  };

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Labs", "Orders"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Lab Orders · Today</h1>
            <p className="text-xs text-text-secondary mt-1">
              {orders.length} total · {counts.ordered} ordered · {counts.in_progress} in progress
              {counts.critical > 0 && <span className="text-danger font-semibold"> · {counts.critical} critical</span>}
            </p>
          </div>
          <Btn variant="ghost" size="sm" icon={<RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />} onClick={() => load(true)} />
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <input
              className="h-9 pl-9 pr-3 rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent w-72"
              placeholder="Search test, patient, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Btn variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5" />}>Filter</Btn>
        </div>

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_120px_120px_140px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            <span>Test</span><span>Patient</span><span>Category</span><span>Ordered</span><span>Status</span><span className="text-right">Action</span>
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
                <div><Beaker className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No lab orders today.</p></div>
              </div>
            )}
            {!loading && filtered.map((o, i) => {
              const sp = STATUS_PILL[o.status] ?? { color: "info" as const, label: o.status };
              return (
                <div key={o.id} className={cn(
                  "grid grid-cols-[1.5fr_1fr_1fr_120px_120px_140px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors",
                  o.has_critical && "bg-danger-soft/20"
                )}>
                  <div>
                    <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      {o.test_name}
                      {o.has_critical && <Pill color="danger" soft>⚠ critical</Pill>}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted">{o.lab_id}</div>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={o.patient_name ?? o.patient_id} role="staff" size={24} />
                    <div className="min-w-0">
                      <div className="text-sm text-text-primary truncate">{o.patient_name ?? "—"}</div>
                      <div className="text-[11px] font-mono text-text-muted truncate">{o.patient_id}</div>
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary">{o.test_category ?? "—"}</span>
                  <span className="text-xs font-mono text-text-muted">
                    {o.ordered_at ? new Date(o.ordered_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                  </span>
                  <Pill color={sp.color}>{sp.label}</Pill>
                  <div className="flex justify-end">
                    <Btn variant="secondary" size="sm" onClick={() => router.push(`/patients/${o.patient_id}?tab=labs`)}>
                      View results →
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
