"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Plus, Edit2, Package, Loader2 } from "lucide-react";
import { KPICard } from "@/components/pharmacy/kpi-card";
import { StatusBadge } from "@/components/pharmacy/status-badge";
import { AddMedicineDrawer } from "@/components/pharmacy/add-medicine-drawer";
import { Medicine, KPIData } from "@/lib/types/inventory";
import {
  listInventory,
  getInventoryKPIs,
  kpisToCards,
  type InventoryFilter,
} from "@/lib/api/inventory";
import { Btn } from "@/components/ui/Btn";
import { cn } from "@/lib/utils";

export function InventoryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backend already supports search + filter at the query level, so we delegate
  // both to the API rather than client-side filtering against a snapshot.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const apiFilter: InventoryFilter =
      filterStatus === "low-stock" ? "low_stock" :
      filterStatus === "expiring" ? "expiring" :
      "all";
    Promise.all([
      listInventory({ filter: apiFilter, search: searchQuery || undefined }),
      getInventoryKPIs(),
    ])
      .then(([meds, k]) => {
        if (cancelled) return;
        setMedicines(meds);
        setKpis(kpisToCards(k));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterStatus, searchQuery]);

  const handleAdd = () => {
    setSelectedMedicine(null);
    setDrawerOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Inventory</h1>
          <p className="text-text-secondary text-sm mt-1">
            Stock levels, batch expiry, and medicine catalog.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(kpis.length ? kpis : Array.from({ length: 3 })).map((kpi, index) =>
          kpi ? (
            <KPICard key={index} data={kpi as KPIData} />
          ) : (
            <div
              key={index}
              className="bg-surface-1 rounded-xl border border-border-subtle p-5 shadow-soft h-32 animate-pulse"
            />
          ),
        )}
      </div>

      {error && (
        <div className="bg-danger-soft border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
          Failed to load inventory: {error}
        </div>
      )}

      <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Search medicines by name, generic name, or category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-surface-2 focus:bg-surface-1 focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all outline-none text-text-primary placeholder:text-text-muted text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
            <FilterChip label="All" active={filterStatus === "all"} onClick={() => setFilterStatus("all")} />
            <FilterChip label="Low Stock" active={filterStatus === "low-stock"} onClick={() => setFilterStatus("low-stock")} color="warning" />
            <FilterChip label="Expiring" active={filterStatus === "expiring"} onClick={() => setFilterStatus("expiring")} color="warning" />
          </div>

          <Btn icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
            Add Medicine
          </Btn>
        </div>
      </div>

      <div className="bg-surface-1 rounded-xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-2">
                <Th>Medicine Details</Th>
                <Th>Batch & Expiry</Th>
                <Th>Stock</Th>
                <Th>Pricing</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {medicines.map((medicine) => (
                <MedicineRow key={medicine.id} medicine={medicine} onEdit={() => handleEdit(medicine)} />
              ))}
            </tbody>
          </table>
        </div>

        {medicines.length === 0 && (
          loading ? (
            <div className="py-14 flex flex-col items-center text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-accent mb-2.5" />
              <p className="text-sm">Loading inventory…</p>
            </div>
          ) : (
            <div className="py-14 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-surface-2 flex items-center justify-center">
                <Package className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1">No medicines found</h3>
              <p className="text-sm text-text-secondary">Try adjusting your search or filters</p>
            </div>
          )
        )}
      </div>

      <AddMedicineDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        medicine={selectedMedicine}
      />
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </th>
  );
}

interface MedicineRowProps {
  medicine: Medicine;
  onEdit: () => void;
}

function MedicineRow({ medicine, onEdit }: MedicineRowProps) {
  const firstBatch = medicine.batches[0];

  return (
    <tr className="hover:bg-surface-2 transition-colors group">
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-text-primary text-sm leading-tight">{medicine.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{medicine.generic_name}</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {medicine.category} · {medicine.manufacturer}
          </p>
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm text-text-primary font-mono">
          {firstBatch?.batch_number || "N/A"}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Exp: {firstBatch?.expiry_date
            ? new Date(firstBatch.expiry_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </p>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">{medicine.total_stock} units</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Reorder: {medicine.reorder_level} · {medicine.location}
        </p>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-text-primary font-mono">
          ₹{firstBatch?.mrp?.toFixed(2) || "0.00"}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Cost: ₹{firstBatch?.purchase_price?.toFixed(2) || "0.00"}
        </p>
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={medicine.status} />
      </td>

      <td className="px-4 py-3 text-right">
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-primary border border-border-subtle"
        >
          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          Quick Edit
        </button>
      </td>
    </tr>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: "default" | "warning";
}

function FilterChip({ label, active, onClick, color = "default" }: FilterChipProps) {
  const activeStyles = {
    default: "bg-text-primary text-page border-text-primary dark:bg-accent dark:border-accent dark:text-white",
    warning: "bg-warning text-white border-warning",
  }[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
        active
          ? activeStyles
          : "bg-surface-1 text-text-secondary border-border-subtle hover:border-border-strong",
      )}
    >
      {label}
    </button>
  );
}
