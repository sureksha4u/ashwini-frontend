"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCheck, Beaker, Pill, AlertTriangle, Stethoscope, Server, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

type NTab = "All" | "Clinical" | "Lab" | "Pharmacy" | "System";

const NOTIFICATIONS = [
  {
    type: "Clinical",
    icon: Stethoscope,
    color: "bg-accent-soft text-accent",
    title: "Lab result ready — Mansi Tiwari",
    body: "CBC + ESR results uploaded. Critical value: Hb 6.2 g/dL.",
    time: "2 min ago",
    unread: true,
  },
  {
    type: "Lab",
    icon: Beaker,
    color: "bg-info-soft text-info",
    title: "Specimen collected — UHID-2026-0512",
    body: "Blood draw completed by Lab Tech Priya. Awaiting processing.",
    time: "14 min ago",
    unread: true,
  },
  {
    type: "Pharmacy",
    icon: Pill,
    color: "bg-success-soft text-success",
    title: "Prescription dispensed — Aarav Khanna",
    body: "3 items dispensed. Metformin 500mg × 60 tabs, Amlodipine 5mg × 30, Atorvastatin 20mg × 30.",
    time: "31 min ago",
    unread: true,
  },
  {
    type: "Pharmacy",
    icon: AlertTriangle,
    color: "bg-warning-soft text-warning",
    title: "Low stock alert — Amoxicillin 500mg",
    body: "Current stock: 18 strips. Reorder level: 50. Raise PO now.",
    time: "1 hr ago",
    unread: false,
  },
  {
    type: "Clinical",
    icon: Stethoscope,
    color: "bg-accent-soft text-accent",
    title: "New consultation assigned",
    body: "Dr. Mehta assigned UHID-2026-0488 for follow-up. OPD Room 3.",
    time: "2 hr ago",
    unread: false,
  },
  {
    type: "System",
    icon: Server,
    color: "bg-surface-2 text-text-muted",
    title: "Backup completed successfully",
    body: "Full snapshot at 03:00 IST. Stored in asia-south1. Size: 4.2 GB.",
    time: "5 hr ago",
    unread: false,
  },
];

const TABS: NTab[] = ["All", "Clinical", "Lab", "Pharmacy", "System"];

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [tab, setTab] = useState<NTab>("All");
  const [readSet, setReadSet] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  const filtered = NOTIFICATIONS.filter(n => tab === "All" || n.type === tab);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread && !readSet.has(NOTIFICATIONS.indexOf(n))).length;

  function markAllRead() {
    setReadSet(new Set(NOTIFICATIONS.map((_, i) => i)));
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[150]"
          style={{ background: "rgba(15,23,42,0.2)" }}
          onMouseDown={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full w-[440px] bg-surface-1 border-l border-border-subtle shadow-2xl z-[160] flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
          <Bell size={16} className="text-text-secondary" />
          <span className="text-[15px] font-semibold flex-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold">{unreadCount}</span>
          )}
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium text-text-secondary hover:bg-surface-2 border border-border-subtle">
            <CheckCheck size={12} /> Mark all read
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-primary">
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 border-b border-border-subtle overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors",
                tab === t ? "bg-accent text-white" : "text-text-secondary hover:bg-surface-2"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted text-[13px] gap-2">
              <Bell size={24} strokeWidth={1.2} />
              No notifications
            </div>
          ) : (
            filtered.map((n, i) => {
              const globalIdx = NOTIFICATIONS.indexOf(n);
              const isRead = !n.unread || readSet.has(globalIdx);
              const Icon = n.icon;
              return (
                <div
                  key={i}
                  onClick={() => setReadSet(prev => new Set([...prev, globalIdx]))}
                  className={cn(
                    "flex gap-3 px-5 py-4 border-b border-border-subtle cursor-pointer hover:bg-surface-2 transition-colors",
                    !isRead && "bg-accent/[0.03]"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", n.color)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] font-semibold text-text-primary leading-snug flex-1">{n.title}</span>
                      {!isRead && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[11.5px] text-text-secondary leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                    <span className="text-[10.5px] text-text-muted mt-1 block">{n.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-subtle">
          <button className="w-full py-2 rounded-lg bg-surface-2 border border-border-subtle text-[12px] font-semibold text-text-secondary hover:bg-surface-2 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}
