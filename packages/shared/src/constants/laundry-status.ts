import type { LaundryOrderStatus } from '../types';

/** Urutan alur kerja laundry (untuk UI progress & validasi transisi) */
export const LAUNDRY_STATUS_FLOW: LaundryOrderStatus[] = [
  'terima',
  'cuci',
  'kering',
  'setrika',
  'siap_ambil',
  'diambil',
];

export const LAUNDRY_STATUS_LABEL: Record<LaundryOrderStatus, string> = {
  terima: 'Diterima',
  cuci: 'Dicuci',
  kering: 'Dikeringkan',
  setrika: 'Disetrika',
  siap_ambil: 'Siap Diambil',
  diambil: 'Sudah Diambil',
  dibatalkan: 'Dibatalkan',
};
