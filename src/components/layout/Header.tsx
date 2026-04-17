"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPatients(query.trim());
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  function handleSelect(patient: PatientSearchResult) {
    setQuery("");
    setOpen(false);
    router.push(`/patients/${patient.patient_id}`);
  }

  return (
    <header className="h-14 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search patients, appointments..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-background-light dark:bg-navy-dark border border-gray-200 dark:border-border-dark rounded-lg outline-none focus:ring-2 focus:ring-primary/30 dark:text-gray-200 dark:placeholder-gray-500"
        />

        {/* Dropdown */}
        {open && results.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto">
            {results.map((p) => (
              <li key={p.patient_id}>
                <button
                  onMouseDown={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background-light dark:hover:bg-navy-dark transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                    {p.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.full_name}</p>
                    <p className="text-xs text-gray-400">{p.uhid} · {p.phone}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && query && results.length === 0 && !searching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400 z-50">
            No patients found
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-dark text-gray-500 dark:text-gray-400">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            AM
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dr. Anil Mehta</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orthopedic Surgeon</p>
          </div>
        </div>
      </div>
    </header>
  );
}
