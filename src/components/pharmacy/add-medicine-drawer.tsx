"use client";

import { useState, useEffect } from "react";
import { X, Upload, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Medicine } from "@/lib/types/inventory";

interface AddMedicineDrawerProps {
  open: boolean;
  onClose: () => void;
  medicine?: Medicine | null;
}

export function AddMedicineDrawer({ open, onClose, medicine }: AddMedicineDrawerProps) {
  const [dragActive, setDragActive] = useState(false);
  
  // In a real app, we'd use these to populate a form
  const isEditing = !!medicine;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0F172A]/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A] tracking-tight">
                  {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <p className="text-sm text-[#64748B] mt-1">
                  {isEditing ? 'Update medicine details in inventory' : 'Enter medicine details to add to inventory'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#64748B]" strokeWidth={1.25} />
              </button>
            </div>

            {/* Form Content */}
            <div className="px-8 py-6 space-y-8">
              {/* Basic Information Section */}
              <section>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4 tracking-wide uppercase">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <FloatingInput label="Medicine Name" required defaultValue={medicine?.name} />
                  <FloatingInput label="Generic Name" defaultValue={medicine?.generic_name || ''} />
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput label="Category" defaultValue={medicine?.category || ''} />
                    <FloatingInput label="Manufacturer" defaultValue={medicine?.manufacturer || ''} />
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4 tracking-wide uppercase">
                  Pricing & Stock
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
                    defaultValue={medicine?.location || ''} 
                  />
                </div>
              </section>

              {/* Expiry & Batch Section */}
              <section>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4 tracking-wide uppercase">
                  Expiry & Batch Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FloatingInput 
                      label="Batch Number" 
                      required 
                      defaultValue={medicine?.batches[0]?.batch_number} 
                    />
                    <FloatingInput 
                      label="Expiry Date" 
                      type="date" 
                      required 
                      defaultValue={medicine?.batches[0]?.expiry_date ? new Date(medicine.batches[0].expiry_date).toISOString().split('T')[0] : ''} 
                    />
                  </div>
                </div>
              </section>

              {/* Image Upload Section */}
              <section>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4 tracking-wide uppercase">
                  Product Image
                </h3>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
                    ${dragActive 
                      ? 'border-[#2563EB] bg-blue-50' 
                      : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center mb-3 shadow-sm">
                      <Upload className="w-6 h-6 text-[#64748B]" strokeWidth={1.25} />
                    </div>
                    <p className="text-sm font-medium text-[#0F172A] mb-1">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-[#64748B]">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/png,image/jpeg"
                  />
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" strokeWidth={1.25} />
                    {isEditing ? 'Update Medicine' : 'Add Medicine'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FloatingInputProps {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

function FloatingInput({ label, type = "text", required = false, placeholder, defaultValue }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    setValue(defaultValue || '');
  }, [defaultValue]);

  const hasValue = value !== '';

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
        className={`
          w-full px-4 py-3.5 rounded-lg border bg-white transition-all duration-200
          text-[#0F172A] placeholder:text-transparent
          ${focused || hasValue 
            ? 'border-[#2563EB] ring-4 ring-blue-50' 
            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          }
        `}
      />
      <label
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${focused || hasValue
            ? 'top-2 text-xs text-[#2563EB] font-medium'
            : 'top-1/2 -translate-y-1/2 text-sm text-[#64748B]'
          }
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
}
