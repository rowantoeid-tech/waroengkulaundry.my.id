import { SITE } from '@/config/site';
import './Footer.css';

export function Footer() {
  return (
    <footer id="info" className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <strong className="site-footer__brand">{SITE.fullName}</strong>
          <p>Sembako lengkap & cucian rapi — satu atap untuk rumah tangga.</p>
          <a className="site-footer__domain" href={SITE.url}>
            {SITE.domain}
          </a>
        </div>
        <div>
          <h4>Kontak & Lokasi</h4>
          <ul>
            <li>{SITE.address}</li>
            <li>
              WhatsApp:{' '}
              <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>Buka {SITE.hours}</li>
          </ul>
        </div>
        <div>
          <h4>Catatan</h4>
          <p className="site-footer__fine">
            Katalog & harga di halaman ini masih data contoh. Stok real-time
            menyusul setelah backend terhubung.
          </p>
        </div>
      </div>
      <p className="site-footer__copy">
        © {new Date().getFullYear()} {SITE.name} · {SITE.addressShort}
      </p>
    </footer>
  );
}
