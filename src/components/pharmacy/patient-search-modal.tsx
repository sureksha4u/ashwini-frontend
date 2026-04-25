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
            className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E2E8F0]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="relative border-b border-[#E2E8F0]">
                {isLoading ? (
                  <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2563EB] animate-spin" strokeWidth={1.25} />
                ) : (
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" strokeWidth={1.25} />
                )}
                <input
                  type="text"
                  placeholder="Search patient by name, UHID, or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-14 pr-6 py-5 text-lg text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((patient: PatientSearchResult) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelect(patient)}
                        className="w-full px-5 py-4 hover:bg-[#F8FAFC] transition-colors flex items-center gap-4 text-left group"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white font-medium flex-shrink-0 shadow-lg shadow-blue-500/20">
                          {getInitials(patient.full_name)}
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                              {patient.full_name}
                            </p>
                            <span className="text-xs text-[#64748B]">
                              {patient.age}y • {patient.gender}
                            </span>
                          </div>
                          <p className="text-sm text-[#64748B] mb-1">{patient.uhid}</p>
                          <p className="text-xs text-[#94A3B8]">{patient.phone}</p>
                        </div>

                        {/* Select Hint */}
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Select Patient
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                      <User className="w-8 h-8 text-[#CBD5E1]" strokeWidth={1.25} />
                    </div>
                    <h3 className="text-lg font-medium text-[#0F172A] mb-1">
                      {searchQuery ? 'No patients found' : 'Start typing to search'}
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      {searchQuery 
                        ? 'Try searching by name, UHID, or phone number' 
                        : 'Search by patient name, UHID, or phone number'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="border-t border-[#E2E8F0] px-5 py-3 bg-[#F8FAFC]">
                <p className="text-xs text-[#64748B]">
                  <kbd className="px-1.5 py-0.5 bg-white border border-[#E2E8F0] rounded text-[10px] font-medium">
                    ⌘K
                  </kbd>
                  {' '}to open search anywhere
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
