"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { 
  Search, FolderOpen, Loader2, ArrowRight, User, Users
} from "lucide-react";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchPatients(searchQuery.trim());
        setSearchResults(data);
        setShowSearchDropdown(true);
      } catch (err: any) {
        setSearchError(err.message || "Search failed");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleOpenPatientFile = (patient: PatientSearchResult) => {
    router.push(`/patients/${patient.patient_id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <Header />
      <main className="flex-1 overflow-hidden p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Patient Directory</h1>
            <p className="text-slate-500 font-medium mt-1">Search and manage clinical records.</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative z-20">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A]">Open Patient File</h3>
              <p className="text-slate-500 font-medium">Enter Name, UHID, or Phone Number to retrieve record.</p>
            </div>
          </div>

          <div className="relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] text-lg focus:outline-none focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-6 flex items-center">
                  <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
                </div>
              )}
            </div>

            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-[2rem] shadow-[0_30px_60px_rgba(15,23,42,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-30">
                {searchResults.map((p) => (
                  <button
                    key={p.patient_id}
                    onClick={() => handleOpenPatientFile(p)}
                    className="w-full flex items-center gap-5 px-8 py-5 text-left hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-lg">
                      {p.full_name?.charAt(0) || "P"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F172A] text-base">{p.full_name}</p>
                      <p className="text-sm text-slate-500 font-medium tracking-wide">{p.uhid} • {p.phone}</p>
                    </div>
                    <div className="bg-slate-100 group-hover:bg-[#2563EB] group-hover:text-white p-2 rounded-xl transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
          <div className="max-w-xs">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-400">Directory Idle</p>
            <p className="text-sm mt-1">Search for a patient above to load their longitudinal clinical record.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
