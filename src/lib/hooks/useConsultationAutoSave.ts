"use client";

import { useEffect, useRef } from "react";
import { syncConsultation, type ConsultationSyncPayload } from "@/lib/api/consultation";

const SYNC_INTERVAL_MS = 12_000; // 12 seconds

export interface AutoSaveHandle {
  markDirty: () => void;
  forceSave: () => Promise<void>;
}

/**
 * Periodically syncs consultation data to the backend while a consultation is active.
 *
 * Usage:
 *   const autoSave = useConsultationAutoSave(consultationId, () => buildPayload());
 *   // call autoSave.markDirty() on every form change
 *   // call await autoSave.forceSave() before ending the consultation
 */
export function useConsultationAutoSave(
  consultationId: string | null,
  getPayload: () => ConsultationSyncPayload
): AutoSaveHandle {
  const isDirty = useRef(false);
  // Keep a ref that always points to the latest getPayload without needing to restart the interval
  const getPayloadRef = useRef(getPayload);
  useEffect(() => { getPayloadRef.current = getPayload; });

  const consultationIdRef = useRef(consultationId);
  useEffect(() => { consultationIdRef.current = consultationId; });

  useEffect(() => {
    if (!consultationId) return;

    const id = setInterval(async () => {
      if (!isDirty.current || !consultationIdRef.current) return;
      isDirty.current = false;
      try {
        await syncConsultation(consultationIdRef.current, getPayloadRef.current());
      } catch (err) {
        // Mark dirty again so next tick retries
        isDirty.current = true;
        console.error("[auto-save] sync failed, will retry:", err);
      }
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(id);
  }, [consultationId]);

  const markDirty = () => { isDirty.current = true; };

  const forceSave = async () => {
    if (!isDirty.current || !consultationIdRef.current) return;
    isDirty.current = false;
    try {
      await syncConsultation(consultationIdRef.current, getPayloadRef.current());
    } catch (err) {
      isDirty.current = true;
      console.error("[auto-save] force-save failed:", err);
      throw err;
    }
  };

  return { markDirty, forceSave };
}
