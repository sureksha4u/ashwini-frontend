"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

const ROUNDS = [
  { bed: "204A", patient: "Rohan Mehta", due: "14:30", tasks: "Vitals, Medication, IV flush", status: "overdue", action: "Start" },
  { bed: "204B", patient: "Sunita Patel", due: "14:45", tasks: "Vitals, Wound check", status: "overdue", action: "Start" },
  { bed: "205A", patient: "Aarav Khanna", due: "15:00", tasks: "Vitals, Medication", status: "due", action: "Start" },
  { bed: "205B", patient: "Krishna Malhotra", due: "15:15", tasks: "Vitals, ECG, Physician review", status: "due", action: "Start" },
  { bed: "206A", patient: "Priya Iyer", due: "15:30", tasks: "Vitals", status: "upcoming", action: "View" },
  { bed: "206B", patient: "Devika Rao", due: "16:00", tasks: "Vitals, Post-op check", status: "done", action: "Review" },
  { bed: "207A", patient: "Vikram Singh", due: "16:30", tasks: "Vitals, Medication", status: "upcoming", action: "View" },
];

const STATUS_STYLE: Record<string, { pill: string; row: string }> = {
  overdue: { pill: "bg-danger-soft text-danger", row: "bg-danger-soft/40" },
  due: { pill: "bg-warning-soft text-warning", row: "" },
  upcoming: { pill: "bg-surface-2 text-text-secondary", row: "" },
  done: { pill: "bg-success-soft text-success", row: "" },
};

export default function NurseRoundsPage() {
  const [filter, setFilter] = useState("All");
  const overdueCount = ROUNDS.filter(r => r.status === "overdue").length;
  const dueCount = ROUNDS.filter(r => r.status === "due").length;
  const doneCount = ROUNDS.filter(r => r.status === "done").length;
  const onTrackPct = Math.round((doneCount / ROUNDS.length) * 100);

  const displayed = filter === "All" ? ROUNDS : ROUNDS.filter(r => r.status === filter.toLowerCase().replace(" ", "_").replace("-", "_"));

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Nurse", "Ward rounds"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-semibold">Ward rounds</h1>
            <p className="text-[12px] text-text-secondary mt-1">Ward C · {ROUNDS.length} patients · Afternoon round · 14:30–17:00</p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            ["Patients on round", String(ROUNDS.length), "text-text-primary"],
            ["Tasks due", String(dueCount), "text-warning"],
            ["Overdue", String(overdueCount), "text-danger"],
            ["On track", `${onTrackPct}%`, "text-success"],
          ].map(([k, v, color]) => (
            <div key={k} className="bg-surface-1 border border-border-subtle rounded-xl p-4">
              <div className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest">{k}</div>
              <div className={cn("text-[26px] font-semibold font-mono mt-1.5", color)}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1.5">
          {["All", "Overdue", "Due", "Upcoming", "Done"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors",
                filter === f ? "bg-text-primary text-white border-text-primary" : "bg-surface-1 text-text-secondary border-border-subtle hover:bg-surface-2")}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
          <div className="grid px-5 py-3 bg-surface-2 border-b border-border-subtle text-[10px] font-semibold text-text-muted uppercase tracking-widest"
            style={{ gridTemplateColumns: "80px 1.4fr 1fr 2fr 120px 100px" }}>
            <span>Bed</span><span>Patient</span><span>Due</span><span>Tasks</span><span>Status</span><span className="text-right">Action</span>
          </div>
          {displayed.map((r, i) => (
            <div key={i} className={cn("grid px-5 py-3.5 items-center border-b border-border-subtle last:border-b-0", STATUS_STYLE[r.status]?.row)}
              style={{ gridTemplateColumns: "80px 1.4fr 1fr 2fr 120px 100px" }}>
              <span className="text-[12px] font-mono font-bold text-text-primary">{r.bed}</span>
              <span className="text-[13px] font-semibold">{r.patient}</span>
              <span className="text-[12px] font-mono text-text-secondary">{r.due}</span>
              <span className="text-[12px] text-text-secondary">{r.tasks}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10.5px] font-semibold w-fit", STATUS_STYLE[r.status]?.pill)}>
                {r.status.replace("_", " ")}
              </span>
              <div className="flex justify-end">
                <button className="px-3 py-1.5 rounded-lg bg-surface-1 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2 transition-colors">
                  {r.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
