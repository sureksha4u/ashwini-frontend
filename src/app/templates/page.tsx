"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Pill, FlaskConical, Calendar, MoreHorizontal, Loader2, Copy, Trash2, Edit, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { listTemplates, cloneTemplate, archiveTemplate, type TemplateRecord } from "@/lib/api/templates";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "GP", "Cardio", "Endo", "ENT", "GI", "Resp"];

function tagFromTemplate(t: TemplateRecord): string {
  const name = t.template_name.toLowerCase();
  if (name.includes("htn") || name.includes("hypert") || name.includes("cardio")) return "Cardio";
  if (name.includes("dm") || name.includes("diabet") || name.includes("endo")) return "Endo";
  if (name.includes("pharyngi") || name.includes("ent") || name.includes("throat")) return "ENT";
  if (name.includes("gerd") || name.includes("gi") || name.includes("gastro")) return "GI";
  if (name.includes("asthma") || name.includes("resp") || name.includes("lung")) return "Resp";
  return "GP";
}

function TemplateCard({ tpl, onClone, onDelete }: {
  tpl: TemplateRecord;
  onClone: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const d = tpl.template_data;
  const meds = d.medicines ?? [];
  const labs = d.labs ?? [];

  return (
    <div className="bg-surface-1 border border-border-subtle rounded-xl p-4 relative hover:shadow-soft-hover transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-text-primary truncate">{tpl.template_name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-[10px] font-semibold text-text-secondary">
              {tagFromTemplate(tpl)}
            </span>
            <span className="text-[10.5px] text-text-muted font-mono">v{tpl.version}</span>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((p) => !p)} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 w-40 bg-surface-1 border border-border-subtle rounded-lg shadow-modal z-10 overflow-hidden">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:bg-surface-2 transition-colors"
                onClick={() => { router.push(`/templates/${tpl.template_id}/edit`); setMenuOpen(false); }}>
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:bg-surface-2 transition-colors"
                onClick={() => { onClone(); setMenuOpen(false); }}>
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-danger hover:bg-danger-soft transition-colors"
                onClick={() => { onDelete(); setMenuOpen(false); }}>
                <Trash2 className="w-3 h-3" /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {d.symptoms && (
        <div className="text-[11.5px] text-text-secondary bg-surface-2 px-2.5 py-2 rounded-md mb-3 line-clamp-2 leading-relaxed">
          {d.symptoms}
        </div>
      )}

      {d.diagnosis && (
        <div className="text-[11.5px] text-text-primary mb-3">
          <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase mr-1.5">DX</span>
          {d.diagnosis}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {meds.slice(0, 3).map((m, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded bg-surface-2 text-[10.5px] text-text-primary font-medium">
            {m.drug.split(" ")[0]}
          </span>
        ))}
        {meds.length > 3 && <span className="text-[10.5px] text-text-muted font-mono px-1.5 py-0.5">+{meds.length - 3} more</span>}
      </div>

      <div className="flex items-center gap-3 pt-2.5 border-t border-border-subtle text-xs text-text-secondary">
        <span className="flex items-center gap-1"><Pill className="w-3 h-3" /> {meds.length}</span>
        <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3" /> {labs.length}</span>
        {d.follow_up_days && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {d.follow_up_days}d</span>}
        <div className="flex-1" />
        <span className="text-text-muted font-mono text-[10.5px]">{new Date(tpl.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
      </div>

      <div className="flex gap-1.5 mt-3">
        <button onClick={() => router.push(`/templates/${tpl.template_id}/edit`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-text-secondary border border-border-subtle hover:bg-surface-2 transition-colors">
          <Edit className="w-3 h-3" /> Edit
        </button>
        <button onClick={onClone}
          className="flex items-center justify-center px-2 py-1.5 rounded-lg text-xs text-text-secondary border border-border-subtle hover:bg-surface-2 transition-colors">
          <Copy className="w-3 h-3" />
        </button>
        <button onClick={onDelete}
          className="flex items-center justify-center px-2 py-1.5 rounded-lg text-xs text-danger border border-border-subtle hover:bg-danger-soft transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listTemplates()
      .then(setTemplates)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleClone(id: string) {
    try { await cloneTemplate(id); load(); } catch { /* ignore */ }
  }
  async function handleDelete(id: string) {
    try { await archiveTemplate(id); load(); } catch { /* ignore */ }
  }

  const filtered = templates.filter((t) => {
    const matchCat = category === "All" || tagFromTemplate(t) === category;
    const matchSearch = !search || (
      t.template_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.template_data.symptoms ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.template_data.diagnosis ?? "").toLowerCase().includes(search.toLowerCase())
    );
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Workspace", "Templates"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Templates</h1>
            <p className="text-sm text-text-secondary mt-1">
              Saved bundles of complaint, diagnosis, meds, labs, follow-up & instructions. Apply one during a consult to auto-fill the entire Rx board.
            </p>
          </div>
          <Btn variant="secondary" size="sm" icon={<Upload className="w-3.5 h-3.5" />}>Import</Btn>
          <Btn size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => router.push("/templates/new")}>New template</Btn>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            ["Total templates", String(templates.length), "+3 this month", "text-accent"],
            ["Applied this month", "186", "+24%", "text-success"],
            ["Time saved (est)", `${templates.reduce((a, t) => a + (t.template_data.medicines?.length ?? 0), 0) * 45 / 60 | 0}m`, "vs typing", "text-success"],
            ["Most used", templates[0]?.template_name?.split("—")[0].trim() ?? "—", `v${templates[0]?.version ?? 1}`, "text-text-primary"],
          ].map(([k, v, sub, color]) => (
            <Card key={k}>
              <div className="text-[10.5px] font-bold text-text-muted tracking-widest uppercase">{k}</div>
              <div className={cn("text-2xl font-semibold font-mono mt-1.5", color)}>{v}</div>
              <div className="text-xs text-text-secondary mt-0.5">{sub}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
            <input
              className="h-9 pl-9 pr-3 w-full rounded-lg bg-surface-1 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent"
              placeholder="Search by name, symptom, diagnosis…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                  category === c ? "bg-text-primary text-white border-text-primary" : "bg-surface-1 text-text-secondary border-border-subtle hover:bg-surface-2",
                )}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <span className="text-xs text-text-secondary">Sort: <span className="text-text-primary font-medium">Most recent</span></span>
        </div>

        {loading && <div className="flex items-center justify-center py-20 gap-2 text-text-muted"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span></div>}
        {error && <div className="p-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}

        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TemplateCard key={t.template_id} tpl={t} onClone={() => handleClone(t.template_id)} onDelete={() => handleDelete(t.template_id)} />
            ))}
            <button onClick={() => router.push("/templates/new")}
              className="border border-dashed border-border-strong rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[220px] hover:bg-surface-1 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-text-primary">Create a new template</div>
              <div className="text-xs text-text-secondary text-center max-w-[200px]">Or save the current consult as a template from the Rx board.</div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
