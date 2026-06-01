import { useCart } from '@/context/CartContext';
import './CartButton.css';

export function CartButton({ variant = 'header' }: { variant?: 'header' | 'float' }) {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      className={`cart-btn cart-btn--${variant}`}
      onClick={toggleCart}
      aria-label={`Keranjang belanja, ${itemCount} item`}
    >
      <span className="cart-btn__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6h15l-1.5 9h-12L6 6zM6 6L5 3H2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="18" cy="20" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="cart-btn__label">Keranjang</span>
      {itemCount > 0 && (
        <span className="cart-btn__badge">{itemCount > 99 ? '99+' : itemCount}</span>
      )}
    </button>
  );
}
