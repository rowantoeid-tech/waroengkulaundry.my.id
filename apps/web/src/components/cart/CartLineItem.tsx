import type { CartItem } from '@/types/cart';
import { formatRupiah } from '@/utils/format';
import { getLineTotal } from '@/utils/order';
import './CartLineItem.css';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  compact?: boolean;
}

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: CartLineItemProps) {
  const lineTotal = getLineTotal(item);

  return (
    <li
      className={`cart-line ${compact ? 'cart-line--compact' : ''}`}
      data-type={item.type}
    >
      <div className="cart-line__info">
        <span className={`cart-line__tag cart-line__tag--${item.type}`}>
          {item.type === 'product' ? 'Sembako' : 'Laundry'}
        </span>
        <strong className="cart-line__name">{item.name}</strong>
        <small className="cart-line__unit">
          {formatRupiah(item.price)} / {item.unit}
          {item.meta ? ` · ${item.meta}` : ''}
        </small>
      </div>

      <div className="cart-line__actions">
        <div className="qty-control" role="group" aria-label={`Jumlah ${item.name}`}>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          <span aria-live="polite">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
        {!compact && (
          <button type="button" className="cart-line__remove" onClick={onRemove}>
            Hapus
          </button>
        )}
      </div>

      <div className="cart-line__total">{formatRupiah(lineTotal)}</div>
    </li>
  );
}
