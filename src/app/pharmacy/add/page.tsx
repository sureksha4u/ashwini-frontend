"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Image } from "lucide-react";

export default function PharmacyAddPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    brand: "", generic: "", manufacturer: "", category: "", schedule: "OTC", uom: "", mrp: "", reorder: "", location: "",
  });

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Blurred background hint */}
      <div className="absolute inset-0 flex items-center justify-center text-text-muted text-[14px] select-none" aria-hidden>
        Pharmacy inventory
      </div>

      {/* Drawer */}
      <aside className="absolute top-0 right-0 h-full w-[600px] bg-surface-1 border-l border-border-subtle shadow-2xl flex flex-col z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <div className="text-[16px] font-semibold">Add medicine</div>
            <div className="text-[11px] text-text-muted">Slides in from right · saved to master catalog</div>
          </div>
          <button onClick={() => router.back()} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {/* Image drop */}
          <div className="h-[140px] rounded-[10px] border-2 border-dashed border-border-strong bg-surface-2 flex flex-col items-center justify-center gap-2 text-text-muted cursor-pointer hover:border-accent hover:bg-accent-soft/20 transition-colors">
            <Image size={28} />
            <span className="text-[13px]">Drag medicine image here, or <span className="text-accent font-semibold">browse</span></span>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Brand name", key: "brand", span: true, placeholder: "Crocin Advance 500mg" },
              { label: "Generic", key: "generic", placeholder: "Paracetamol" },
              { label: "Manufacturer", key: "manufacturer", placeholder: "GSK Pharmaceuticals" },
              { label: "Category", key: "category", placeholder: "Analgesic / Antipyretic" },
              { label: "Schedule", key: "schedule", placeholder: "OTC" },
              { label: "Unit of measure", key: "uom", placeholder: "Strip of 10" },
              { label: "MRP per strip (₹)", key: "mrp", placeholder: "32", mono: true },
              { label: "Reorder level", key: "reorder", placeholder: "50 strips", mono: true },
              { label: "Default location", key: "location", span: true, placeholder: "Shelf A-12" },
            ].map(({ label, key, span, placeholder, mono }) => (
              <div key={key} className={span ? "col-span-2" : ""}>
                <label className="text-[12px] font-semibold text-text-primary mb-1.5 block uppercase tracking-wide text-text-muted">{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => update(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full h-10 px-3 rounded-lg bg-surface-2 border border-border-subtle text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent ${mono ? "font-mono" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-border-subtle">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-2">Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[13px] font-semibold text-text-secondary hover:bg-surface-2">Save &amp; add another</button>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">Save medicine</button>
        </div>
      </aside>
    </div>
  );
}
