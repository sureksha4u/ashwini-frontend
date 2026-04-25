import { apiFetch } from "./client";
import { mapMedicine, type Medicine, type PharmacyKPI, type MedicineSchema, type KPIData } from "@/lib/types/inventory";

export type InventoryFilter = "all" | "low_stock" | "expiring";

export async function listInventory(opts: { filter?: InventoryFilter; search?: string } = {}): Promise<Medicine[]> {
  const params = new URLSearchParams();
  if (opts.filter && opts.filter !== "all") params.set("filter_type", opts.filter);
  if (opts.search) params.set("search", opts.search);
  const qs = params.toString();
  const data = await apiFetch<MedicineSchema[]>(`/inventory${qs ? `?${qs}` : ""}`);
  return data.map(mapMedicine);
}

export async function getInventoryKPIs(): Promise<PharmacyKPI> {
  return apiFetch<PharmacyKPI>("/inventory/kpis");
}

/**
 * Map the backend KPI response into the four sparkline cards the dashboard
 * design expects. Until we hook up time-series data, sparklines stay flat —
 * the absolute numbers (which is what users actually read) come from the API.
 */
export function kpisToCards(kpis: PharmacyKPI): KPIData[] {
  const flat = (v: number) => Array(7).fill(v);
  return [
    {
      label: "Total Stock Value",
      value: `₹${kpis.total_stock_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      change: 0,
      trend: "up",
      sparkline: flat(kpis.total_stock_value || 1),
    },
    {
      label: "Low Stock Items",
      value: String(kpis.low_stock_count),
      change: 0,
      trend: kpis.low_stock_count > 0 ? "down" : "up",
      sparkline: flat(kpis.low_stock_count || 1),
    },
    {
      label: "Expiring Soon",
      value: String(kpis.expiring_soon_count),
      change: 0,
      trend: kpis.expiring_soon_count > 0 ? "down" : "up",
      sparkline: flat(kpis.expiring_soon_count || 1),
    },
  ];
}
