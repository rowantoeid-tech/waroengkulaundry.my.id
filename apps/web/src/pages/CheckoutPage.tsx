import { useMemo, useState, type FormEvent } from 'react';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartButton } from '@/components/CartButton';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { SITE } from '@/config/site';
import {
  EMPTY_SHIPPING_FORM,
  type ShippingFormData,
} from '@/types/checkout';
import { formatRupiah } from '@/utils/format';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  FREE_DELIVERY_MIN_ORDER,
  getDeliveryFee,
  isFreeDeliveryEligible,
} from '@/utils/order';
import './CheckoutPage.css';

type FormErrors = Partial<Record<keyof ShippingFormData, string>>;

function validateForm(form: ShippingFormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.customerName.trim()) errors.customerName = 'Nama wajib diisi';
  if (!form.phone.trim()) errors.phone = 'Nomor HP wajib diisi';
  else if (!/^[\d\s+\-()]{8,16}$/.test(form.phone.trim())) {
    errors.phone = 'Format nomor tidak valid';
  }
  if (form.fulfillment === 'antar' && !form.addressLine.trim()) {
    errors.addressLine = 'Alamat pengiriman wajib diisi';
  }
  return errors;
}

export function CheckoutPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    goToShop,
    itemCount,
  } = useCart();

  const [form, setForm] = useState<ShippingFormData>(EMPTY_SHIPPING_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const deliveryFee = useMemo(
    () => getDeliveryFee(subtotal, form.fulfillment),
    [subtotal, form.fulfillment],
  );

  const total = subtotal + deliveryFee;
  const freeDelivery = isFreeDeliveryEligible(subtotal, form.fulfillment);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_MIN_ORDER - subtotal);

  const hasSembako = items.some((i) => i.type === 'product');

  const updateField = <K extends keyof ShippingFormData>(
    key: K,
    value: ShippingFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const message = buildWhatsAppOrderMessage(
      items,
      subtotal,
      deliveryFee,
      form,
    );
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  if (items.length === 0) {
    return (
      <div className="checkout checkout--empty">
        <div className="container checkout__empty-inner">
          <span aria-hidden>🛒</span>
          <h1>Keranjang kosong</h1>
          <p>Tambahkan produk sembako atau layanan laundry terlebih dahulu.</p>
          <button type="button" className="checkout__btn-primary" onClick={goToShop}>
            Kembali belanja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <header className="checkout__topbar">
        <div className="container checkout__topbar-inner">
          <button type="button" className="checkout__back" onClick={goToShop}>
            ← Kembali belanja
          </button>
          <span className="checkout__brand">{SITE.fullName}</span>
          <CartButton variant="header" />
        </div>
      </header>

      <main className="container checkout__main">
        <header className="checkout__head">
          <h1>Checkout & Ringkasan Pesanan</h1>
          <p>
            Periksa item ({itemCount} qty), isi data pengiriman, lalu kirim pesanan
            via WhatsApp untuk konfirmasi tim kami.
          </p>
        </header>

        {submitted && (
          <div className="checkout__banner checkout__banner--success" role="status">
            Pesanan terbuka di WhatsApp. Tim Waroengku akan membalas untuk konfirmasi
            stok, ongkir, dan jadwal.
            <button
              type="button"
              className="checkout__banner-dismiss"
              onClick={() => setSubmitted(false)}
            >
              Tutup
            </button>
          </div>
        )}

        <div className="checkout__grid">
          <section className="checkout__panel" aria-labelledby="order-summary-title">
            <h2 id="order-summary-title">Ringkasan pesanan</h2>

            <ul className="checkout__items">
              {items.map((item) => (
                <CartLineItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  compact
                  onUpdateQuantity={(qty) =>
                    updateQuantity(item.id, item.type, qty)
                  }
                  onRemove={() => removeItem(item.id, item.type)}
                />
              ))}
            </ul>

            <dl className="checkout__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatRupiah(subtotal)}</dd>
              </div>
              <div>
                <dt>
                  {form.fulfillment === 'ambil'
                    ? 'Pengambilan'
                    : 'Ongkir antar'}
                </dt>
                <dd>
                  {form.fulfillment === 'ambil'
                    ? 'Ambil di toko'
                    : freeDelivery
                      ? 'Gratis (radius 2 km)'
                      : 'Dikonfirmasi via WA'}
                </dd>
              </div>
              <div className="checkout__totals-grand">
                <dt>Total estimasi</dt>
                <dd>{formatRupiah(total)}</dd>
              </div>
            </dl>

            {form.fulfillment === 'antar' && hasSembako && !freeDelivery && (
              <p className="checkout__promo-hint">
                Tambah {formatRupiah(amountToFreeDelivery)} lagi untuk gratis antar
                sembako radius 2 km (min. {formatRupiah(FREE_DELIVERY_MIN_ORDER)}).
              </p>
            )}

            {freeDelivery && (
              <p className="checkout__promo-hint checkout__promo-hint--ok">
                ✓ Anda mendapat gratis antar sembako (radius 2 km).
              </p>
            )}
          </section>

          <section className="checkout__panel checkout__panel--form">
            <h2>Data pengiriman</h2>

            <form className="checkout__form" onSubmit={handleSubmit} noValidate>
              <fieldset className="checkout__fulfillment">
                <legend>Cara terima pesanan</legend>
                <label
                  className={`checkout__radio ${
                    form.fulfillment === 'antar' ? 'checkout__radio--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value="antar"
                    checked={form.fulfillment === 'antar'}
                    onChange={() => updateField('fulfillment', 'antar')}
                  />
                  <span>
                    <strong>Antar ke alamat</strong>
                    <small>Gratis radius 2 km jika belanja sembako ≥ Rp 50.000</small>
                  </span>
                </label>
                <label
                  className={`checkout__radio ${
                    form.fulfillment === 'ambil' ? 'checkout__radio--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value="ambil"
                    checked={form.fulfillment === 'ambil'}
                    onChange={() => updateField('fulfillment', 'ambil')}
                  />
                  <span>
                    <strong>Ambil sendiri di toko</strong>
                    <small>{SITE.addressShort}</small>
                  </span>
                </label>
              </fieldset>

              <div className="checkout__field">
                <label htmlFor="customerName">Nama lengkap *</label>
                <input
                  id="customerName"
                  type="text"
                  autoComplete="name"
                  value={form.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                />
                {errors.customerName && (
                  <span className="checkout__error">{errors.customerName}</span>
                )}
              </div>

              <div className="checkout__field">
                <label htmlFor="phone">Nomor WhatsApp / HP *</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="08123456789"
                />
                {errors.phone && (
                  <span className="checkout__error">{errors.phone}</span>
                )}
              </div>

              {form.fulfillment === 'antar' && (
                <>
                  <div className="checkout__field">
                    <label htmlFor="addressLine">Alamat pengiriman *</label>
                    <textarea
                      id="addressLine"
                      rows={3}
                      autoComplete="street-address"
                      value={form.addressLine}
                      onChange={(e) => updateField('addressLine', e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                    />
                    {errors.addressLine && (
                      <span className="checkout__error">{errors.addressLine}</span>
                    )}
                  </div>

                  <div className="checkout__field">
                    <label htmlFor="addressDetail">
                      Patokan / detail tambahan (opsional)
                    </label>
                    <input
                      id="addressDetail"
                      type="text"
                      value={form.addressDetail}
                      onChange={(e) => updateField('addressDetail', e.target.value)}
                      placeholder="Dekat warung, warna pagar, lantai, dll."
                    />
                  </div>
                </>
              )}

              <div className="checkout__field">
                <label htmlFor="notes">Catatan pesanan (opsional)</label>
                <textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Mis. cucian express, minta bon, waktu antar sore"
                />
              </div>

              <div className="checkout__form-actions">
                <button type="submit" className="checkout__btn-primary">
                  Kirim pesanan via WhatsApp
                </button>
                <button
                  type="button"
                  className="checkout__btn-secondary"
                  onClick={goToShop}
                >
                  Tambah item lain
                </button>
              </div>

              <p className="checkout__fine">
                Dengan mengirim, Anda setuju harga final dikonfirmasi oleh kasir
                (stok & ongkir). Buka {SITE.hours}.
              </p>
            </form>
          </section>
        </div>
      </main>

      <CartDrawer />
    </div>
  );
}
