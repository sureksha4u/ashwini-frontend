"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, MoreHorizontal, ClipboardList, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { apiFetch } from "@/lib/api/client";

interface TemplateData {
  medicines?: Array<{ name: string; dosage?: string; duration?: string }>;
  instructions?: string;
  special_notes?: string;
  follow_up_days?: number;
}

interface PrescriptionTemplate {
  template_id: string;
  doctor_id: string;
  procedure_type_id: string;
  template_name: string;
  description?: string;
  template_data: TemplateData;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function getTemplates(): Promise<PrescriptionTemplate[]> {
  return apiFetch<PrescriptionTemplate[]>("/templates");
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load templates"))
      .finally(() => setLoading(false));
  }, []);

  const totalUses = templates.reduce((acc) => acc, 0); // placeholder

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Doctor", "Templates"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Prescription templates
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Personal · {templates.length} templates
            </p>
          </div>
          <Btn icon={<Plus className="w-3.5 h-3.5" />}>New template</Btn>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-text-muted gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading templates…</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20 mb-4">
            {error}
          </div>
        )}

        {!loading && templates.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted border-2 border-dashed border-border-strong rounded-2xl">
            <ClipboardList className="w-12 h-12 mb-3 opacity-25" />
            <p className="text-sm font-semibold text-text-secondary">No templates yet</p>
            <p className="text-xs mt-1 mb-4">Create reusable prescription templates to speed up consultations.</p>
            <Btn icon={<Plus className="w-3.5 h-3.5" />}>Create first template</Btn>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const drugCount = tpl.template_data?.medicines?.length ?? 0;
              const lastEdited = new Date(tpl.updated_at).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              });

              return (
                <Card key={tpl.template_id} className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm font-semibold text-text-primary leading-tight">
                        {tpl.template_name}
                      </h3>
                      <p className="text-[11px] text-text-muted font-mono mt-1">
                        last edited {lastEdited}
                      </p>
                    </div>
                    <button className="text-text-muted hover:text-text-primary transition-colors p-0.5">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {tpl.description && (
                    <p className="text-xs text-text-secondary mb-3 leading-relaxed">{tpl.description}</p>
                  )}

                  <div className="flex gap-4 py-3 border-t border-b border-border-subtle mb-4">
                    <div className="flex-1">
                      <div className="text-lg font-semibold font-mono text-text-primary">{drugCount}</div>
                      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Drugs</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold font-mono text-text-primary">v{tpl.version}</div>
                      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Version</div>
                    </div>
                    {tpl.template_data?.follow_up_days && (
                      <div className="flex-1">
                        <div className="text-lg font-semibold font-mono text-text-primary">
                          {tpl.template_data.follow_up_days}d
                        </div>
                        <div className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Follow-up</div>
                      </div>
                    )}
                  </div>

                  {/* Medicines preview */}
                  {tpl.template_data?.medicines && tpl.template_data.medicines.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {tpl.template_data.medicines.slice(0, 3).map((med, i) => (
                        <div key={i} className="text-xs text-text-secondary flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                          <span className="font-medium">{med.name}</span>
                          {med.dosage && <span className="text-text-muted">· {med.dosage}</span>}
                        </div>
                      ))}
                      {tpl.template_data.medicines.length > 3 && (
                        <p className="text-[11px] text-text-muted pl-2.5">
                          +{tpl.template_data.medicines.length - 3} more
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <Btn variant="secondary" size="sm" full>Apply to consultation</Btn>
                    <Btn variant="ghost" size="sm" icon={<Edit className="w-3 h-3" />} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
