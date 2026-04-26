"use client";

import { useEffect, useState } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { getLabQueue, type LabQueueItem } from "@/lib/api/lab-workflow";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">{label}</div>
      <div className="text-3xl font-semibold text-text-primary mt-1 font-mono">{value}</div>
      {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
    </Card>
  );
}

export default function LabReportsPage() {
  const [orders, setOrders] = useState<LabQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLabQueue().then(setOrders).finally(() => setLoading(false));
  }, []);

  const completed = orders.filter((o) => o.status === "completed").length;
  const pending = orders.filter((o) => o.status === "ordered" || o.status === "in_progress").length;
  const critical = orders.filter((o) => o.has_critical).length;

  // Category breakdown
  const byCategory: Record<string, number> = {};
  orders.forEach((o) => {
    const cat = o.test_category ?? "Uncategorized";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  });
  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Labs", "Reports"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Lab Reports</h1>
          <p className="text-xs text-text-secondary mt-1">Today's lab activity summary</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard label="Total orders" value={orders.length} sub="today" />
              <StatCard label="Completed" value={completed} sub={`${orders.length ? Math.round(completed / orders.length * 100) : 0}% TAT`} />
              <StatCard label="Pending" value={pending} sub="ordered + in progress" />
              <StatCard label="Critical results" value={critical} sub="require immediate action" />
            </div>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">Orders by category</h3>
              </div>
              {topCategories.length === 0 ? (
                <p className="text-sm text-text-muted">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{cat}</span>
                        <span className="font-mono font-semibold text-text-primary">{count}</span>
                      </div>
                      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(count / orders.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
