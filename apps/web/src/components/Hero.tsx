import { SITE } from '@/config/site';
import './Hero.css';

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner container">
        <div className="hero__copy">
          <p className="hero__greeting">Selamat datang, Bu / Pak 👋</p>
          <h1 className="hero__title">
            Belanja sembako{' '}
            <em>seperti di pasar</em>
            <br />
            <span>— rapi & praktis seperti minimarket</span>
          </h1>
          <p className="hero__desc">
            Harga terpampang, stok terbaca, laundry sekalian. Satu warung untuk
            kebutuhan rumah tangga harian Anda.
          </p>

          <div className="hero__chips">
            <span>📍 {SITE.addressShort}</span>
            <span>✓ Stok update harian</span>
            <span>✓ Cuci selesai ± 1–2 hari</span>
          </div>

          <div className="hero__cta">
            <a href="#katalog" className="hero__btn hero__btn--primary">
              Lihat Katalog
            </a>
            <a href="#laundry" className="hero__btn hero__btn--secondary">
              Order Laundry
            </a>
            <a
              href={SITE.whatsappUrl}
              className="hero__btn hero__btn--wa"
              target="_blank"
              rel="noreferrer"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>

        <aside className="hero__board" aria-label="Ringkasan toko hari ini">
          <div className="hero__board-head">Papan Harga & Info</div>
          <ul className="hero__board-list">
            <li>
              <span>Beras 5 kg</span>
              <strong>Rp 72.000</strong>
            </li>
            <li>
              <span>Minyak 2 L</span>
              <strong>Rp 36.000</strong>
            </li>
            <li>
              <span>Cuci + setrika</span>
              <strong>Rp 9.000/kg</strong>
            </li>
            <li className="hero__board-highlight">
              <span>Jam buka</span>
              <strong>{SITE.hours.replace(' WIB', '')}</strong>
            </li>
          </ul>
          <p className="hero__board-foot">
            *Harga dapat berubah — lihat label di rak & katalog online
          </p>
        </aside>
      </div>
    </section>
  );
}
