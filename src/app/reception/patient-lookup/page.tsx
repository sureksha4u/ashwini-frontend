"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Btn } from "@/components/ui/Btn";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";

export default function PatientLookupPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [timing, setTiming] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      setTiming(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const t0 = performance.now();
      try {
        const data = await searchPatients(value.trim());
        setResults(data);
        setTiming(Math.round(performance.now() - t0));
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Reception", "Lookup"]} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold text-text-primary tracking-tight text-center mb-1.5">
            Find a patient
          </h1>
          <p className="text-text-secondary text-sm text-center mb-8">
            Search by name, UHID, +91 phone or Aadhaar last-4. Scoped to your hospital.
          </p>

          <div className="relative mb-6">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-surface-1 border-2 border-accent ring-4 ring-accent/10 shadow-sm">
              <Search className="w-6 h-6 text-accent flex-shrink-0" strokeWidth={1.8} />
              <input
                autoFocus
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search patients…"
                className="flex-1 bg-transparent text-lg text-text-primary placeholder:text-text-muted outline-none"
              />
              {searching ? (
                <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
              ) : timing != null ? (
                <span className="text-xs text-text-muted font-mono">{results.length} results in {timing}ms</span>
              ) : null}
            </div>
          </div>

          {searched && results.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {results.map((p) => (
                <Card
                  key={p.patient_id}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-2 transition-colors group"
                  onClick={() => router.push(`/patients/${p.patient_id}`)}
                >
                  <Avatar name={p.full_name || "?"} role="receptionist" size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-text-primary">{p.full_name}</span>
                      <span className="text-sm text-text-muted">
                        · {p.age ? `${p.age}y` : "—"} · {p.gender || "—"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-text-muted mt-1 font-mono">
                      <span>{p.uhid}</span>
                      {p.phone && <span>{p.phone}</span>}
                    </div>
                  </div>
                  <Btn variant="secondary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open file
                  </Btn>
                </Card>
              ))}
            </div>
          )}

          {searched && results.length === 0 && !searching && (
            <Card className="text-center py-10 text-text-muted mb-6">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-semibold text-text-secondary">No patients found</p>
              <p className="text-xs mt-1">Try a different name, UHID, or phone number.</p>
            </Card>
          )}

          <div
            className="mt-2 p-4 rounded-xl border-2 border-dashed border-border-strong text-center cursor-pointer hover:border-accent hover:bg-accent-soft/30 transition-colors group"
            onClick={() => router.push("/reception/register")}
          >
            <span className="text-sm text-text-secondary group-hover:text-text-primary">
              Not finding the patient?{" "}
            </span>
            <span className="text-sm text-accent font-semibold inline-flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Register new patient →
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
