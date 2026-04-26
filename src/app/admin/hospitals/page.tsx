"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, MapPin, Phone, Mail, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { getAdminHospitals, type HospitalRecord } from "@/lib/api/admin";

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminHospitals()
      .then(setHospitals)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-page">
      <Header breadcrumb={["Admin", "Hospitals"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Hospitals</h1>
          <p className="text-xs text-text-secondary mt-1">{hospitals.length} registered · {hospitals.filter((h) => h.is_active).length} active</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        )}
        {error && <div className="p-4 bg-danger-soft text-danger text-sm rounded-lg border border-danger/20">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          {hospitals.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{h.name}</div>
                    <div className="text-[11px] font-mono text-text-muted mt-0.5">{h.hospital_id}</div>
                  </div>
                </div>
                <Pill color={h.is_active ? "success" : "danger"}>{h.is_active ? "Active" : "Inactive"}</Pill>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                {h.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-text-muted flex-shrink-0" />
                    {h.address}
                  </div>
                )}
                {h.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-text-muted flex-shrink-0" />
                    {h.phone}
                  </div>
                )}
                {h.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-text-muted flex-shrink-0" />
                    {h.email}
                  </div>
                )}
                {!h.address && !h.phone && !h.email && (
                  <span className="text-text-muted italic">No contact info</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        {!loading && hospitals.length === 0 && !error && (
          <div className="text-center py-20 text-text-muted">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No hospitals registered.</p>
          </div>
        )}
      </main>
    </div>
  );
}
