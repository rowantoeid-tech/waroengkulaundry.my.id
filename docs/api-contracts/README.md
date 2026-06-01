# Kontrak API Waroengku

Base URL lokal: `http://localhost:3000`

## Health

```
GET /health
GET /api/health
```

**Response 200**

```json
{
  "status": "ok",
  "service": "waroengku-api",
  "version": "0.1.0",
  "timestamp": "2026-06-01T10:00:00.000Z",
  "database": "connected"
}
```

`database` bernilai `unavailable` jika `DATABASE_URL` kosong atau PostgreSQL tidak terjangkau.

## Katalog (publik, read-only)

### Produk sembako

```
GET /api/catalog/products?branch_id={uuid}
```

**Response 200**

```json
{
  "branchId": "uuid",
  "items": [
    {
      "id": "uuid",
      "sku": "BR-001",
      "name": "Beras Premium 5kg",
      "category": "Beras & Serealia",
      "unit": "pack",
      "price": 72000,
      "stock": 12,
      "badge": "habis"
    }
  ]
}
```

### Layanan laundry

```
GET /api/catalog/laundry-services
```

**Response 200**

```json
{
  "items": [
    {
      "id": "uuid",
      "code": "CUCI_KERING",
      "name": "Cuci Kering",
      "unit": "kg",
      "price": 7000,
      "estimatedHours": 24,
      "highlight": "Express"
    }
  ]
}
```

## Rencana (belum diimplementasi)

- `POST /api/auth/login`
- `GET/POST /api/inventory/products`
- `POST /api/inventory/sales`
- `GET/POST /api/laundry/orders`
- `PATCH /api/laundry/orders/:id/status`
