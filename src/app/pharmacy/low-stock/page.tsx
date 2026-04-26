"use client";

import { useEffect, useState } from "react";
import { PackageX, Loader2, RefreshCw, TrendingDown, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Btn } from "@/components/ui/Btn";
import { listInventory, type InventoryFilter } from "@/lib/api/inventory";
import type { Medicine } from "@/lib/types/inventory";
import { cn } from "@/lib/utils";

export default function PharmacyLowStockPage() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await listInventory({ filter: "low_stock" as InventoryFilter });
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

  const sortedItems = [...items].sort((a, b) => a.total_stock - b.total_stock);
  const outOfStock = items.filter((m) => m.total_stock <= 0).length;

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Pharmacy", "Low Stock"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-danger" />
              Low Stock
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {items.length} medicines at or below reorder level · {outOfStock} out of stock
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
            <PackageX className="w-10 h-10 mx-auto mb-3 text-success opacity-50" />
            <p className="text-sm font-semibold text-success">All stock levels healthy</p>
            <p className="text-xs text-text-muted mt-1">No medicines below reorder level.</p>
          </Card>
        )}

        <Card noPadding className="flex-1 overflow-hidden flex flex-col">
          {sortedItems.length > 0 && (
            <>
              <div className="grid grid-cols-[2fr_1fr_1fr_100px_120px_120px] px-4 py-3 border-b border-border-subtle bg-surface-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                <span>Medicine</span><span>Category</span><span>UoM</span><span className="text-right">Reorder</span><span className="text-right">In stock</span><span className="text-right">Status</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sortedItems.map((med) => {
                  const isOut = med.total_stock <= 0;
                  const isCritical = med.total_stock <= Math.floor(med.reorder_level * 0.5);
                  return (
                    <div key={med.id} className={cn(
                      "grid grid-cols-[2fr_1fr_1fr_100px_120px_120px] px-4 py-3 items-center gap-2 border-b border-border-subtle last:border-0 hover:bg-surface-2/60 transition-colors",
                      isOut && "bg-danger-soft/10"
                    )}>
                      <div className="flex items-start gap-2 min-w-0">
                        {(isOut || isCritical) && <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-text-primary truncate">{med.name}</div>
                          <div className="text-xs text-text-muted">{med.generic_name ?? "—"}</div>
                        </div>
                      </div>
                      <span className="text-sm text-text-secondary capitalize">{med.category ?? "—"}</span>
                      <span className="text-sm text-text-secondary">{med.uom ?? "—"}</span>
                      <span className="text-sm font-mono text-text-muted text-right">{med.reorder_level}</span>
                      <span className={cn("text-sm font-semibold font-mono text-right", isOut ? "text-danger" : isCritical ? "text-warning" : "text-text-primary")}>
                        {med.total_stock}
                      </span>
                      <div className="flex justify-end">
                        <Pill color={isOut ? "danger" : isCritical ? "warning" : "info"}>
                          {isOut ? "Out of stock" : isCritical ? "Critical" : "Low"}
                        </Pill>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
