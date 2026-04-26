"use client";

import { useState } from "react";
import { ScanLine, Pill, History, BarChart2, LayoutDashboard, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewTab, type OverviewTabHandle } from "./tabs/OverviewTab";
import { PrescriptionTab, type PrescriptionTabHandle } from "./tabs/PrescriptionTab";
import { RadiologyTab } from "./tabs/RadiologyTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { LabsTab } from "./tabs/LabsTab";

type TabId = "overview" | "radiology" | "labs" | "prescription" | "history" | "analytics";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { id: "prescription", label: "Prescription", icon: <Pill className="w-3.5 h-3.5" /> },
  { id: "labs", label: "Labs", icon: <Beaker className="w-3.5 h-3.5" /> },
  { id: "radiology", label: "X-Ray", icon: <ScanLine className="w-3.5 h-3.5" /> },
  { id: "history", label: "History", icon: <History className="w-3.5 h-3.5" /> },
  { id: "analytics", label: "Analysis", icon: <BarChart2 className="w-3.5 h-3.5" /> },
];

interface PatientTabsProps {
  patientId: string;
  consultationId: string | null;
  isConsultationActive: boolean;
  doctorSpecialty?: string | null;
  overviewRef?: React.RefObject<OverviewTabHandle | null>;
  prescriptionRef?: React.RefObject<PrescriptionTabHandle | null>;
  historyRefreshKey?: number;
  onSyncPayloadChange?: (patch: Record<string, unknown>) => void;
  markDirty?: () => void;
}

export function PatientTabs({
  patientId,
  consultationId,
  isConsultationActive,
  doctorSpecialty,
  overviewRef,
  prescriptionRef,
  historyRefreshKey,
  onSyncPayloadChange,
  markDirty,
}: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-surface-1 border-b border-border-subtle px-5">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-0.5 text-[10px] text-text-muted">({tab.badge})</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto bg-page p-6">
        {/* Overview and Prescription are always mounted so their refs are available for auto-save */}
        <div className={activeTab === "overview" ? "" : "hidden"}>
          <OverviewTab
            ref={overviewRef}
            patientId={patientId}
            consultationId={consultationId}
            isEditable={isConsultationActive}
            onSyncPayloadChange={onSyncPayloadChange}
            markDirty={markDirty}
          />
        </div>
        <div className={activeTab === "prescription" ? "" : "hidden"}>
          <PrescriptionTab
            ref={prescriptionRef}
            patientId={patientId}
            consultationId={consultationId}
            isEditable={isConsultationActive}
            doctorSpecialty={doctorSpecialty}
          />
        </div>
        {activeTab === "labs" && <LabsTab patientId={patientId} />}
        {activeTab === "radiology" && (
          <RadiologyTab patientId={patientId} isEditable={isConsultationActive} />
        )}
        {activeTab === "history" && <HistoryTab patientId={patientId} refreshKey={historyRefreshKey} />}
        {activeTab === "analytics" && <AnalyticsTab patientId={patientId} />}
      </div>
    </div>
  );
}
