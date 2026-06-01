import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/types/cart';

export type AppView = 'shop' | 'checkout';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  view: AppView;
  isEmpty: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  goToCheckout: () => void;
  goToShop: () => void;
  addProduct: (
    payload: {
      id: string;
      name: string;
      unit: string;
      price: number;
    },
    quantity?: number,
  ) => void;
  addLaundry: (
    payload: {
      id: string;
      name: string;
      unit: string;
      price: number;
      meta?: string;
    },
    quantity?: number,
  ) => void;
  updateQuantity: (id: string, type: CartItem['type'], quantity: number) => void;
  removeItem: (id: string, type: CartItem['type']) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'waroengku_cart_v1';

function cartKey(id: string, type: CartItem['type']) {
  return `${type}:${id}`;
}

function loadStoredItems(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i &&
        typeof i.id === 'string' &&
        (i.type === 'product' || i.type === 'laundry') &&
        typeof i.quantity === 'number' &&
        i.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredItems());
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AppView>('shop');

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (items.length === 0 && view === 'checkout') {
      setView('shop');
    }
  }, [items.length, view]);

  const addProduct = useCallback(
    (
      payload: { id: string; name: string; unit: string; price: number },
      quantity = 1,
    ) => {
      const qty = Math.max(1, quantity);
      setItems((prev) => {
        const key = cartKey(payload.id, 'product');
        const existing = prev.find((i) => cartKey(i.id, i.type) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i.id, i.type) === key
              ? { ...i, quantity: i.quantity + qty }
              : i,
          );
        }
        return [
          ...prev,
          {
            id: payload.id,
            type: 'product',
            name: payload.name,
            unit: payload.unit,
            price: payload.price,
            quantity: qty,
          },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const addLaundry = useCallback(
    (
      payload: {
        id: string;
        name: string;
        unit: string;
        price: number;
        meta?: string;
      },
      quantity = 1,
    ) => {
      const qty = Math.max(1, quantity);
      setItems((prev) => {
        const key = cartKey(payload.id, 'laundry');
        const existing = prev.find((i) => cartKey(i.id, i.type) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i.id, i.type) === key
              ? { ...i, quantity: i.quantity + qty, meta: payload.meta ?? i.meta }
              : i,
          );
        }
        return [
          ...prev,
          {
            id: payload.id,
            type: 'laundry',
            name: payload.name,
            unit: payload.unit,
            price: payload.price,
            quantity: qty,
            meta: payload.meta,
          },
        ];
      });
      setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(
    (id: string, type: CartItem['type'], quantity: number) => {
      if (quantity < 1) {
        setItems((prev) =>
          prev.filter((i) => !(i.id === id && i.type === type)),
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id && i.type === type ? { ...i, quantity } : i)),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string, type: CartItem['type']) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const goToShop = useCallback(() => {
    setView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const isEmpty = items.length === 0;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      isOpen,
      view,
      isEmpty,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((o) => !o),
      goToCheckout: () => {
        if (items.length === 0) return;
        setIsOpen(false);
        setView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      goToShop,
      addProduct,
      addLaundry,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isOpen,
      view,
      isEmpty,
      goToShop,
      addProduct,
      addLaundry,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}
