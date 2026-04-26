"use client";

import { useState, useEffect } from "react";
import { X, Upload, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Medicine } from "@/lib/types/inventory";
import { Btn } from "@/components/ui/Btn";
import { cn } from "@/lib/utils";

interface AddMedicineDrawerProps {
  open: boolean;
  onClose: () => void;
  medicine?: Medicine | null;
}

export function AddMedicineDrawer({ open, onClose, medicine }: AddMedicineDrawerProps) {
  const [dragActive, setDragActive] = useState(false);
  const isEditing = !!medicine;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[600px] bg-surface-1 shadow-modal z-50 overflow-y-auto border-l border-border-subtle"
          >
            <div className="sticky top-0 bg-surface-1 border-b border-border-subtle px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  {isEditing ? "Edit Medicine" : "Add New Medicine"}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isEditing
                    ? "Update medicine details in inventory"
                    : "Enter medicine details to add to inventory"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-subtle flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-7">
              <Section title="Basic Information">
                <FloatingInput label="Medicine Name" required defaultValue={medicine?.name} />
                <FloatingInput label="Generic Name" defaultValue={medicine?.generic_name || ""} />
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Category" defaultValue={medicine?.category || ""} />
                  <FloatingInput label="Manufacturer" defaultValue={medicine?.manufacturer || ""} />
                </div>
              </Section>

              <Section title="Pricing & Stock">
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="Purchase Price (₹)"
                    type="number"
                    defaultValue={medicine?.batches[0]?.purchase_price?.toString()}
                  />
                  <FloatingInput
                    label="MRP (₹)"
                    type="number"
                    required
                    defaultValue={medicine?.batches[0]?.mrp?.toString()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="Stock Quantity"
                    type="number"
                    required
                    defaultValue={medicine?.total_stock?.toString()}
                  />
                  <FloatingInput
                    label="Reorder Level"
                    type="number"
                    defaultValue={medicine?.reorder_level?.toString()}
                  />
                </div>
                <FloatingInput
                  label="Rack Location"
                  placeholder="e.g., A-12"
                  defaultValue={medicine?.location || ""}
                />
              </Section>

              <Section title="Expiry & Batch Details">
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="Batch Number"
                    required
                    defaultValue={medicine?.batches[0]?.batch_number}
                  />
                  <FloatingInput
                    label="Expiry Date"
                    type="date"
                    required
                    defaultValue={
                      medicine?.batches[0]?.expiry_date
                        ? new Date(medicine.batches[0].expiry_date).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </div>
              </Section>

              <Section title="Product Image">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-7 transition-colors",
                    dragActive
                      ? "border-accent bg-accent-soft"
                      : "border-border-subtle bg-surface-2 hover:border-border-strong",
                  )}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-surface-1 border border-border-subtle flex items-center justify-center mb-2.5 shadow-soft">
                      <Upload className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-text-primary mb-0.5">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/png,image/jpeg"
                  />
                </div>
              </Section>

              <div className="flex gap-3 pt-4 border-t border-border-subtle">
                <Btn variant="secondary" size="lg" full onClick={onClose}>
                  Cancel
                </Btn>
                <Btn variant="primary" size="lg" full icon={<Package className="w-4 h-4" />}>
                  {isEditing ? "Update Medicine" : "Add Medicine"}
                </Btn>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-semibold text-text-secondary mb-3 tracking-wider uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface FloatingInputProps {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

function FloatingInput({
  label,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const hasValue = value !== "";

  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full px-3.5 py-3 rounded-lg border bg-surface-1 transition-all text-text-primary placeholder:text-transparent",
          focused || hasValue
            ? "border-accent ring-2 ring-accent/15"
            : "border-border-subtle hover:border-border-strong",
        )}
      />
      <label
        className={cn(
          "absolute left-3.5 transition-all pointer-events-none",
          focused || hasValue
            ? "top-1.5 text-[10px] text-accent font-semibold uppercase tracking-wider"
            : "top-1/2 -translate-y-1/2 text-sm text-text-muted",
        )}
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
    </div>
  );
}
