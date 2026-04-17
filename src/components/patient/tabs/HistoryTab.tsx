"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, X, ArrowLeft, FileText, Pill, ClipboardList } from "lucide-react";
import { getHistory, type VisitHistoryItem } from "@/lib/api/history";
import { getConsultation, type ConsultationResponse } from "@/lib/api/consultation";

interface HistoryTabProps {
  patientId: string;
  refreshKey?: number;
}

// ─── View Summary Modal ────────────────────────────────────────────────────────

function SummaryModal({
  visit,
  onClose,
}: {
  visit: VisitHistoryItem;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsultation(visit.consultation_id).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [visit.consultation_id]);

  const dateStr = visit.visit_date
    ? new Date(visit.visit_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-navy-dark text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Visit Summary</h2>
        <p className="text-xs text-gray-400 mb-4">{dateStr} · {visit.department ?? "General"}</p>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-gray-400 text-sm justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Chief Complaint */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Chief Complaint</p>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                {visit.chief_complaint || "—"}
              </p>
            </div>

            {/* Clinical Notes */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Clinical Notes</p>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3 py-2 whitespace-pre-wrap">
                {detail?.clinical_notes || "—"}
              </p>
            </div>

            {/* Prescription */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Pill className="w-3.5 h-3.5 text-green-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Prescription</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-2">
                {detail?.prescription_data ? (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                    {JSON.stringify(detail.prescription_data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400">—</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── View Detail Slide-Over ────────────────────────────────────────────────────

type DetailTab = "overview" | "clinical" | "prescription";

function DetailPanel({
  visit,
  onClose,
}: {
  visit: VisitHistoryItem;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<ConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  useEffect(() => {
    getConsultation(visit.consultation_id).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [visit.consultation_id]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const dateStr = visit.visit_date
    ? new Date(visit.visit_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: "clinical", label: "Clinical Notes", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "prescription", label: "Prescription", icon: <Pill className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-[600px] max-w-[90vw] bg-white dark:bg-surface-dark h-full flex flex-col shadow-2xl">
        {/* Panel header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-border-dark">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-border-dark" />
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Visit Details</h2>
            <p className="text-xs text-gray-400">{dateStr} · {visit.department ?? "General"}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-dark text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-200 dark:border-border-dark px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center gap-2 py-12 text-gray-400 text-sm justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading visit details...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="flex flex-col gap-4">
                  {visit.chief_complaint && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Chief Complaint</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{visit.chief_complaint}</p>
                    </div>
                  )}
                  {visit.diagnosis && (
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Diagnosis</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{visit.diagnosis}</p>
                    </div>
                  )}
                  {visit.treatment && (
                    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Treatment</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{visit.treatment}</p>
                    </div>
                  )}
                  {visit.summary && (
                    <div className="bg-gray-50 dark:bg-navy-dark/40 border border-gray-100 dark:border-border-dark rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Summary</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{visit.summary}</p>
                    </div>
                  )}
                  {!visit.chief_complaint && !visit.diagnosis && !visit.treatment && !visit.summary && (
                    <p className="text-sm text-gray-400 text-center py-8">No overview data recorded.</p>
                  )}
                </div>
              )}

              {activeTab === "clinical" && (
                <div>
                  {detail?.clinical_notes ? (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Clinical Notes</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {detail.clinical_notes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">No clinical notes recorded.</p>
                  )}
                </div>
              )}

              {activeTab === "prescription" && (
                <div>
                  {detail?.prescription_data ? (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Prescription Data</p>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {JSON.stringify(detail.prescription_data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">No prescription recorded.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── History Tab ───────────────────────────────────────────────────────────────

export function HistoryTab({ patientId, refreshKey }: HistoryTabProps) {
  const [history, setHistory] = useState<VisitHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryVisit, setSummaryVisit] = useState<VisitHistoryItem | null>(null);
  const [detailVisit, setDetailVisit] = useState<VisitHistoryItem | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(patientId);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading history...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 py-4">{error}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Visit History</h2>

        {history.length === 0 && (
          <p className="text-sm text-gray-400 py-6">No visit history found.</p>
        )}

        <ul className="space-y-3">
          {history.map((visit) => {
            const dateStr = visit.visit_date
              ? new Date(visit.visit_date).toISOString().slice(0, 10)
              : "—";

            return (
              <li key={visit.consultation_id} className="relative flex gap-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-navy-dark border-2 border-gray-200 dark:border-border-dark flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 dark:bg-border-dark mt-1" />
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dateStr}</p>
                      <p className="text-xs text-gray-400">{visit.department ?? "General"}</p>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSummaryVisit(visit)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-dark transition-colors"
                      >
                        <ClipboardList className="w-3 h-3" />
                        View Summary
                      </button>
                      <button
                        onClick={() => setDetailVisit(visit)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        View Detail
                      </button>
                    </div>
                  </div>

                  {visit.diagnosis && (
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                      Diagnosis: {visit.diagnosis}
                    </p>
                  )}
                  {visit.chief_complaint && (
                    <p className="text-xs text-gray-400 mt-1">
                      {visit.chief_complaint}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {summaryVisit && (
        <SummaryModal visit={summaryVisit} onClose={() => setSummaryVisit(null)} />
      )}
      {detailVisit && (
        <DetailPanel visit={detailVisit} onClose={() => setDetailVisit(null)} />
      )}
    </>
  );
}
