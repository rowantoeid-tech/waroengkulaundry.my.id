export type CartItemType = 'product' | 'laundry';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  meta?: string;
}
