"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Search, Pill, Plus, Maximize2, X } from "lucide-react";
import type { Medicine } from "@/lib/types/prescription";
import { AnnotationCanvas, type AnnotationCanvasHandle } from "@/components/annotation/AnnotationCanvas";
import type { AnnotationState } from "@/components/annotation/types";
import { saveAnnotation, getAnnotation } from "@/lib/api/annotation";

const QUICK_ADD = ["Paracetamol", "Ibuprofen", "Calcium", "Diclofenac"];

interface PrescriptionTabProps {
  patientId: string;
  consultationId: string | null;
  isEditable: boolean;
  /** Doctor's specialty — determines which annotation template is shown */
  doctorSpecialty?: string | null;
}

export interface PrescriptionTabHandle {
  save: () => Promise<void>;
}

export const PrescriptionTab = forwardRef<PrescriptionTabHandle, PrescriptionTabProps>(
  function PrescriptionTab({ patientId: _patientId, consultationId, isEditable, doctorSpecialty }, ref) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [medicineSearch, setMedicineSearch] = useState("");
    const [clinicalFindings, setClinicalFindings] = useState("");
    const [annotationState, setAnnotationState] = useState<AnnotationState | null>(null);
    const [canvasEnlarged, setCanvasEnlarged] = useState(false);

    const canvasRef = useRef<AnnotationCanvasHandle>(null);
    const enlargedCanvasRef = useRef<AnnotationCanvasHandle>(null);

    // Load existing annotation + saved prescription data when consultation changes
    useEffect(() => {
      if (!consultationId) return;
      getAnnotation(consultationId).then((result) => {
        if (!result) return;
        // result may carry extra fields beyond AnnotationState
        const ext = result as AnnotationState & { clinical_findings?: string; medicines?: Medicine[] };
        setAnnotationState(result);
        if (ext.clinical_findings) setClinicalFindings(ext.clinical_findings);
        if (ext.medicines) setMedicines(ext.medicines);
      });
    }, [consultationId]);

    // Expose save() so parent can call it on End Consultation
    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!consultationId) return;
        // Prefer the enlarged canvas ref if modal is open, else main canvas
        const activeRef = canvasEnlarged ? enlargedCanvasRef : canvasRef;
        if (!activeRef.current) return;
        try {
          const state = activeRef.current.getState();
          const snapshot = await activeRef.current.captureSnapshot();
          await saveAnnotation(consultationId, state, snapshot, clinicalFindings, medicines);
          setAnnotationState(state);
        } catch (err) {
          console.error("Failed to auto-save prescription", err);
        }
      },
    }));

    function handleCloseEnlarged() {
      // Sync state from enlarged canvas back before closing
      if (enlargedCanvasRef.current) {
        const latestState = enlargedCanvasRef.current.getState();
        setAnnotationState(latestState);
      }
      setCanvasEnlarged(false);
    }

    function addMedicine(name: string) {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name,
        dosage: "",
        frequency: "1-0-1",
        duration: "5 days",
      };
      setMedicines((prev) => [...prev, newMed]);
    }

    return (
      <>
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Left: Annotation canvas + Diagnosis */}
          <div className="flex flex-col gap-4">
            {/* Annotation Canvas */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Annotation Canvas</span>
                {consultationId && (
                  <button
                    onClick={() => setCanvasEnlarged(true)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    title="Open full-screen editable canvas"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Enlarge
                  </button>
                )}
              </div>

              <AnnotationCanvas
                specialty={doctorSpecialty}
                initialState={annotationState}
                isEditable={isEditable && !!consultationId}
                isEnlarged={false}
                onChange={setAnnotationState}
                canvasRef={canvasRef}
              />
            </div>

            {/* Diagnosis */}
            <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Diagnosis & Clinical Findings
                {isEditable && <span className="text-primary ml-1">*</span>}
              </h3>
              <textarea
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
                disabled={!isEditable}
                placeholder="Enter comprehensive diagnosis, patient symptoms, and clinical findings..."
                rows={6}
                className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Right: Medicine search + prescription list */}
          <div className="flex flex-col gap-3">
            {/* Medicine search */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  disabled={!isEditable}
                  placeholder="Search medicines to prescribe..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background-light dark:bg-navy-dark border border-gray-200 dark:border-border-dark rounded-lg outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Quick Add:</span>
                {QUICK_ADD.map((med) => (
                  <button
                    key={med}
                    disabled={!isEditable}
                    onClick={() => addMedicine(med)}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-border-dark text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>

            {/* Current prescription */}
            <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Current Prescription</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-navy-dark px-2 py-0.5 rounded-full">
                  {medicines.length} items
                </span>
              </div>

              {medicines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-navy-dark flex items-center justify-center mb-2">
                    <Pill className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Prescription is empty</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {medicines.map((med) => (
                    <li
                      key={med.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-border-dark last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{med.name}</p>
                        <p className="text-xs text-gray-400">
                          {med.frequency} &bull; {med.duration}
                        </p>
                      </div>
                      {isEditable && (
                        <button
                          onClick={() => setMedicines((prev) => prev.filter((m) => m.id !== med.id))}
                          className="text-gray-300 hover:text-red-400 transition-colors ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isEditable && (
                <button
                  onClick={() => addMedicine("New Medicine")}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 dark:border-border-dark rounded-lg text-xs text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add medicine
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enlarged Annotation Canvas Modal — covers 70%+ of the screen */}
        {canvasEnlarged && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
              className="flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden"
              style={{ width: "min(92vw, 1200px)", height: "min(90vh, 900px)" }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Annotation Canvas</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isEditable ? "Editable — changes sync back to the consultation" : "Read-only view"}
                  </p>
                </div>
                <button
                  onClick={handleCloseEnlarged}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-navy-dark text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-dark/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </button>
              </div>

              {/* Enlarged canvas — fills remaining height */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnnotationCanvas
                  specialty={doctorSpecialty}
                  initialState={annotationState}
                  isEditable={isEditable && !!consultationId}
                  isEnlarged={true}
                  onChange={setAnnotationState}
                  canvasRef={enlargedCanvasRef}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);
