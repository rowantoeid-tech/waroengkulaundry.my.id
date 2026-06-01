export interface LaundryService {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  estimatedHours: number;
  highlight?: string;
  icon: string;
}

export const MOCK_LAUNDRY_SERVICES: LaundryService[] = [
  {
    id: 'l1',
    code: 'CUCI_KERING',
    name: 'Cuci Kering',
    description: 'Cuci + jemur. Cocok untuk pakaian harian & handuk.',
    unit: 'kg',
    price: 7000,
    estimatedHours: 24,
    icon: '🧺',
  },
  {
    id: 'l2',
    code: 'CUCI_SETRIKA',
    name: 'Cuci + Setrika',
    description: 'Paket lengkap — bersih, wangi, rapi siap pakai.',
    unit: 'kg',
    price: 9000,
    estimatedHours: 48,
    highlight: 'Terlaris',
    icon: '👔',
  },
  {
    id: 'l3',
    code: 'SETRIKA',
    name: 'Setrika Saja',
    description: 'Bawa pakaian sudah kering, kami setrika rapi.',
    unit: 'pcs',
    price: 5000,
    estimatedHours: 12,
    icon: '🔥',
  },
  {
    id: 'l4',
    code: 'EXPRESS',
    name: 'Express 6 Jam',
    description: 'Butuh cepat? Prioritas antrian cucian Anda.',
    unit: 'kg',
    price: 12000,
    estimatedHours: 6,
    highlight: 'Cepat',
    icon: '⚡',
  },
  {
    id: 'l5',
    code: 'BEDCOVER',
    name: 'Bedcover & Selimut',
    description: 'Cuci khusus linen besar — per item.',
    unit: 'pcs',
    price: 35000,
    estimatedHours: 72,
    icon: '🛏️',
  },
  {
    id: 'l6',
    code: 'KARPET',
    name: 'Karpet Kecil',
    description: 'Maks. 1×1,5 m. Keringkan higienis.',
    unit: 'pcs',
    price: 45000,
    estimatedHours: 96,
    icon: '🧶',
  },
];
