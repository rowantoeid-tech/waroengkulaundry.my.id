/** Titik acuan toko & aturan ongkir (sesuai spanduk / promo) */
export const DELIVERY = {
  /** Jl. Sumatra No.79, Jombang, Ciputat */
  store: {
    lat: -6.31472,
    lng: 106.74418,
    label: 'Waroengku — Jl. Sumatra No.79',
  },
  freeRadiusKm: 2,
  ratePerKm: 1500,
  /** Akhiran agar geocoding lebih akurat di area Ciputat */
  geocodeSuffix: 'Ciputat, Tangerang Selatan, Banten, Indonesia',
} as const;
