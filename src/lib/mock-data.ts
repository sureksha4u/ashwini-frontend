import { Medicine, KPIData } from './types/inventory';

export const mockMedicines: Medicine[] = [
  {
    id: 1,
    name: 'Amoxicillin 500mg',
    generic_name: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'Cipla Ltd',
    total_stock: 450,
    reorder_level: 100,
    location: 'A-12',
    is_active: true,
    status: 'in-stock',
    batches: [
      {
        id: 1,
        medicine_id: 1,
        batch_number: 'AMX2024-001',
        expiry_date: new Date('2025-12-31'),
        purchase_price: 12.50,
        mrp: 15.00,
        sale_price: 15.00,
        current_stock: 450,
        status: 'valid'
      }
    ]
  },
  {
    id: 2,
    name: 'Paracetamol 650mg',
    generic_name: 'Acetaminophen',
    category: 'Analgesic',
    manufacturer: 'Sun Pharma',
    total_stock: 850,
    reorder_level: 200,
    location: 'B-05',
    is_active: true,
    status: 'in-stock',
    batches: [
      {
        id: 2,
        medicine_id: 2,
        batch_number: 'PCM2024-045',
        expiry_date: new Date('2026-03-15'),
        purchase_price: 2.50,
        mrp: 3.00,
        sale_price: 3.00,
        current_stock: 850,
        status: 'valid'
      }
    ]
  },
  {
    id: 3,
    name: 'Atorvastatin 10mg',
    generic_name: 'Atorvastatin',
    category: 'Statin',
    manufacturer: "Dr. Reddy's",
    total_stock: 45,
    reorder_level: 50,
    location: 'C-18',
    is_active: true,
    status: 'low-stock',
    batches: [
      {
        id: 3,
        medicine_id: 3,
        batch_number: 'ATV2024-012',
        expiry_date: new Date('2025-08-20'),
        purchase_price: 8.75,
        mrp: 10.50,
        sale_price: 10.50,
        current_stock: 45,
        status: 'valid'
      }
    ]
  },
  {
    id: 9,
    name: 'Insulin Glargine',
    generic_name: 'Insulin Glargine',
    category: 'Insulin',
    manufacturer: 'Sanofi',
    total_stock: 22,
    reorder_level: 30,
    location: 'I-03',
    is_active: true,
    status: 'low-stock',
    batches: [
      {
        id: 9,
        medicine_id: 9,
        batch_number: 'INS2024-034',
        expiry_date: new Date('2025-05-15'),
        purchase_price: 450.00,
        mrp: 525.00,
        sale_price: 525.00,
        current_stock: 22,
        status: 'expiring'
      }
    ]
  }
];

export const mockKPIData: KPIData[] = [
  {
    label: 'Daily Revenue',
    value: '₹45,280',
    change: 12.5,
    trend: 'up',
    sparkline: [32000, 35000, 33000, 38000, 42000, 40000, 45280],
  },
  {
    label: 'Low Stock Items',
    value: '8',
    change: -25.0,
    trend: 'down',
    sparkline: [15, 14, 12, 10, 11, 9, 8],
  },
  {
    label: 'Expiring Soon',
    value: '12',
    change: 0,
    trend: 'up',
    sparkline: [10, 11, 12, 12, 11, 12, 12],
  },
];
