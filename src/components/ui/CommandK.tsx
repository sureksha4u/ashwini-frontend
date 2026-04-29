"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Pill, Receipt, Moon, Loader2, X } from "lucide-react";
import { searchPatients, type PatientSearchResult } from "@/lib/api/patients";
import { Avatar } from "@/components/ui/Avatar";

interface CommandKProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { icon: User, label: "Register new patient", kbd: "⌘ N", href: "/reception/register" },
  { icon: Pill, label: "Open dispensing queue", kbd: "⌘ D", href: "/pharmacy/dispensing" },
  { icon: Receipt, label: "Create invoice", kbd: "⌘ I", href: "/billing/queue" },
  { icon: Moon, label: "Toggle dark mode", kbd: "⌘ ⇧ L", action: "theme" },
];

export function CommandK({ open, onClose }: CommandKProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchPatients(query.trim()));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [query]);

  function handleSelect(p: PatientSearchResult) {
    onClose();
    router.push(`/patients/${p.patient_id}`);
  }

  function handleAction(href?: string, action?: string) {
    onClose();
    if (action === "theme") {
      document.documentElement.classList.toggle("dark");
    } else if (href) {
      router.push(href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[640px] bg-surface-1 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Escape" && onClose()}
            placeholder="Search patients, UHID, actions…"
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none"
          />
          {searching
            ? <Loader2 size={14} className="animate-spin text-text-muted" />
            : <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={15} /></button>
          }
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {/* Patient results */}
          {results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle bg-surface-2">
                Patients
              </div>
              {results.map(p => (
                <button
                  key={p.patient_id}
                  onMouseDown={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-b-0"
                >
                  <Avatar name={p.full_name || "?"} role="staff" size={36} />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[13px] font-semibold text-text-primary truncate">{p.full_name}</div>
                    <div className="text-[11px] text-text-muted truncate">{p.uhid} · {p.phone}</div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-border-subtle">↵</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && !searching && (
            <div className="px-4 py-3 text-[13px] text-text-muted">No patients found for "{query}"</div>
          )}

          {/* Quick actions */}
          <div>
            <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle bg-surface-2">
              Quick actions
            </div>
            {QUICK_ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onMouseDown={() => handleAction(a.href, a.action)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors border-b border-border-subtle last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-text-secondary" />
                  </div>
                  <span className="flex-1 text-left text-[13px] font-medium text-text-primary">{a.label}</span>
                  <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-border-subtle">{a.kbd}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border-subtle bg-surface-2 text-[10.5px] text-text-muted">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
          <div className="flex-1" />
          <span className="font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
}
