"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Clock, Stethoscope, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { PatientSearchModal } from "@/components/pharmacy/patient-search-modal";
import { PharmacistPatientView } from "@/lib/types";
import { Medicine } from "@/lib/types/inventory";
import { motion, AnimatePresence } from "framer-motion";

// Local types to bridge the gap if needed
interface PrescriptionItem {
  id: string;
  medicine_id?: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  prescribed_by?: string;
  prescribed_date?: string;
}

export function PatientDispensing() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PharmacistPatientView | null>(null);
  const [cart, setCart] = useState<Map<string, { prescription: PrescriptionItem; quantity: number }>>(new Map());

  // Command+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPatient = (patient: PharmacistPatientView) => {
    setSelectedPatient(patient);
    setCart(new Map()); // Clear cart when switching patients
  };

  const addToCart = (prescription: PrescriptionItem) => {
    const newCart = new Map(cart);
    if (newCart.has(prescription.id)) {
      // Already in cart - increase quantity
      const existing = newCart.get(prescription.id)!;
      newCart.set(prescription.id, { ...existing, quantity: existing.quantity + 1 });
    } else {
      // Add new item
      newCart.set(prescription.id, { prescription, quantity: prescription.quantity || 1 });
    }
    setCart(newCart);
  };

  const removeFromCart = (prescriptionId: string) => {
    const newCart = new Map(cart);
    newCart.delete(prescriptionId);
    setCart(newCart);
  };

  const updateQuantity = (prescriptionId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(prescriptionId);
      return;
    }
    const newCart = new Map(cart);
    const item = newCart.get(prescriptionId);
    if (item) {
      newCart.set(prescriptionId, { ...item, quantity });
      setCart(newCart);
    }
  };

  const totalAmount = Array.from(cart.values()).reduce((sum, item) => {
    // Mock price calculation - in real app, would fetch from medicine data
    const pricePerUnit = 10; // Placeholder
    return sum + (item.quantity * pricePerUnit);
  }, 0);

  // Helper to safely get initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column: Patient Search & Info */}
      <div className="col-span-5 space-y-6">
        {/* Search Trigger */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4 tracking-tight">
            Patient Lookup
          </h2>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full px-5 py-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-all flex items-center gap-3 text-left group"
          >
            <Search className="w-5 h-5 text-[#64748B] group-hover:text-[#2563EB] transition-colors" strokeWidth={1.25} />
            <span className="flex-1 text-[#94A3B8]">Search patient by name or UHID...</span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Patient Profile Panel */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden"
          >
            {/* Patient Header */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                  {getInitials(selectedPatient.full_name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedPatient.full_name}</h3>
                  <p className="text-blue-100 text-sm">{selectedPatient.uhid}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span>{selectedPatient.age} years</span>
                    <span>•</span>
                    <span className="capitalize">{selectedPatient.gender}</span>
                    <span>•</span>
                    <span>{selectedPatient.blood_group || 'Unknown BG'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies Alert if any */}
            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="text-sm">
                  <span className="font-semibold text-red-900">Allergies: </span>
                  <span className="text-red-700">{selectedPatient.allergies.join(", ")}</span>
                </div>
              </div>
            )}

            {/* Active Prescriptions */}
            <div className="p-6">
              <h4 className="text-sm font-semibold text-[#0F172A] mb-4 tracking-wide uppercase flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#2563EB]" strokeWidth={1.25} />
                Active Prescriptions
              </h4>
              <div className="space-y-3">
                {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
                  selectedPatient.prescriptions.map((p: any, idx) => {
                    // Map the generic prescription dict to our expected PrescriptionItem
                    const prescription: PrescriptionItem = {
                      id: p.id || `p-${idx}`,
                      medicine_name: p.medicine_name || p.name || "Unknown Medicine",
                      dosage: p.dosage || "N/A",
                      frequency: p.frequency || "N/A",
                      duration: p.duration || "N/A",
                      quantity: p.quantity || 1,
                      prescribed_by: p.prescribed_by || "Doctor",
                      prescribed_date: p.prescribed_date || new Date().toISOString()
                    };
                    return (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        onAddToCart={() => addToCart(prescription)}
                        inCart={cart.has(prescription.id)}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                    <p className="text-sm text-[#64748B]">No active prescriptions found</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!selectedPatient && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <User className="w-10 h-10 text-[#CBD5E1]" strokeWidth={1.25} />
            </div>
            <h3 className="text-lg font-medium text-[#0F172A] mb-2">No patient selected</h3>
            <p className="text-sm text-[#64748B] mb-6">
              Use the search above or press <kbd className="px-2 py-1 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded">⌘K</kbd> to find a patient
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Dispensing Cart */}
      <div className="col-span-7">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden sticky top-24">
          {/* Cart Header */}
          <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F172A] tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#2563EB]" strokeWidth={1.25} />
                Dispensing Cart
              </h2>
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                {cart.size} {cart.size === 1 ? 'Item' : 'Items'}
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-[500px] overflow-y-auto">
            {cart.size > 0 ? (
              <div className="divide-y divide-[#E2E8F0]">
                <AnimatePresence>
                  {Array.from(cart.entries()).map(([id, item]) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#0F172A] mb-1">
                            {item.prescription.medicine_name}
                          </h4>
                          <p className="text-sm text-[#64748B]">
                            {item.prescription.dosage} • {item.prescription.frequency}
                          </p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Prescribed: {item.prescription.quantity} units
                          </p>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex items-center justify-center text-[#0F172A] font-medium"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(id, parseInt(e.target.value) || 0)}
                            className="w-16 px-3 py-2 text-center border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A]"
                          />
                          <button
                            onClick={() => updateQuantity(id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] flex items-center justify-center text-[#0F172A] font-medium"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(id)}
                          className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#64748B] hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.25} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-[#CBD5E1]" strokeWidth={1.25} />
                </div>
                <h3 className="text-lg font-medium text-[#0F172A] mb-1">Cart is empty</h3>
                <p className="text-sm text-[#64748B]">
                  Add prescriptions from the patient panel to start dispensing
                </p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.size > 0 && (
            <div className="border-t border-[#E2E8F0] p-6 bg-[#F8FAFC]">
              <div className="space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Subtotal</span>
                    <span className="font-medium text-[#0F172A]">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Discount (5%)</span>
                    <span className="font-medium text-emerald-600">−₹{(totalAmount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-[#E2E8F0] my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A]">Total Amount</span>
                    <span className="text-2xl font-semibold text-[#0F172A]">
                      ₹{(totalAmount * 0.95).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Dispense Button */}
                <button className="w-full px-6 py-4 rounded-lg bg-[#10B981] text-white font-medium hover:bg-[#059669] shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                  Dispense Medicines
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Search Modal */}
      <PatientSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}

interface PrescriptionCardProps {
  prescription: PrescriptionItem;
  onAddToCart: () => void;
  inCart: boolean;
}

function PrescriptionCard({ prescription, onAddToCart, inCart }: PrescriptionCardProps) {
  const formattedDate = prescription.prescribed_date 
    ? new Date(prescription.prescribed_date).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short' 
      })
    : 'N/A';

  return (
    <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h5 className="font-medium text-[#0F172A] mb-1">{prescription.medicine_name}</h5>
          <div className="space-y-1 text-xs text-[#64748B]">
            <p>• {prescription.dosage} • {prescription.frequency}</p>
            <p>• Duration: {prescription.duration} • Qty: {prescription.quantity}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Clock className="w-3 h-3 text-[#94A3B8]" strokeWidth={1.25} />
            <span className="text-[#94A3B8]">
              {prescription.prescribed_by} • {formattedDate}
            </span>
          </div>
        </div>

        <button
          onClick={onAddToCart}
          disabled={inCart}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0
            ${inCart 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed' 
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm'
            }
          `}
        >
          {inCart ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
