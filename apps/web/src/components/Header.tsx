import { SITE } from '@/config/site';
import { CartButton } from './CartButton';
import './Header.css';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <a href="/" className="site-header__brand">
          <span className="site-header__logo" aria-hidden>
            🏪
          </span>
          <div>
            <span className="site-header__name">Waroengku</span>
            <span className="site-header__tagline">Sembako · Laundry</span>
          </div>
        </a>

        <nav className="site-header__nav" aria-label="Navigasi utama">
          <a href="#katalog">Katalog</a>
          <a href="#laundry">Laundry</a>
          <a href="#info">Info Toko</a>
        </nav>

        <div className="site-header__actions">
          <a
            className="site-header__wa"
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <CartButton variant="header" />
        </div>
      </div>
    </header>
  );
}
