"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Search, FolderOpen, Loader2, ArrowRight, Users } from "lucide-react";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { Avatar } from "@/components/ui/Avatar";

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchPatients(searchQuery.trim());
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err: unknown) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleOpen = (p: PatientSearchResult) => router.push(`/patients/${p.patient_id}`);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Workspace", "Patients"]} />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Patient Directory</h1>
            <p className="text-text-secondary text-sm mt-1">
              Search and manage clinical records.
            </p>
          </div>

          <div className="bg-surface-1 border border-border-subtle rounded-xl shadow-soft p-6 relative z-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent grid place-items-center">
                <FolderOpen className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Open Patient File</h3>
                <p className="text-text-secondary text-xs mt-0.5">
                  Enter Name, UHID, or Phone Number to retrieve record.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients…"
                  className="w-full pl-11 pr-12 py-3 bg-surface-2 border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-4 flex items-center">
                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  </div>
                )}
              </div>

              {searchError && (
                <div className="mt-3 p-2.5 bg-danger-soft text-danger rounded-lg text-sm font-medium border border-danger/20">
                  {searchError}
                </div>
              )}

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-1 border border-border-subtle rounded-xl shadow-modal overflow-hidden z-30">
                  {searchResults.map((p) => (
                    <button
                      key={p.patient_id}
                      onClick={() => handleOpen(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-0 group"
                    >
                      <Avatar name={p.full_name || "?"} role="staff" size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm truncate">{p.full_name}</p>
                        <p className="text-xs text-text-muted truncate font-mono">
                          {p.uhid} · {p.phone}
                        </p>
                      </div>
                      <div className="text-text-muted group-hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-12 text-center text-text-muted border-2 border-dashed border-border-subtle rounded-2xl">
            <div className="max-w-sm">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-text-secondary">Directory Idle</p>
              <p className="text-xs mt-1">
                Search for a patient above to load their longitudinal clinical record.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
