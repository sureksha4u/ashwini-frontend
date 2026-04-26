"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, ShoppingCart, User, Clock, Stethoscope, Trash2, CheckCircle2,
  AlertTriangle, Loader2, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { PatientSearchModal } from "@/components/pharmacy/patient-search-modal";
import type { PharmacistPatientView } from "@/lib/types";
import type { Batch, Medicine } from "@/lib/types/inventory";
import { listInventory } from "@/lib/api/inventory";
import {
  dispenseMedicines,
  getActivePrescription,
  type ActivePrescription,
} from "@/lib/api/dispensing";

// One row of the active Rx, normalized for the cart.
interface RxLine {
  key: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  // Resolved against the inventory list — null means we couldn't find a batch.
  batch: ResolvedBatch | null;
}

interface ResolvedBatch {
  batch_id: number;
  medicine_id: number;
  medicine_name: string;
  current_stock: number;
  mrp: number;
  expiry_date: Date;
}

interface CartLine {
  rx: RxLine;
  quantity: number;
}

function pickFEFOBatch(med: Medicine): Batch | null {
  const candidates = med.batches.filter((b) => b.current_stock > 0 && b.status !== "expired");
  if (!candidates.length) return null;
  return candidates.reduce((acc, b) => (acc.expiry_date < b.expiry_date ? acc : b));
}

function resolveBatch(name: string, inventory: Medicine[]): ResolvedBatch | null {
  // Match by exact name first, then by includes — the prescription text might
  // append a strength ("Crocin 500mg") that the inventory already encodes.
  const lower = name.toLowerCase().trim();
  const exact = inventory.find((m) => m.name.toLowerCase() === lower);
  const fuzzy = exact || inventory.find((m) =>
    m.name.toLowerCase().includes(lower) || (m.generic_name?.toLowerCase().includes(lower) ?? false),
  );
  if (!fuzzy) return null;
  const batch = pickFEFOBatch(fuzzy);
  if (!batch) return null;
  return {
    batch_id: batch.id,
    medicine_id: fuzzy.id,
    medicine_name: fuzzy.name,
    current_stock: batch.current_stock,
    mrp: batch.mrp,
    expiry_date: batch.expiry_date,
  };
}

function rxToLines(rx: ActivePrescription | null, inventory: Medicine[]): RxLine[] {
  if (!rx) return [];
  const meds = (rx.prescription_data?.["medicines"] as Array<Record<string, unknown>> | undefined) || [];
  return meds.map((m, idx) => {
    const name = String(m.name ?? m["medicine_name"] ?? "Unknown");
    const dosage = String(m.dosage ?? "—");
    const frequency = String(m.frequency ?? "—");
    const duration = String(m.duration ?? "—");
    const quantity = typeof m.quantity === "number" ? (m.quantity as number) : 1;
    return {
      key: `rx-${idx}-${name}`,
      name,
      dosage,
      frequency,
      duration,
      quantity,
      batch: resolveBatch(name, inventory),
    };
  });
}

export function PatientDispensing() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PharmacistPatientView | null>(null);
  const [activeRx, setActiveRx] = useState<ActivePrescription | null>(null);
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [loadingRx, setLoadingRx] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  const [cart, setCart] = useState<Map<string, CartLine>>(new Map());

  const [dispenseStatus, setDispenseStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [dispenseError, setDispenseError] = useState<string | null>(null);

  // ⌘K opens the patient search modal
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // When a patient is selected, fetch their active Rx + the inventory list so
  // we can resolve batch_ids without round-tripping per medicine.
  useEffect(() => {
    if (!selectedPatient) {
      setActiveRx(null);
      setInventory([]);
      setCart(new Map());
      setRxError(null);
      return;
    }
    let cancelled = false;
    setLoadingRx(true);
    setRxError(null);
    Promise.all([
      getActivePrescription(selectedPatient.uhid || selectedPatient.id || ""),
      listInventory({ filter: "all" }),
    ])
      .then(([rx, inv]) => {
        if (cancelled) return;
        setActiveRx(rx);
        setInventory(inv);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRxError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoadingRx(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPatient]);

  const rxLines = useMemo(() => rxToLines(activeRx, inventory), [activeRx, inventory]);

  const handleSelectPatient = (patient: PharmacistPatientView) => {
    setSelectedPatient(patient);
    setDispenseStatus("idle");
    setDispenseError(null);
  };

  const addToCart = (rx: RxLine) => {
    if (!rx.batch) return;
    const next = new Map(cart);
    const existing = next.get(rx.key);
    next.set(rx.key, { rx, quantity: (existing?.quantity ?? 0) + 1 });
    setCart(next);
  };

  const removeFromCart = (key: string) => {
    const next = new Map(cart);
    next.delete(key);
    setCart(next);
  };

  const updateQuantity = (key: string, q: number) => {
    if (q <= 0) {
      removeFromCart(key);
      return;
    }
    const next = new Map(cart);
    const item = next.get(key);
    if (!item) return;
    const capped = Math.min(q, item.rx.batch?.current_stock ?? q);
    next.set(key, { ...item, quantity: capped });
    setCart(next);
  };

  const totalAmount = useMemo(
    () =>
      Array.from(cart.values()).reduce(
        (sum, line) => sum + line.quantity * (line.rx.batch?.mrp ?? 0),
        0,
      ),
    [cart],
  );

  const handleDispense = async () => {
    if (!selectedPatient) return;
    if (cart.size === 0) return;
    const items = Array.from(cart.values())
      .filter((line) => line.rx.batch)
      .map((line) => ({
        batch_id: line.rx.batch!.batch_id,
        quantity: line.quantity,
      }));
    if (items.length === 0) return;

    setDispenseStatus("submitting");
    setDispenseError(null);
    try {
      await dispenseMedicines({
        patient_id: selectedPatient.uhid || selectedPatient.id || "",
        consultation_id: activeRx?.consultation_id ?? null,
        items,
      });
      setDispenseStatus("success");
      setCart(new Map());
      // Refresh inventory so the resolved batches show updated stock the next
      // time the same patient is opened.
      listInventory({ filter: "all" }).then(setInventory).catch(() => {});
    } catch (err: unknown) {
      setDispenseStatus("error");
      setDispenseError(err instanceof Error ? err.message : String(err));
    }
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "P";

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-5 space-y-5">
        <div className="bg-surface-1 rounded-xl border border-border-subtle shadow-soft p-5">
          <h2 className="text-base font-semibold text-text-primary mb-3 tracking-tight">
            Patient Lookup
          </h2>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface-2 hover:bg-surface-1 hover:border-border-strong transition-colors flex items-center gap-3 text-left group"
          >
            <Search className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" strokeWidth={1.5} />
            <span className="flex-1 text-text-muted text-sm">Search patient by name or UHID…</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-secondary bg-surface-1 border border-border-subtle rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-1 rounded-xl border border-border-subtle shadow-soft overflow-hidden"
          >
            <div
              className="p-5 text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--logo-to))" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-semibold border-2 border-white/30">
                  {getInitials(selectedPatient.full_name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-0.5">{selectedPatient.full_name}</h3>
                  <p className="text-white/75 text-xs font-mono">{selectedPatient.uhid}</p>
                  <div className="flex items-center gap-3 mt-2.5 text-xs">
                    <span>{selectedPatient.age} years</span>
                    <span className="opacity-50">·</span>
                    <span className="capitalize">{selectedPatient.gender}</span>
                    <span className="opacity-50">·</span>
                    <span>{selectedPatient.blood_group || "Unknown BG"}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="px-5 py-2.5 bg-danger-soft border-b border-danger/20 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <div className="text-xs">
                  <span className="font-semibold text-danger">Allergies: </span>
                  <span className="text-danger">{selectedPatient.allergies.join(", ")}</span>
                </div>
              </div>
            )}

            <div className="p-5">
              <h4 className="text-[11px] font-semibold text-text-secondary mb-3 tracking-wider uppercase flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                Active Prescription
              </h4>

              {loadingRx ? (
                <div className="py-7 flex items-center justify-center gap-2 text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading prescription…</span>
                </div>
              ) : rxError ? (
                <div className="px-3 py-2.5 bg-danger-soft border border-danger/20 rounded-lg text-sm text-danger">
                  {rxError}
                </div>
              ) : activeRx && rxLines.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="text-[11px] text-text-muted font-mono">
                    Source: {activeRx.consultation_id}
                    {activeRx.finalized_at && (
                      <> · Finalized {new Date(activeRx.finalized_at).toLocaleDateString("en-IN")}</>
                    )}
                  </div>
                  {rxLines.map((line) => (
                    <RxCard
                      key={line.key}
                      line={line}
                      onAddToCart={() => addToCart(line)}
                      inCart={cart.has(line.key)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-7 bg-surface-2 rounded-lg border border-dashed border-border-subtle">
                  <p className="text-sm text-text-secondary">No finalized prescription found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!selectedPatient && (
          <div className="bg-surface-1 rounded-xl border border-border-subtle shadow-soft p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-surface-2 flex items-center justify-center">
              <User className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1.5">No patient selected</h3>
            <p className="text-sm text-text-secondary">
              Use the search above or press{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-2 border border-border-subtle rounded">⌘K</kbd>{" "}
              to find a patient
            </p>
          </div>
        )}
      </div>

      <div className="col-span-7">
        <div className="bg-surface-1 rounded-xl border border-border-subtle shadow-soft overflow-hidden sticky top-24">
          <div className="px-5 py-4 border-b border-border-subtle bg-surface-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-accent" strokeWidth={1.5} />
                Dispensing Cart
              </h2>
              <div className="px-2.5 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold border border-accent/20">
                {cart.size} {cart.size === 1 ? "Item" : "Items"}
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {cart.size > 0 ? (
              <div className="divide-y divide-border-subtle">
                <AnimatePresence>
                  {Array.from(cart.entries()).map(([key, line]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary text-sm mb-0.5">
                            {line.rx.name}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {line.rx.dosage} · {line.rx.frequency}
                          </p>
                          {line.rx.batch && (
                            <p className="text-[11px] text-text-muted mt-1">
                              Batch #{line.rx.batch.batch_id} · Stock {line.rx.batch.current_stock} · ₹
                              {line.rx.batch.mrp.toFixed(2)} ea
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(key, line.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-border-subtle hover:bg-surface-2 flex items-center justify-center text-text-primary text-sm font-medium"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={line.quantity}
                            onChange={(e) => updateQuantity(key, parseInt(e.target.value) || 0)}
                            className="w-14 px-2 py-1.5 text-center bg-surface-2 border border-border-subtle rounded-md text-sm font-medium text-text-primary"
                          />
                          <button
                            onClick={() => updateQuantity(key, line.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-border-subtle hover:bg-surface-2 flex items-center justify-center text-text-primary text-sm font-medium"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(key)}
                          className="w-8 h-8 rounded-md hover:bg-danger-soft flex items-center justify-center text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-surface-2 flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">Cart is empty</h3>
                <p className="text-sm text-text-secondary">
                  Add prescriptions from the patient panel to start dispensing
                </p>
              </div>
            )}
          </div>

          {cart.size > 0 && (
            <div className="border-t border-border-subtle p-5 bg-surface-2 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-primary font-mono">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border-subtle" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary text-sm">Total Amount</span>
                <span className="text-xl font-semibold text-text-primary font-mono">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              {dispenseStatus === "error" && dispenseError && (
                <div className="px-3 py-2 bg-danger-soft border border-danger/20 rounded-lg text-sm text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dispenseError}</span>
                </div>
              )}

              {dispenseStatus === "success" && (
                <div className="px-3 py-2 bg-success-soft border border-success/20 rounded-lg text-sm text-success flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Dispense recorded</span>
                </div>
              )}

              <button
                onClick={handleDispense}
                disabled={dispenseStatus === "submitting" || cart.size === 0}
                className="w-full px-5 py-3 rounded-lg bg-success text-white font-semibold text-sm hover:opacity-90 shadow-soft transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {dispenseStatus === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dispensing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    Dispense Medicines
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <PatientSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}

interface RxCardProps {
  line: RxLine;
  onAddToCart: () => void;
  inCart: boolean;
}

function RxCard({ line, onAddToCart, inCart }: RxCardProps) {
  const noBatch = !line.batch;
  return (
    <div className="p-3.5 rounded-lg border border-border-subtle bg-surface-2 hover:bg-surface-1 hover:border-border-strong transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-text-primary text-sm mb-1">{line.name}</h5>
          <div className="space-y-0.5 text-xs text-text-secondary">
            <p>· {line.dosage} · {line.frequency}</p>
            <p>· Duration: {line.duration} · Qty: {line.quantity}</p>
          </div>
          {line.batch ? (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
              <span className="text-text-muted">
                Batch #{line.batch.batch_id} · Stock {line.batch.current_stock} · ₹
                {line.batch.mrp.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-warning">
              <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
              <span>Not in inventory — manual override needed</span>
            </div>
          )}
        </div>

        <button
          onClick={onAddToCart}
          disabled={inCart || noBatch}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
            inCart
              ? "bg-success-soft text-success border border-success/20 cursor-not-allowed"
              : noBatch
              ? "bg-surface-3 text-text-muted border border-border-subtle cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent-hover shadow-soft"
          }`}
        >
          {inCart ? "✓ Added" : noBatch ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
