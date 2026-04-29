"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Search, Loader2, Building, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { getMe } from "@/lib/api/users";
import type { UserResponse } from "@/lib/types";
import type { UserRole } from "@/lib/types/role";
import { Avatar } from "@/components/ui/Avatar";
import { RoleChip } from "@/components/ui/RoleChip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CommandK } from "@/components/ui/CommandK";
import { NotificationsPanel } from "@/components/ui/NotificationsPanel";

interface HeaderProps {
  breadcrumb?: string[];
  hospital?: string;
}

function roleSlug(user: UserResponse | null): string {
  if (!user) return "staff";
  const u = user as unknown as { role?: UserRole; is_admin?: boolean };
  if (u.is_admin || u.role === "ADMIN") return "admin";
  return (u.role || "STAFF").toLowerCase();
}

export function Header({ breadcrumb = ["Workspace"], hospital = "Tilak Nagar" }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen(v => !v);
      }
      if (e.key === "Escape") {
        setCmdkOpen(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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

  const handleSelect = (p: PatientSearchResult) => {
    setQuery("");
    setOpen(false);
    router.push(`/patients/${p.patient_id}`);
  };

  const fullName =
    user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email : "";

  return (
    <>
      <header
        className="h-14 flex-shrink-0 glass border-b border-border-subtle flex items-center px-5 gap-4 sticky top-0 z-40"
        style={{ background: "var(--header-bg)" }}
      >
        <nav className="flex items-center gap-2 text-[13px]">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-text-muted">/</span>}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary font-medium"
                }
              >
                {b}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="relative w-[320px]">
          <div
            className="flex items-center gap-2 px-3 h-[34px] rounded-lg bg-surface-2 border border-border-subtle text-text-muted text-[13px] cursor-pointer"
            onClick={() => setCmdkOpen(true)}
          >
            <Search size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => { e.stopPropagation(); setQuery(e.target.value); }}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search patients, UHID, +91…"
              className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted min-w-0 cursor-pointer"
              readOnly
              onClick={e => { e.stopPropagation(); setCmdkOpen(true); }}
            />
            {searching ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-surface-1 border border-border-subtle text-[10px] font-mono font-semibold text-text-secondary">
                ⌘K
              </span>
            )}
          </div>

          {open && results.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1.5 bg-surface-1 border border-border-subtle rounded-lg shadow-modal overflow-hidden z-50 max-h-72 overflow-y-auto">
              {results.map((p) => (
                <li key={p.patient_id}>
                  <button
                    onMouseDown={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 transition-colors"
                  >
                    <Avatar name={p.full_name || "?"} role="staff" size={28} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        {p.full_name}
                      </p>
                      <p className="text-[11px] text-text-muted truncate">
                        {p.uhid} · {p.phone}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {open && query && results.length === 0 && !searching && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-1 border border-border-subtle rounded-lg shadow-modal px-3 py-2.5 text-[13px] text-text-muted z-50">
              No patients found
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 px-2.5 h-[30px] rounded-md bg-surface-2 border border-border-subtle text-xs text-text-secondary font-medium">
          <Building size={13} />
          <span>{hospital}</span>
          <ChevronDown size={12} />
        </div>

        <ThemeToggle />

        <button
          aria-label="Notifications"
          onClick={() => setNotifOpen(v => !v)}
          className="w-9 h-9 rounded-lg border border-border-subtle bg-surface-1 text-text-secondary grid place-items-center hover:bg-surface-2 transition-colors relative"
        >
          <Bell size={15} strokeWidth={1.5} />
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-danger text-white text-[9px] font-bold grid place-items-center">
            4
          </span>
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-2">
            <Avatar name={fullName || "User"} role={roleSlug(user)} size={32} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-text-primary leading-tight">
                {fullName || user.email}
              </span>
              <RoleChip role={roleSlug(user)} />
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </div>
        )}
      </header>

      <CommandK open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
