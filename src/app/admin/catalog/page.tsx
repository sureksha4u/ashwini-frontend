"use client";

import { useState } from "react";
import { Search, Upload, Plus, Edit } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const DRUGS = [
  { brand: "Crocin Advance 500mg", generic: "Paracetamol", mfr: "GSK", schedule: "OTC", mrp: "₹ 32", status: "Active" },
  { brand: "Augmentin 625 Duo", generic: "Amoxicillin+Clav", mfr: "GSK", schedule: "Schedule H", mrp: "₹ 215", status: "Active" },
  { brand: "Telma 40", generic: "Telmisartan", mfr: "Glenmark", schedule: "Schedule H", mrp: "₹ 168", status: "Active" },
  { brand: "Pantop 40", generic: "Pantoprazole", mfr: "Aristo", schedule: "Schedule H", mrp: "₹ 110", status: "Active" },
  { brand: "Dolo-650", generic: "Paracetamol 650", mfr: "Micro Labs", schedule: "OTC", mrp: "₹ 30", status: "Active" },
  { brand: "Asthalin Inhaler", generic: "Salbutamol", mfr: "Cipla", schedule: "Schedule H", mrp: "₹ 280", status: "Active" },
  { brand: "Eltroxin 50mcg", generic: "Levothyroxine", mfr: "GSK", schedule: "Schedule H", mrp: "₹ 88", status: "Discontinued" },
  { brand: "Metformin 500mg", generic: "Metformin HCl", mfr: "USV", schedule: "Schedule H", mrp: "₹ 22", status: "Active" },
];

const SCHEDULE_FILTERS = ["Schedule H", "Schedule X", "OTC", "Banned"];

export default function AdminCatalogPage() {
  const [search, setSearch] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState<string | null>(null);

  const filtered = DRUGS.filter(d => {
    const matchSearch = !search || d.brand.toLowerCase().includes(search.toLowerCase()) || d.generic.toLowerCase().includes(search.toLowerCase()) || d.mfr.toLowerCase().includes(search.toLowerCase());
    const matchSched = !scheduleFilter || d.schedule === scheduleFilter;
    return matchSearch && matchSched;
  });

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "Master · Drug catalog"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-semibold">Drug catalog</h1>
            <p className="text-[12px] text-text-secondary mt-1">Master list · 12,840 entries · synced with CDSCO database</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-1 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2">
              <Upload size={14} /> Import CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent-hover">
              <Plus size={14} /> Add drug
            </button>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search 12,840 drugs by brand, generic, manufacturer…"
              className="h-9 pl-9 pr-4 w-[420px] rounded-lg bg-surface-1 border border-border-subtle text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
            />
          </div>
          {SCHEDULE_FILTERS.map(s => (
            <button key={s} onClick={() => setScheduleFilter(f => f === s ? null : s)}
              className={cn("px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors", scheduleFilter === s ? "bg-text-primary text-white border-text-primary" : "bg-surface-1 text-text-secondary border-border-subtle hover:bg-surface-2")}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
          <div className="grid text-[10px] font-semibold text-text-muted uppercase tracking-widest px-5 py-3 bg-surface-2 border-b border-border-subtle"
            style={{ gridTemplateColumns: "2fr 1.4fr 1.2fr 1fr 1fr 100px 60px" }}>
            <span>Brand</span><span>Generic</span><span>Manufacturer</span><span>Schedule</span><span>MRP</span><span>Status</span><span />
          </div>
          {filtered.map((d, i) => (
            <div key={i} className="grid px-5 py-3 items-center border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors"
              style={{ gridTemplateColumns: "2fr 1.4fr 1.2fr 1fr 1fr 100px 60px" }}>
              <span className="text-[13px] font-semibold">{d.brand}</span>
              <span className="text-[12px] text-text-secondary">{d.generic}</span>
              <span className="text-[12px]">{d.mfr}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit", d.schedule === "OTC" ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>
                {d.schedule}
              </span>
              <span className="text-[12px] font-mono font-semibold">{d.mrp}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit", d.status === "Active" ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                {d.status}
              </span>
              <div className="flex justify-end">
                <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"><Edit size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
