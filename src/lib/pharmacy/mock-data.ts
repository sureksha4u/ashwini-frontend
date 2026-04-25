export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  stock: number;
  reorderLevel: number;
  price: number;
  mrp: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring-soon';
  location: string;
}

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  prescribedBy: string;
  prescribedDate: string;
  status: 'pending' | 'dispensed' | 'partial';
}

export interface KPIData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  sparkline: number[];
}

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    manufacturer: 'Cipla Ltd',
    batchNumber: 'AMX2024-001',
    expiryDate: '2025-12-31',
    stock: 450,
    reorderLevel: 100,
    price: 12.50,
    mrp: 15.00,
    status: 'in-stock',
    location: 'A-12',
  },
  {
    id: '2',
    name: 'Paracetamol 650mg',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    manufacturer: 'Sun Pharma',
    batchNumber: 'PCM2024-045',
    expiryDate: '2026-03-15',
    stock: 850,
    reorderLevel: 200,
    price: 2.50,
    mrp: 3.00,
    status: 'in-stock',
    location: 'B-05',
  },
  {
    id: '3',
    name: 'Atorvastatin 10mg',
    genericName: 'Atorvastatin',
    category: 'Statin',
    manufacturer: 'Dr. Reddy\'s',
    batchNumber: 'ATV2024-012',
    expiryDate: '2025-08-20',
    stock: 45,
    reorderLevel: 50,
    price: 8.75,
    mrp: 10.50,
    status: 'low-stock',
    location: 'C-18',
  },
  {
    id: '4',
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    manufacturer: 'Lupin',
    batchNumber: 'MTF2024-089',
    expiryDate: '2026-01-10',
    stock: 320,
    reorderLevel: 100,
    price: 5.25,
    mrp: 6.50,
    status: 'in-stock',
    location: 'D-22',
  },
  {
    id: '5',
    name: 'Losartan 50mg',
    genericName: 'Losartan Potassium',
    category: 'Antihypertensive',
    manufacturer: 'Zydus Cadila',
    batchNumber: 'LST2024-156',
    expiryDate: '2026-04-28',
    stock: 180,
    reorderLevel: 75,
    price: 11.00,
    mrp: 13.50,
    status: 'in-stock',
    location: 'E-09',
  },
  {
    id: '6',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'PPI',
    manufacturer: 'Torrent Pharma',
    batchNumber: 'OMP2024-067',
    expiryDate: '2026-05-12',
    stock: 275,
    reorderLevel: 100,
    price: 6.80,
    mrp: 8.00,
    status: 'in-stock',
    location: 'F-14',
  },
  {
    id: '7',
    name: 'Clopidogrel 75mg',
    genericName: 'Clopidogrel',
    category: 'Antiplatelet',
    manufacturer: 'Glenmark',
    batchNumber: 'CLP2024-023',
    expiryDate: '2026-06-30',
    stock: 95,
    reorderLevel: 60,
    price: 15.50,
    mrp: 18.00,
    status: 'in-stock',
    location: 'G-07',
  },
  {
    id: '8',
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    manufacturer: 'Abbott',
    batchNumber: 'AZT2024-198',
    expiryDate: '2026-07-18',
    stock: 125,
    reorderLevel: 80,
    price: 22.00,
    mrp: 25.00,
    status: 'in-stock',
    location: 'H-11',
  },
  {
    id: '9',
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    category: 'Insulin',
    manufacturer: 'Sanofi',
    batchNumber: 'INS2024-034',
    expiryDate: '2025-05-15',
    stock: 22,
    reorderLevel: 30,
    price: 450.00,
    mrp: 525.00,
    status: 'expiring-soon',
    location: 'I-03',
  },
  {
    id: '10',
    name: 'Salbutamol Inhaler',
    genericName: 'Salbutamol',
    category: 'Bronchodilator',
    manufacturer: 'GSK',
    batchNumber: 'SAL2024-145',
    expiryDate: '2026-09-22',
    stock: 68,
    reorderLevel: 40,
    price: 85.00,
    mrp: 95.00,
    status: 'in-stock',
    location: 'J-20',
  },
];

export const mockPatients: Patient[] = [
  {
    id: '1',
    uhid: 'UHID-2024-001234',
    name: 'Rajesh Kumar',
    age: 58,
    gender: 'Male',
    phone: '+91 98765 43210',
    prescriptions: [
      {
        id: 'p1',
        medicineId: '3',
        medicineName: 'Atorvastatin 10mg',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        prescribedBy: 'Dr. Sharma (Cardiology)',
        prescribedDate: '2026-04-20',
        status: 'pending',
      },
      {
        id: 'p2',
        medicineId: '4',
        medicineName: 'Metformin 500mg',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        prescribedBy: 'Dr. Sharma (Cardiology)',
        prescribedDate: '2026-04-20',
        status: 'pending',
      },
    ],
  },
  {
    id: '2',
    uhid: 'UHID-2024-005678',
    name: 'Priya Menon',
    age: 32,
    gender: 'Female',
    phone: '+91 87654 32109',
    prescriptions: [
      {
        id: 'p3',
        medicineId: '1',
        medicineName: 'Amoxicillin 500mg',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        quantity: 21,
        prescribedBy: 'Dr. Verma (General Medicine)',
        prescribedDate: '2026-04-21',
        status: 'pending',
      },
      {
        id: 'p4',
        medicineId: '2',
        medicineName: 'Paracetamol 650mg',
        dosage: '650mg',
        frequency: 'As needed',
        duration: '5 days',
        quantity: 10,
        prescribedBy: 'Dr. Verma (General Medicine)',
        prescribedDate: '2026-04-21',
        status: 'pending',
      },
    ],
  },
  {
    id: '3',
    uhid: 'UHID-2024-009012',
    name: 'Mohammed Ali',
    age: 45,
    gender: 'Male',
    phone: '+91 76543 21098',
    prescriptions: [
      {
        id: 'p5',
        medicineId: '6',
        medicineName: 'Omeprazole 20mg',
        dosage: '20mg',
        frequency: 'Once daily before breakfast',
        duration: '30 days',
        quantity: 30,
        prescribedBy: 'Dr. Patel (Gastroenterology)',
        prescribedDate: '2026-04-19',
        status: 'pending',
      },
    ],
  },
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
