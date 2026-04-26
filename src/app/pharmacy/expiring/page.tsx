"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Calendar, Package } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Btn } from "@/components/ui/Btn";
import { listInventory, type InventoryFilter } from "@/lib/api/inventory";
import type { Medicine } from "@/lib/types/inventory";
import { cn } from "@/lib/utils";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function PharmacyExpiringPage() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await listInventory({ filter: "expiring" as InventoryFilter });
      setItems(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const sortedItems = [...items].sort((a, b) => {
    const aExpiry = a.batches.filter((b) => b.status === "expiring")[0]?.expiry_date ?? new Date(9999, 0);
    const bExpiry = b.batches.filter((b) => b.status === "expiring")[0]?.expiry_date ?? new Date(9999, 0);
    return aExpiry.getTime() - bExpiry.getTime();
  });

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Pharmacy", "Expiring"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Expiring Soon
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {items.length} medicines with batches expiring within 90 days
            </p>
          </div>
          <Btn variant="ghost" size="sm" icon={<RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />} onClick={() => load(true)} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        )}
        {error && <div className="p-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}

        {!loading && items.length === 0 && !error && (
          <Card className="text-center py-16">
            <Package className="w-10 h-10 mx-auto mb-3 text-success opacity-50" />
            <p className="text-sm font-semibold text-success">No expiring stock</p>
            <p className="text-xs text-text-muted mt-1">All batches are valid beyond 90 days.</p>
          </Card>
        )}

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          {sortedItems.length > 0 && (
            <>
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                <span>Medicine</span><span>Category</span><span>Batch</span><span>Expiry</span><span className="text-right">Days left</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sortedItems.map((med) => {
                  const expiringBatches = med.batches.filter((b) => b.status === "expiring");
                  return expiringBatches.map((batch) => {
                    const days = daysUntil(batch.expiry_date);
                    const urgent = days <= 30;
                    return (
                      <div key={`${med.id}-${batch.id}`} className={cn(
                        "grid grid-cols-[2fr_1fr_1fr_1fr_120px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors",
                        urgent && "bg-warning-soft/20"
                      )}>
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{med.name}</div>
                          <div className="text-xs text-text-muted">{med.generic_name ?? med.category ?? "—"}</div>
                        </div>
                        <span className="text-sm text-text-secondary capitalize">{med.category ?? "—"}</span>
                        <span className="text-xs font-mono text-text-secondary">{batch.batch_number}</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-text-muted flex-shrink-0" />
                          <span className="text-xs font-mono text-text-secondary">
                            {batch.expiry_date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <Pill color={days <= 30 ? "danger" : "warning"}>
                            {days}d
                          </Pill>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
