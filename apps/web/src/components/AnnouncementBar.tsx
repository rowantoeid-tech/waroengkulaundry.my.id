import './AnnouncementBar.css';

const ANNOUNCEMENTS = [
  '🎉 Promo beras 5 kg — hemat Rp 3.000 hari ini saja',
  '🧺 Laundry express 6 jam — antrian terbatas',
  '🛵 Gratis antar radius 2 km dari toko · Rp 1.500/km di luar radius',
  '⏰ Buka setiap hari 07.00 – 21.00 WIB',
];

export function AnnouncementBar() {
  const text = ANNOUNCEMENTS.join('   ·   ');

  return (
    <div className="announce-bar" aria-live="polite">
      <span className="announce-bar__label">Info Hari Ini</span>
      <div className="announce-bar__track">
        <p className="announce-bar__text">{text}</p>
        <p className="announce-bar__text" aria-hidden>
          {text}
        </p>
      </div>
    </div>
  );
}
