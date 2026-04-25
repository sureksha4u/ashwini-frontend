"use client";

import { useState } from "react";
import { Search, Filter, Plus, Edit2, Package } from "lucide-react";
import { KPICard } from "@/components/pharmacy/kpi-card";
import { StatusBadge } from "@/components/pharmacy/status-badge";
import { AddMedicineDrawer } from "@/components/pharmacy/add-medicine-drawer";
import { mockMedicines, mockKPIData } from "@/lib/mock-data";
import { Medicine } from "@/lib/types/inventory";

export function InventoryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredMedicines = mockMedicines.filter((med) => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (med.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesFilter = filterStatus === "all" || med.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleAdd = () => {
    setSelectedMedicine(null);
    setDrawerOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero KPI Section */}
      <div className="grid grid-cols-3 gap-6">
        {mockKPIData.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Premium Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Apple-style Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" strokeWidth={1.25} />
            <input
              type="text"
              placeholder="Search medicines by name, generic name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all outline-none text-[#0F172A] placeholder:text-[#64748B]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#64748B]" strokeWidth={1.25} />
            <FilterChip 
              label="All" 
              active={filterStatus === "all"} 
              onClick={() => setFilterStatus("all")} 
            />
            <FilterChip 
              label="Low Stock" 
              active={filterStatus === "low-stock"} 
              onClick={() => setFilterStatus("low-stock")} 
              color="amber"
            />
            <FilterChip 
              label="Expiring" 
              active={filterStatus === "expiring"} 
              onClick={() => setFilterStatus("expiring")} 
              color="orange"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="px-5 py-3 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Premium Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Medicine Details
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Batch & Expiry
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Pricing
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredMedicines.map((medicine) => (
                <MedicineRow key={medicine.id} medicine={medicine} onEdit={() => handleEdit(medicine)} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredMedicines.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <Package className="w-8 h-8 text-[#CBD5E1]" strokeWidth={1.25} />
            </div>
            <h3 className="text-lg font-medium text-[#0F172A] mb-1">No medicines found</h3>
            <p className="text-sm text-[#64748B]">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Medicine Drawer */}
      <AddMedicineDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        medicine={selectedMedicine}
      />
    </div>
  );
}

interface MedicineRowProps {
  medicine: Medicine;
  onEdit: () => void;
}

function MedicineRow({ medicine, onEdit }: MedicineRowProps) {
  const firstBatch = medicine.batches[0];

  return (
    <tr className="hover:bg-[#F8FAFC] transition-colors group">
      {/* Medicine Details */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-[#0F172A] mb-0.5">{medicine.name}</p>
          <p className="text-sm text-[#64748B]">{medicine.generic_name}</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            {medicine.category} • {medicine.manufacturer}
          </p>
        </div>
      </td>

      {/* Batch & Expiry */}
      <td className="px-6 py-4">
        <p className="text-sm text-[#0F172A] font-mono">{firstBatch?.batch_number || 'N/A'}</p>
        <p className="text-xs text-[#64748B] mt-1">
          Exp: {firstBatch?.expiry_date ? new Date(firstBatch.expiry_date).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }) : 'N/A'}
        </p>
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">{medicine.total_stock} units</p>
          <p className="text-xs text-[#64748B] mt-1">
            Reorder: {medicine.reorder_level} • {medicine.location}
          </p>
        </div>
      </td>

      {/* Pricing */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-[#0F172A]">₹{firstBatch?.mrp?.toFixed(2) || '0.00'}</p>
        <p className="text-xs text-[#64748B] mt-1">Cost: ₹{firstBatch?.purchase_price?.toFixed(2) || '0.00'}</p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={medicine.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]"
        >
          <Edit2 className="w-4 h-4" strokeWidth={1.25} />
          Quick Edit
        </button>
      </td>
    </tr>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'default' | 'amber' | 'orange';
}

function FilterChip({ label, active, onClick, color = 'default' }: FilterChipProps) {
  const colorClasses = {
    default: active 
      ? 'bg-[#0F172A] text-white border-[#0F172A]' 
      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]',
    amber: active 
      ? 'bg-amber-500 text-white border-amber-500' 
      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-amber-300',
    orange: active 
      ? 'bg-orange-500 text-white border-orange-500' 
      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-orange-300',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${colorClasses[color]}`}
    >
      {label}
    </button>
  );
}
