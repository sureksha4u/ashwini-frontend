"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Scan } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { getCriticalRadiology, type RadioQueueItem } from "@/lib/api/radiology-workflow";

export default function RadiologyCriticalPage() {
  const router = useRouter();
  const [items, setItems] = useState<RadioQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCriticalRadiology()
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Radiology", "Critical"]} />
      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-danger" />
            Critical Radiology Findings
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Reviewed reports — notify ordering doctor immediately
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        )}
        {error && <div className="p-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}
        {!loading && items.length === 0 && !error && (
          <Card className="text-center py-16 text-text-muted">
            <Scan className="w-10 h-10 mx-auto mb-3 text-success opacity-50" />
            <p className="text-sm font-semibold text-success">No critical findings</p>
            <p className="text-xs mt-1">All reviewed radiology reports are normal.</p>
          </Card>
        )}

        <div className="flex flex-col gap-3 overflow-y-auto flex-1">
          {!loading && items.map((item) => (
            <Card key={item.id} className="flex items-start gap-4 border-danger/30 bg-danger-soft/10">
              <div className="w-10 h-10 rounded-xl bg-danger-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-primary">{item.type} · {item.body_part}</span>
                  <Pill color="danger" soft>critical finding</Pill>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Avatar name={item.patient_name ?? item.patient_id} role="staff" size={20} />
                  <span className="text-sm text-text-secondary">{item.patient_name ?? "—"}</span>
                  <span className="text-xs font-mono text-text-muted">{item.patient_id}</span>
                </div>
                {item.impression && (
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed border-l-2 border-danger/30 pl-2">
                    {item.impression}
                  </p>
                )}
                {item.reviewed_at && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Reviewed {new Date(item.reviewed_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <Btn variant="danger" size="sm" onClick={() => router.push(`/patients/${item.patient_id}`)}>
                Open file →
              </Btn>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
