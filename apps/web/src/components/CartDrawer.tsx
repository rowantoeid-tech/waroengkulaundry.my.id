import { useCart } from '@/context/CartContext';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { formatRupiah } from '@/utils/format';
import './CartDrawer.css';

export function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    goToCheckout,
    view,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-root" role="presentation">
      <button
        type="button"
        className="cart-drawer-backdrop"
        onClick={closeCart}
        aria-label="Tutup keranjang"
      />
      <aside className="cart-drawer" aria-label="Keranjang belanja">
        <header className="cart-drawer__head">
          <div>
            <h2>Keranjang Belanja</h2>
            <p className="cart-drawer__sub">
              Sembako & order laundry dalam satu transaksi
            </p>
          </div>
          <button type="button" className="cart-drawer__close" onClick={closeCart}>
            ✕
          </button>
        </header>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span aria-hidden>🛒</span>
              <p>Keranjang masih kosong</p>
              <small>Tambah sembako atau layanan laundry dari halaman utama</small>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map((item) => (
                <CartLineItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  onUpdateQuantity={(qty) =>
                    updateQuantity(item.id, item.type, qty)
                  }
                  onRemove={() => removeItem(item.id, item.type)}
                />
              ))}
            </ul>
          )}
        </div>

        <footer className="cart-drawer__foot">
          <div className="cart-drawer__total-row">
            <span>Subtotal ({items.length} jenis item)</span>
            <strong>{formatRupiah(subtotal)}</strong>
          </div>
          <p className="cart-drawer__note">
            Total akhir termasuk ongkir dihitung di halaman checkout. Gratis antar
            radius 2 km untuk belanja sembako min. Rp 50.000.
          </p>
          <button
            type="button"
            className="cart-drawer__checkout"
            disabled={items.length === 0}
            onClick={goToCheckout}
          >
            Lanjut Checkout
          </button>
          {view === 'checkout' && items.length > 0 && (
            <p className="cart-drawer__hint">Anda sedang di halaman checkout</p>
          )}
          {items.length > 0 && (
            <button type="button" className="cart-drawer__clear" onClick={clearCart}>
              Kosongkan keranjang
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
