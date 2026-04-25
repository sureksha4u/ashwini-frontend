import { components } from './schema';

export type MedicineSchema = components['schemas']['MedicineRead'];
export type BatchSchema = components['schemas']['BatchRead'];
export type PharmacyKPISchema = components['schemas']['PharmacyKPI'];

/**
 * Clean Frontend Batch Interface
 * Extends generated schema with proper Date types and status helper
 */
export interface Batch extends Omit<BatchSchema, 'expiry_date'> {
  expiry_date: Date;
  status: 'valid' | 'expiring' | 'expired';
}

/**
 * Clean Frontend Medicine Interface
 * Aggregates batches and adds stock status helper
 */
export interface Medicine extends Omit<MedicineSchema, 'batches'> {
  batches: Batch[];
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring';
}

/**
 * Pharmacy KPIs for dashboard cards
 */
export interface PharmacyKPI extends PharmacyKPISchema {}

/**
 * Individual KPI Card Data
 */
export interface KPIData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  sparkline: number[];
}

/**
 * Mapper to convert raw Batch API response to clean Frontend Batch
 */
export const mapBatch = (batch: BatchSchema): Batch => {
  const expiryDate = new Date(batch.expiry_date);
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  let status: Batch['status'] = 'valid';
  if (expiryDate < now) {
    status = 'expired';
  } else if (expiryDate < threeMonthsFromNow) {
    status = 'expiring';
  }

  return {
    ...batch,
    expiry_date: expiryDate,
    status,
  };
};

/**
 * Mapper to convert raw Medicine API response to clean Frontend Medicine
 */
export const mapMedicine = (medicine: MedicineSchema): Medicine => {
  const batches = (medicine.batches || []).map(mapBatch);
  
  let status: Medicine['status'] = 'in-stock';
  
  // Priority: Out of Stock > Expiring > Low Stock > In Stock
  if (medicine.total_stock <= 0) {
    status = 'out-of-stock';
  } else if (batches.some(b => b.status === 'expiring')) {
    status = 'expiring';
  } else if (medicine.total_stock <= medicine.reorder_level) {
    status = 'low-stock';
  }

  return {
    ...medicine,
    batches,
    status,
  };
};
