import { useMemo, useState } from 'react';
import {
  MOCK_PRODUCTS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '@/data/mockProducts';
import { ProductCard } from './ProductCard';
import './ProductCatalog.css';

export function ProductCatalog() {
  const [category, setCategory] = useState<ProductCategory>('semua');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchCat = category === 'semua' || p.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [category, search]);

  return (
    <section id="katalog" className="catalog section">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-head__eyebrow">Rak Sembako</span>
            <h2>Katalog Produk</h2>
            <p>
              {filtered.length} item ditampilkan — harga tertera seperti etiket
              di warung, tampilan rapi untuk belanja cepat.
            </p>
          </div>
        </header>

        <div className="catalog__toolbar">
          <div className="catalog__tabs" role="tablist" aria-label="Kategori produk">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`catalog__tab ${category === cat.id ? 'catalog__tab--active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <label className="catalog__search">
            <span className="sr-only">Cari produk</span>
            <input
              type="search"
              placeholder="Cari nama / kode SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="catalog__empty">Produk tidak ditemukan. Coba kata kunci lain.</p>
        ) : (
          <div className="catalog__grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
