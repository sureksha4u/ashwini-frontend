"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { 
  UserPlus, Settings, Users, Activity, BarChart3, Mail, 
  Shield, ArrowRight, X, Loader2, CheckCircle2,
  FolderOpen, Search
} from "lucide-react";
import { inviteUser, getMe } from "@/lib/api/users";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import type { UserResponse } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  
  // --- User & RBAC State ---
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // --- Invitation Modal State ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; token?: string; error?: string } | null>(null);

  // --- Patient "File" Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((err) => {
        console.error("Auth failed:", err);
        router.push("/");
      })
      .finally(() => setIsLoadingUser(false));
  }, [router]);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteResult(null);
    try {
      const res = await inviteUser({
        email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
      });
      setInviteResult({ success: true, token: res.invitation_token });
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
    } catch (err: any) {
      setInviteResult({ success: false, error: err.message || "Failed to send invitation" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleOpenPatientFile = (patient: PatientSearchResult) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    router.push(`/patients/${patient.patient_id}`);
  };

  if (isLoadingUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden p-8 gap-8 max-w-7xl mx-auto w-full">
        {/* Section 1: Patient File Retrieval */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative z-20">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A]">Open Patient File</h3>
              <p className="text-slate-500 font-medium">Access comprehensive clinical records and active prescriptions.</p>
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
                placeholder="Search by Name, UHID, or Phone Number..."
                className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] text-lg focus:outline-none focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB] transition-all placeholder:text-slate-400"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-6 flex items-center">
                  <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
                </div>
              )}
            </div>

            {searchError && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {typeof searchError === 'string' ? searchError : (searchError as any)?.message ?? "Search encountered an error."}
              </div>
            )}

            {/* Search Results Dropdown */}
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

        {/* Section 2: Dashboard Content */}
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 pb-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 text-[#2563EB]">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Total Registrations</p>
              <h3 className="text-3xl font-bold text-[#0F172A] mt-2">1,284</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 text-indigo-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">OP Volume (Today)</p>
              <h3 className="text-3xl font-bold text-[#0F172A] mt-2">42</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 text-amber-600">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Active Staff</p>
              <h3 className="text-3xl font-bold text-[#0F172A] mt-2">12</h3>
            </div>
          </div>

          {/* Admin Section */}
          {user?.is_admin && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 min-h-[300px] flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Organization Management</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Manage infrastructure, roles, and professional onboarding.</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-[#0F172A] hover:bg-[#1e293b] text-white px-7 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-slate-100"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite New User
                </button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-[2rem] mb-6 text-slate-200 border border-slate-100">
                  <Settings className="w-10 h-10" />
                </div>
                <p className="text-base font-bold text-slate-900">Workspace Ready</p>
                <p className="text-sm font-medium max-w-xs mt-2 italic">Select a module or staff member to begin administration.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0F172A]">Invite Professional</h3>
              <button onClick={() => { setShowInviteModal(false); setInviteResult(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {!inviteResult ? (
                <form onSubmit={handleInvite} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        value={inviteFirstName}
                        onChange={(e) => setInviteFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        value={inviteLastName}
                        onChange={(e) => setInviteLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                        placeholder="Smith" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                        placeholder="colleague@hospital.com" 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isInviting}
                    className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                  >
                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Invitation <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              ) : inviteResult.success ? (
                <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                  <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Invitation Sent</h4>
                  <p className="text-sm text-slate-500 mt-2">A secure invitation link has been generated.</p>
                  
                  <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Invitation Link</label>
                    <code className="text-xs text-[#2563EB] break-all font-mono">
                      {window.location.origin}/onboard?token={inviteResult.token}
                    </code>
                  </div>
                  <button 
                    onClick={() => { setShowInviteModal(false); setInviteResult(null); }}
                    className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-500 font-medium mb-4">{inviteResult.error}</p>
                  <button 
                    onClick={() => setInviteResult(null)}
                    className="w-full bg-slate-100 py-3 rounded-xl font-bold text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
