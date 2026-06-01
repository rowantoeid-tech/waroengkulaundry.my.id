# Waroengku API

Backend REST (Fastify + Prisma) untuk web & mobile.

## Prasyarat

1. PostgreSQL 14+ dengan database `waroengkulaundry`
2. Jalankan skema & seed:

```bash
psql -d waroengkulaundry -f ../../database/schema.sql
psql -d waroengkulaundry -f ../../database/seed.example.sql
```

3. Salin `.env.example` di **root proyek** menjadi `.env` dan isi `DATABASE_URL`

## Menjalankan

```bash
cd apps/api
npm install
npm run prisma:generate
npm run dev
```

Server: **http://localhost:3000**

## Endpoint (Fase 1)

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/health` | Status layanan + koneksi DB |
| GET | `/api/health` | Sama seperti di atas |
| GET | `/api/catalog/products` | Produk aktif + stok cabang (`?branch_id=`) |
| GET | `/api/catalog/laundry-services` | Layanan laundry aktif |

## Langkah berikutnya

- Modul **auth** (login JWT, role)
- CRUD cabang & pelanggan
- Penjualan POS + mutasi stok atomik
- Order laundry + log status

Kontrak lengkap: [`docs/api-contracts/README.md`](../../docs/api-contracts/README.md)
