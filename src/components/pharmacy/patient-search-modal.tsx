"use client";

import { useState, useEffect } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PharmacistPatientView } from "@/lib/types";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { apiFetch } from "@/lib/api/client";

interface PatientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPatient: (patient: PharmacistPatientView) => void;
}

export function PatientSearchModal({ open, onClose, onSelectPatient }: PatientSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchPatients(searchQuery.trim());
        setResults(data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  const handleSelect = async (patient: PatientSearchResult) => {
    setIsLoading(true);
    try {
      // Fetch full pharmacist view for the selected patient
      const fullPatient = await apiFetch<PharmacistPatientView>(`/lookup/${patient.id}?view=pharmacy`);
      onSelectPatient(fullPatient);
      onClose();
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to fetch patient details:", error);
      // Fallback: at least pass what we have
      const fallbackPatient: PharmacistPatientView = {
        id: patient.id,
        uhid: patient.uhid,
        full_name: patient.full_name,
        age: patient.age,
        gender: (patient.gender?.toLowerCase() as "male" | "female" | "other") || null,
        allergies: [],
        current_medications: [],
        prescriptions: []
      };
      onSelectPatient(fallbackPatient);
      onClose();
      setSearchQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-surface-1 rounded-2xl shadow-modal overflow-hidden border border-border-subtle"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative border-b border-border-subtle">
                {isLoading ? (
                  <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-spin" strokeWidth={1.5} />
                ) : (
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" strokeWidth={1.5} />
                )}
                <input
                  type="text"
                  placeholder="Search patient by name, UHID, or phone number…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-14 pr-16 py-4 text-base text-text-primary placeholder:text-text-muted outline-none bg-transparent"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-secondary bg-surface-2 border border-border-subtle rounded">
                    ESC
                  </kbd>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-1">
                    {results.map((patient: PatientSearchResult) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelect(patient)}
                        className="w-full px-5 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3 text-left group"
                      >
                        <div
                          className="w-10 h-10 rounded-full grid place-items-center text-white font-semibold flex-shrink-0 text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--accent), var(--logo-to))",
                            boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                          }}
                        >
                          {getInitials(patient.full_name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">
                              {patient.full_name}
                            </p>
                            <span className="text-xs text-text-secondary">
                              {patient.age}y · {patient.gender}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted font-mono">
                            {patient.uhid} · {patient.phone}
                          </p>
                        </div>

                        <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-accent-soft text-accent text-[11px] font-semibold border border-accent/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-surface-2 flex items-center justify-center">
                      <User className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-0.5">
                      {searchQuery ? "No patients found" : "Start typing to search"}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {searchQuery
                        ? "Try searching by name, UHID, or phone number"
                        : "Search by patient name, UHID, or phone number"}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border-subtle px-5 py-2.5 bg-surface-2">
                <p className="text-[11px] text-text-muted">
                  <kbd className="px-1.5 py-0.5 bg-surface-1 border border-border-subtle rounded text-[10px] font-mono font-semibold mr-1">
                    ⌘K
                  </kbd>
                  to open search anywhere
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
