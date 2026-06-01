/**
 * Tipe bersama untuk web, mobile, dan API.
 * Sinkronkan dengan enum di database/schema.sql
 */

export type UserRole =
  | 'owner'
  | 'admin'
  | 'kasir'
  | 'operator_laundry'
  | 'gudang';

export type StockMovementType =
  | 'masuk'
  | 'keluar'
  | 'penyesuaian'
  | 'retur_masuk'
  | 'retur_keluar';

export type LaundryOrderStatus =
  | 'terima'
  | 'cuci'
  | 'kering'
  | 'setrika'
  | 'siap_ambil'
  | 'diambil'
  | 'dibatalkan';

export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'hutang';

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  sellPrice: number;
  minStock: number;
}

export interface LaundryOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  status: LaundryOrderStatus;
  total: number;
  paidAmount: number;
  promisedAt?: string;
  receivedAt: string;
}
