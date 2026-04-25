"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  startConsultation, 
  endConsultation, 
  getLatestConsultation,
  syncConsultation,
  type ConsultationSyncPayload,
  type ConsultationResponse
} from "@/lib/api/consultation";

const SYNC_INTERVAL_MS = 15_000;

export function useConsultation(patientId: string) {
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isDirty = useRef(false);
  const syncPayloadRef = useRef<ConsultationSyncPayload>({});

  const isActive = consultation?.state === "in_consultation";
  const isCalling = consultation?.state === "calling";

  const fetchLatest = useCallback(async () => {
    try {
      const data = await getLatestConsultation(patientId);
      setConsultation(data);
    } catch (err) {
      console.error("Failed to fetch latest consultation:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // Auto-save logic
  useEffect(() => {
    if (!isActive || !consultation?.consultation_id) return;

    const id = setInterval(async () => {
      if (!isDirty.current) return;
      await forceSave();
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isActive, consultation?.consultation_id]);

  const markDirty = useCallback(() => {
    isDirty.current = true;
  }, []);

  const updatePayload = useCallback((patch: Partial<ConsultationSyncPayload>) => {
    syncPayloadRef.current = { ...syncPayloadRef.current, ...patch };
    markDirty();
  }, [markDirty]);

  const forceSave = async () => {
    if (!consultation?.consultation_id || !isDirty.current) return;
    
    setIsSyncing(true);
    isDirty.current = false;
    try {
      const updated = await syncConsultation(consultation.consultation_id, syncPayloadRef.current);
      setConsultation(updated);
    } catch (err) {
      isDirty.current = true;
      console.error("[auto-save] sync failed:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const start = async () => {
    setLoading(true);
    try {
      const result = await startConsultation(patientId);
      setConsultation(result);
      syncPayloadRef.current = {}; // Reset payload on start
      isDirty.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start consultation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const end = async (finalData?: { diagnosis?: string; treatment_plan?: string; clinical_notes?: string }) => {
    if (!consultation?.consultation_id) return;
    setLoading(true);
    try {
      await forceSave();
      const result = await endConsultation(consultation.consultation_id, finalData);
      setConsultation(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end consultation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    consultation,
    isActive,
    isCalling,
    loading,
    error,
    isSyncing,
    start,
    end,
    updatePayload,
    markDirty,
    forceSave,
    refresh: fetchLatest
  };
}
