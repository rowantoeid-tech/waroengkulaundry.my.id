import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/mockProducts';
import { formatRupiah } from '@/utils/format';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0 || product.badge === 'habis';
  const maxQty = outOfStock ? 1 : Math.min(99, Math.max(1, product.stock));

  return (
    <article className={`product-card ${outOfStock ? 'product-card--disabled' : ''}`}>
      {product.badge && product.badge !== 'habis' && (
        <span className={`product-card__ribbon product-card__ribbon--${product.badge}`}>
          {product.badge === 'promo' ? 'Promo' : 'Baru'}
        </span>
      )}
      {outOfStock && <span className="product-card__ribbon product-card__ribbon--habis">Habis</span>}

      <div className="product-card__visual">{product.emoji}</div>

      <div className="product-card__dense">
        <span className="product-card__sku">{product.sku}</span>
        <span className="product-card__stock">
          Stok: <strong>{outOfStock ? 0 : product.stock}</strong> {product.unit}
        </span>
      </div>

      <h3 className="product-card__name">{product.name}</h3>

      {product.note && <p className="product-card__note">{product.note}</p>}

      <div className="product-card__footer">
        <div className="product-card__price">
          <span className="product-card__price-label">Harga</span>
          <strong>{formatRupiah(product.price)}</strong>
          <small>/ {product.unit}</small>
        </div>

        <div className="product-card__cart-row">
          <label className="product-card__qty">
            <span className="sr-only">Jumlah</span>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={qty}
              disabled={outOfStock}
              onChange={(e) =>
                setQty(
                  Math.min(
                    maxQty,
                    Math.max(1, parseInt(e.target.value, 10) || 1),
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="product-card__add"
            disabled={outOfStock}
            onClick={() => {
              addProduct(
                {
                  id: product.id,
                  name: product.name,
                  unit: product.unit,
                  price: product.price,
                },
                qty,
              );
              setQty(1);
            }}
          >
            + Keranjang
          </button>
        </div>
      </div>
    </article>
  );
}
