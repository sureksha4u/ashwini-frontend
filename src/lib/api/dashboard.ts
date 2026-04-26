import { apiFetch } from "./client";

export interface DashboardKpi {
  label: string;
  value: string;
  trend: "up" | "down" | "flat" | null;
  change: number | null;
  sparkline: number[];
}

export interface DashboardKpis {
  patients_today: DashboardKpi;
  active_consults: DashboardKpi;
  avg_wait_minutes: DashboardKpi;
  total_registered: DashboardKpi;
  active_staff: DashboardKpi | null;
  branches: DashboardKpi | null;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  return apiFetch<DashboardKpis>("/dashboard/kpis");
}
