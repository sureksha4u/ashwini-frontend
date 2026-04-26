"use client";

import { Receipt, TrendingUp, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

function StatCard({ label, value, sub, color = "text-text-primary" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">{label}</div>
      <div className={`text-3xl font-semibold mt-1 font-mono ${color}`}>{value}</div>
      {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
    </Card>
  );
}

// Placeholder data until billing backend is implemented
const DAILY = [
  { day: "Mon", amount: 28400 },
  { day: "Tue", amount: 34200 },
  { day: "Wed", amount: 29800 },
  { day: "Thu", amount: 38500 },
  { day: "Fri", amount: 42100 },
  { day: "Sat", amount: 19200 },
  { day: "Sun", amount: 8600 },
];

const maxAmount = Math.max(...DAILY.map((d) => d.amount));

export default function BillingReportsPage() {
  const total = DAILY.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Billing", "Reports"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Revenue Reports</h1>
            <p className="text-xs text-text-secondary mt-1">Weekly summary</p>
          </div>
        </div>

        <div className="px-3 py-2 bg-warning-soft border border-warning/30 rounded-lg text-xs text-text-secondary flex items-center gap-2 mb-5">
          <Clock className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          Billing backend is being built. Revenue data shown is placeholder — real billing reports coming soon.
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="This week" value={`₹${(total / 1000).toFixed(0)}K`} sub="7 days" color="text-success" />
          <StatCard label="Today" value="₹42.1K" sub="est." />
          <StatCard label="Avg per visit" value="₹1,840" sub="OPD" />
          <StatCard label="Outstanding" value="₹12.4K" sub="pending" color="text-warning" />
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Daily revenue · this week</h3>
          </div>
          <div className="flex items-end gap-3 h-40">
            {DAILY.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-accent rounded-t-lg min-h-[4px]"
                  style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                />
                <span className="text-[11px] text-text-muted">{d.day}</span>
                <span className="text-[11px] font-mono text-text-secondary">₹{(d.amount / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
