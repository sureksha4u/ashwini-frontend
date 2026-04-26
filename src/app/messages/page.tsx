"use client";

import { MessageSquare, Send, Search, User, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

const MOCK_THREADS = [
  { id: "1", name: "Dr. Priya Sharma", role: "DOCTOR", lastMsg: "Please review patient UHID-2026-0481 vitals before consult.", time: "09:14", unread: 2 },
  { id: "2", name: "Nurse Station 2", role: "NURSE", lastMsg: "Vitals captured for morning queue — 12 done.", time: "08:55", unread: 0 },
  { id: "3", name: "Lab Tech Dept", role: "LAB_TECHNICIAN", lastMsg: "CBC results uploaded for UHID-2026-0512.", time: "08:41", unread: 1 },
  { id: "4", name: "Pharmacy", role: "PHARMACIST", lastMsg: "Low stock alert: Amoxicillin 500mg below reorder level.", time: "08:20", unread: 0 },
  { id: "5", name: "Reception Desk", role: "RECEPTIONIST", lastMsg: "5 patients waiting. Cardiology queue full.", time: "Yesterday", unread: 0 },
];

export default function MessagesPage() {
  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Messages"]} />
      <main className="flex-1 overflow-hidden flex gap-0">
        {/* Thread list */}
        <div className="w-80 border-r border-border-subtle flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
              <input
                className="h-9 pl-9 pr-3 w-full rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15"
                placeholder="Search messages…"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_THREADS.map((t) => (
              <button
                key={t.id}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-2/60 transition-colors border-b border-border-subtle last:border-0 text-left"
              >
                <Avatar name={t.name} role={t.role.toLowerCase() as "doctor" | "nurse" | "staff"} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary truncate">{t.name}</span>
                    <span className="text-[11px] text-text-muted ml-2 flex-shrink-0">{t.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-text-secondary truncate">{t.lastMsg}</span>
                    {t.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Empty state / placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
          <MessageSquare className="w-12 h-12 opacity-20" />
          <p className="text-sm font-semibold">Internal messaging coming soon</p>
          <p className="text-xs text-center max-w-xs">
            Staff-to-staff messaging with role-based routing is in development.
            Threads above show placeholder data.
          </p>
        </div>
      </main>
    </div>
  );
}
