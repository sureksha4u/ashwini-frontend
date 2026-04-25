"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getQueue } from "@/lib/api/queue";
import type { QueuePatient, PatientStatus } from "@/lib/types/patient";

type QueueFilter = "All" | "Waiting" | "Done";

const filterMatch: Record<QueueFilter, PatientStatus[]> = {
  All: ["Waiting", "In Consultation", "Completed", "X-Ray Pending", "Done"],
  Waiting: ["Waiting", "In Consultation", "X-Ray Pending"],
  Done: ["Completed", "Done"],
};

export function PatientQueue() {
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("All");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQueue();
      setQueue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const waitingCount = queue.filter((q) => filterMatch["Waiting"].includes(q.status)).length;
  const filtered = queue.filter((q) => filterMatch[activeFilter].includes(q.status));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Patient Queue</h2>
          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
            {waitingCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 dark:border-border-dark overflow-hidden text-xs">
            {(["All", "Waiting", "Done"] as QueueFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  activeFilter === f
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-dark"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            icon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchQueue}
            disabled={loading}
            className="text-xs py-1.5"
          >
            Refresh
          </Button>

          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            OPD Active
          </span>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading queue...
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-sm text-red-500">
          {error} —{" "}
          <button onClick={fetchQueue} className="underline hover:text-red-600">
            retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {filtered.map((q) => (
            <PatientCard key={q.consultationId} queuePatient={q} onRefresh={fetchQueue} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 py-6 px-2">No patients in this category.</p>
          )}
        </div>
      )}
    </section>
  );
}
