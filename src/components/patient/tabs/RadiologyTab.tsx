"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getRadiology, type RadiologyItem } from "@/lib/api/radiology";

interface RadiologyTabProps {
  patientId: string;
  isEditable: boolean;
}

export function RadiologyTab({ patientId, isEditable }: RadiologyTabProps) {
  const [reports, setReports] = useState<RadiologyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRadiology = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRadiology(patientId);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load radiology");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRadiology();
  }, [fetchRadiology]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading radiology...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 py-4">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Radiology & Imaging</h2>
        {isEditable && (
          <Button icon={<Upload className="w-4 h-4" />} className="text-xs py-1.5">
            Upload Report
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark border border-dashed border-gray-200 dark:border-border-dark rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <FileImage className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No radiology reports yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => {
            const uploadedDate = report.uploaded_at
              ? new Date(report.uploaded_at).toISOString().slice(0, 10)
              : "—";
            const notes = report.impression ?? report.findings ?? report.radiologist_notes ?? null;

            return (
              <li
                key={report.id}
                className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {report.type} — {report.body_part}
                    </p>
                    {notes && <p className="text-xs text-gray-400">{notes}</p>}
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">
                      Uploaded: {uploadedDate}
                    </p>
                  </div>
                </div>
                {report.file_url ? (
                  <a href={report.file_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="text-xs py-1.5">View</Button>
                  </a>
                ) : (
                  <Button variant="outline" className="text-xs py-1.5 opacity-40" disabled>
                    No file
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
