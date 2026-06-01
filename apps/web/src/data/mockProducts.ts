export type ProductCategory =
  | 'semua'
  | 'beras'
  | 'minyak'
  | 'mie-tepung'
  | 'minuman'
  | 'lainnya';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Exclude<ProductCategory, 'semua'>;
  unit: string;
  price: number;
  stock: number;
  badge?: 'promo' | 'baru' | 'habis';
  note?: string;
  emoji: string;
}

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'beras', label: 'Beras' },
  { id: 'minyak', label: 'Minyak & Goreng' },
  { id: 'mie-tepung', label: 'Mie & Tepung' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'lainnya', label: 'Lainnya' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'BR-5KG',
    name: 'Beras Premium 5 kg',
    category: 'beras',
    unit: 'karung',
    price: 72000,
    stock: 24,
    badge: 'promo',
    note: 'Stok pagi — segar',
    emoji: '🍚',
  },
  {
    id: 'p2',
    sku: 'BR-1KG',
    name: 'Beras Medium 1 kg',
    category: 'beras',
    unit: 'pcs',
    price: 14500,
    stock: 80,
    emoji: '🍚',
  },
  {
    id: 'p3',
    sku: 'MY-2L',
    name: 'Minyak Goreng 2 L',
    category: 'minyak',
    unit: 'botol',
    price: 36000,
    stock: 18,
    badge: 'baru',
    emoji: '🫒',
  },
  {
    id: 'p4',
    sku: 'GR-1L',
    name: 'Minyak Goreng 1 L',
    category: 'minyak',
    unit: 'botol',
    price: 19500,
    stock: 42,
    emoji: '🫒',
  },
  {
    id: 'p5',
    sku: 'MI-IND',
    name: 'Mie Instan Paket 5 pcs',
    category: 'mie-tepung',
    unit: 'pak',
    price: 18500,
    stock: 55,
    badge: 'promo',
    emoji: '🍜',
  },
  {
    id: 'p6',
    sku: 'TP-1KG',
    name: 'Tepung Terigu 1 kg',
    category: 'mie-tepung',
    unit: 'pcs',
    price: 12000,
    stock: 30,
    emoji: '🌾',
  },
  {
    id: 'p7',
    sku: 'GM-1L',
    name: 'Gula Pasir 1 kg',
    category: 'lainnya',
    unit: 'pcs',
    price: 15500,
    stock: 36,
    note: 'Kemasan rapat',
    emoji: '🧂',
  },
  {
    id: 'p8',
    sku: 'GR-1KG',
    name: 'Garam Halus 1 kg',
    category: 'lainnya',
    unit: 'pcs',
    price: 6500,
    stock: 50,
    emoji: '🧂',
  },
  {
    id: 'p9',
    sku: 'SK-1L',
    name: 'Susu UHT 1 L',
    category: 'minuman',
    unit: 'kotak',
    price: 18500,
    stock: 22,
    emoji: '🥛',
  },
  {
    id: 'p10',
    sku: 'KK-1.5L',
    name: 'Kopi Sachet Isi 10',
    category: 'minuman',
    unit: 'box',
    price: 12500,
    stock: 0,
    badge: 'habis',
    emoji: '☕',
  },
  {
    id: 'p11',
    sku: 'TR-50',
    name: 'Tepung Bumbu Nasi Goreng',
    category: 'lainnya',
    unit: 'sachet',
    price: 3500,
    stock: 100,
    emoji: '🥡',
  },
  {
    id: 'p12',
    sku: 'BR-10KG',
    name: 'Beras Ramos 10 kg',
    category: 'beras',
    unit: 'karung',
    price: 138000,
    stock: 8,
    note: 'Harga borongan tanya kasir',
    emoji: '🍚',
  },
];
