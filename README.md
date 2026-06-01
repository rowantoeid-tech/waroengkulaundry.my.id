# Waroengku Laundry — Sembako & Laundry

Monorepo dasar untuk aplikasi **penjualan sembako** (stok & POS) dan **bisnis laundry** (order & tracking status), dengan target **web** (admin/kasir) dan **mobile** (kasir lapangan / cek status pelanggan).

**Toko:** [waroengkulaundry.my.id](https://waroengkulaundry.my.id) · WhatsApp **08116144092** · Jl. Sumatra No.79, Jombang, Ciputat, Tangerang Selatan 15414 (domain: Rumahweb). **Deploy gratis:** [`docs/DEPLOY-VERCEL-NETLIFY.md`](docs/DEPLOY-VERCEL-NETLIFY.md) · upload manual Rumahweb: [`docs/DEPLOY-RUMAHWEB.md`](docs/DEPLOY-RUMAHWEB.md).

---

## Struktur folder

```
waroengkulaundry.my.id/
├── apps/
│   ├── api/                    # Backend REST (satu sumber data untuk web & mobile)
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # login, JWT, peran pengguna
│   │       │   ├── inventory/  # produk, stok, penjualan sembako
│   │       │   └── laundry/    # order, layanan, log status
│   │       └── common/         # middleware, error handler, DB client
│   ├── web/                    # Dashboard & kasir di browser
│   │   └── src/
│   │       ├── features/
│   │       │   ├── pos/        # kasir sembako
│   │       │   ├── inventory/  # kelola produk & stok
│   │       │   └── laundry/    # order & update status
│   │       └── components/
│   └── mobile/                 # Aplikasi Android/iOS
│       └── src/
│           ├── screens/        # layar utama per modul
│           ├── components/
│           └── services/       # pemanggilan API
├── packages/
│   └── shared/                 # tipe & konstanta dipakai web + mobile + api
├── database/
│   ├── schema.sql              # skema PostgreSQL lengkap
│   └── seed.example.sql        # contoh data awal
├── docs/
│   ├── DEPLOY-VERCEL-NETLIFY.md # deploy gratis + DNS domain
│   ├── DEPLOY-RUMAHWEB.md      # upload manual ke Rumahweb
│   └── api-contracts/          # dokumentasi endpoint (isi bertahap)
├── .env.example
└── .gitignore
```

---

## Ringkasan database

| Area | Tabel utama | Fungsi |
|------|-------------|--------|
| **Master** | `branches`, `users`, `customers` | Cabang, akun staf, data pelanggan |
| **Sembako** | `products`, `product_stocks`, `stock_movements`, `sales`, `sale_items` | Katalog, stok per cabang, riwayat mutasi, transaksi POS |
| **Laundry** | `laundry_services`, `laundry_orders`, `laundry_order_items`, `laundry_status_logs` | Jenis layanan, order, detail item, riwayat status |

### Status laundry (alur kerja)

```
terima → cuci → kering → setrika → siap_ambil → diambil
                                              ↘ dibatalkan (kapan saja sebelum diambil)
```

Setiap perubahan status sebaiknya dicatat di `laundry_status_logs` untuk audit dan notifikasi WhatsApp/SMS nanti.

### Stok sembako

- **`product_stocks`**: jumlah stok saat ini per cabang.
- **`stock_movements`**: setiap masuk/keluar/penyesuaian tercatat dengan `quantity_before` / `quantity_after`.
- Penjualan di **`sales`** + **`sale_items`** harus memicu movement tipe `keluar` agar stok konsisten.

View siap pakai:

- `v_products_low_stock` — produk di bawah `min_stock`
- `v_laundry_orders_active` — order yang belum diambil/dibatalkan

---

## Menjalankan skema database

**Prasyarat:** PostgreSQL 14+ terpasang (lokal atau cloud).

```bash
# Buat database
createdb waroengkulaundry

# Terapkan skema
psql -d waroengkulaundry -f database/schema.sql

# (Opsional) Data contoh
psql -d waroengkulaundry -f database/seed.example.sql
```

Atau lewat GUI (pgAdmin, DBeaver): buka `database/schema.sql` dan jalankan seluruh script.

Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`.

---

## Rekomendasi stack (langkah berikutnya)

| Lapisan | Pilihan disarankan | Alasan |
|---------|-------------------|--------|
| API | **Node.js + NestJS** atau **Fastify** | Cocok monorepo TypeScript, modul `inventory` / `laundry` sudah dipisah |
| ORM | **Prisma** atau **Drizzle** | Migrasi dari `schema.sql`, type-safe |
| Web | **React + Vite** atau **Next.js** | Dashboard & POS cepat dikembangkan |
| Mobile | **React Native (Expo)** | Satu codebase Android/iOS, bisa share `packages/shared` |
| Auth | JWT + refresh token | Role: `owner`, `admin`, `kasir`, `operator_laundry`, `gudang` |

---

## Panduan langkah berikutnya

Ikuti urutan ini agar tidak tumpang tindih antara modul sembako dan laundry.

### Fase 0 — Persiapan (1–2 hari)

1. Inisialisasi Git: `git init`, commit struktur folder ini.
2. Pasang PostgreSQL, jalankan `database/schema.sql`.
3. Salin `.env.example` → `.env`, isi `DATABASE_URL` dan `JWT_SECRET`.
4. Pilih stack (mis. NestJS + Prisma + Vite + Expo) dan dokumentasikan di `docs/`.

### Fase 1 — Backend inti (1–2 minggu)

1. ~~Bootstrap `apps/api` dengan health check `GET /health`.~~ ✅ (Fastify + Prisma — lihat [`apps/api/README.md`](apps/api/README.md))
2. Modul **auth**: register user pertama (owner), login, middleware role.
3. Modul **branches** & **customers** (CRUD dasar).
4. Modul **inventory**:
   - CRUD `products` & `product_categories`
   - Update stok via `stock_movements` (jangan edit `product_stocks` langsung tanpa log)
   - Endpoint penjualan: buat `sales` + kurangi stok atomik (transaction DB)
5. Modul **laundry**:
   - CRUD `laundry_services`
   - Buat order + items
   - `PATCH` status dengan validasi urutan + insert `laundry_status_logs`
6. Tulis kontrak API di `docs/api-contracts/` (OpenAPI/Swagger disarankan).

### Fase 2 — Web kasir & admin (1–2 minggu)

1. Bootstrap `apps/web`, hubungkan ke API (`VITE_API_URL`).
2. Halaman login & routing per role.
3. **POS sembako**: scan/cari produk, keranjang, bayar, cetak struk (opsional).
4. **Stok**: daftar produk, input stok masuk, alert stok menipis (`v_products_low_stock`).
5. **Laundry**: form order baru, board/kanban status, detail order + riwayat log.

### Fase 3 — Mobile (1–2 minggu)

1. Bootstrap `apps/mobile` (Expo).
2. Login staf, pilih cabang aktif.
3. Fitur prioritas:
   - Cek status order by nomor/telepon (untuk pelanggan/staf)
   - Update status laundry (operator)
   - POS ringkas sembako (kasir lapangan) — opsional jika web sudah cukup

### Fase 4 — Produksi & operasional

1. Hosting API (Railway, VPS, atau cloud Indonesia).
2. HTTPS, backup database harian, monitoring error (Sentry).
3. Integrasi WhatsApp notifikasi saat status → `siap_ambil` (Fonnte/WABA API).
4. Laporan: penjualan harian sembako, order laundry per status, laba kotor periode.

---

## Aturan bisnis yang perlu diimplementasi di API

1. **Stok tidak boleh negatif** — tolak penjualan jika `product_stocks.quantity` tidak cukup.
2. **Transisi status laundry** — hanya loncat ke status berikutnya (atau `dibatalkan`), kecuali role `admin`/`owner` boleh koreksi.
3. **Nomor invoice / order** — format unik per cabang, mis. `INV-20260601-0001`, `LDY-20260601-0042`.
4. **Multi-cabang** — semua transaksi wajib `branch_id`; user terikat cabang kecuali owner.

---

## File penting

| File | Isi |
|------|-----|
| `database/schema.sql` | Skema lengkap PostgreSQL |
| `database/seed.example.sql` | Contoh cabang, kategori, layanan laundry |
| `packages/shared/src/types/index.ts` | Tipe TypeScript selaras database |
| `packages/shared/src/constants/laundry-status.ts` | Label & urutan status untuk UI |

---

## Pertanyaan desain (putuskan sebelum coding jauh)

- Satu toko atau banyak cabang? (skema sudah mendukung multi cabang)
- Pelanggan laundry wajib terdaftar atau walk-in saja?
- Pembayaran laundry: DP di terima, pelunasan di ambil?
- Sembako: harga boleh beda per cabang? (saat ini satu `sell_price` global — bisa ditambah tabel `product_prices` per cabang nanti)

---

## Lisensi & kontak

Proyek pribadi/usaha — sesuaikan lisensi sebelum distribusi publik.

Jika Anda siap, langkah praktis berikutnya: **inisialisasi `apps/api` dengan NestJS + Prisma** mengacu pada `database/schema.sql`. Minta bantuan di chat dengan menyebut stack pilihan Anda.
#   w a r o e n g k u l a u n d r y . m y . i d  
 