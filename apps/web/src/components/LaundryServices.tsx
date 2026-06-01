import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { MOCK_LAUNDRY_SERVICES } from '@/data/mockLaundryServices';
import { formatRupiah } from '@/utils/format';
import './LaundryServices.css';

export function LaundryServices() {
  const { addLaundry } = useCart();
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const getQty = (id: string) => qtyById[id] ?? 1;

  const setQty = (id: string, value: number) => {
    setQtyById((prev) => ({ ...prev, [id]: Math.max(1, value) }));
  };

  return (
    <section id="laundry" className="laundry section section--alt">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-head__eyebrow">Layanan Cuci</span>
            <h2>Menu Laundry</h2>
            <p>
              Pilih paket — estimasi waktu tertera. Tambahkan ke keranjang untuk
              gabung dengan belanja sembako.
            </p>
          </div>
        </header>

        <div className="laundry__grid">
          {MOCK_LAUNDRY_SERVICES.map((service) => (
            <article key={service.id} className="laundry-card">
              {service.highlight && (
                <span className="laundry-card__badge">{service.highlight}</span>
              )}

              <div className="laundry-card__icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p className="laundry-card__desc">{service.description}</p>

              <dl className="laundry-card__meta">
                <div>
                  <dt>Harga</dt>
                  <dd>
                    {formatRupiah(service.price)}
                    <span> / {service.unit}</span>
                  </dd>
                </div>
                <div>
                  <dt>Estimasi</dt>
                  <dd>± {service.estimatedHours} jam</dd>
                </div>
                <div>
                  <dt>Kode</dt>
                  <dd>{service.code}</dd>
                </div>
              </dl>

              <div className="laundry-card__order">
                <label>
                  Jumlah ({service.unit})
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={getQty(service.id)}
                    onChange={(e) =>
                      setQty(service.id, parseInt(e.target.value, 10) || 1)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="laundry-card__btn"
                  onClick={() => {
                    const qty = getQty(service.id);
                    addLaundry(
                      {
                        id: service.id,
                        name: service.name,
                        unit: service.unit,
                        price: service.price,
                        meta: `${qty} ${service.unit} · ±${service.estimatedHours} jam`,
                      },
                      qty,
                    );
                  }}
                >
                  + Keranjang
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="laundry__flow">
          <h3>Alur status cucian Anda</h3>
          <ol>
            <li>Diterima</li>
            <li>Cuci</li>
            <li>Kering</li>
            <li>Setrika</li>
            <li>Siap diambil</li>
          </ol>
          <p>Cek progres lewat nomor order — fitur tracking menyusul di fase berikutnya.</p>
        </div>
      </div>
    </section>
  );
}
