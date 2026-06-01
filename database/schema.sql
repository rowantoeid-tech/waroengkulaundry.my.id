-- =============================================================================
-- Waroengku Laundry — Skema Database
-- Target: PostgreSQL 14+
-- Modul: Auth, Sembako (stok & penjualan), Laundry (order & status)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM
-- -----------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'owner',
  'admin',
  'kasir',
  'operator_laundry',
  'gudang'
);

CREATE TYPE stock_movement_type AS ENUM (
  'masuk',           -- pembelian / restock
  'keluar',          -- penjualan / penggunaan internal
  'penyesuaian',     -- koreksi stok fisik
  'retur_masuk',     -- retur dari pelanggan
  'retur_keluar'     -- retur ke supplier
);

CREATE TYPE payment_method AS ENUM (
  'tunai',
  'transfer',
  'qris',
  'hutang'
);

CREATE TYPE sale_status AS ENUM (
  'draft',
  'selesai',
  'dibatalkan'
);

CREATE TYPE laundry_order_status AS ENUM (
  'terima',          -- barang diterima
  'cuci',
  'kering',
  'setrika',
  'siap_ambil',
  'diambil',
  'dibatalkan'
);

CREATE TYPE laundry_service_unit AS ENUM (
  'kg',
  'pcs',
  'paket'
);

-- -----------------------------------------------------------------------------
-- MASTER & AUTH
-- -----------------------------------------------------------------------------

CREATE TABLE branches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(20) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  address       TEXT,
  phone         VARCHAR(20),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(20),
  role          user_role NOT NULL DEFAULT 'kasir',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
  code          VARCHAR(30) UNIQUE,
  name          VARCHAR(120) NOT NULL,
  phone         VARCHAR(20),
  email         VARCHAR(255),
  address       TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- SEMBAKO — Kategori, Produk, Stok
-- -----------------------------------------------------------------------------

CREATE TABLE product_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(80) NOT NULL,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sku             VARCHAR(50) NOT NULL UNIQUE,
  barcode         VARCHAR(50),
  name            VARCHAR(150) NOT NULL,
  unit            VARCHAR(20) NOT NULL DEFAULT 'pcs',  -- kg, liter, pcs, pack
  purchase_price  NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sell_price      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  min_stock       NUMERIC(12, 3) NOT NULL DEFAULT 0,   -- ambang peringatan stok menipis
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stok per cabang (denormalized qty untuk query cepat)
CREATE TABLE product_stocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id     UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, product_id)
);

-- Riwayat pergerakan stok (audit trail)
CREATE TABLE stock_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type   stock_movement_type NOT NULL,
  quantity        NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  quantity_before NUMERIC(12, 3) NOT NULL,
  quantity_after  NUMERIC(12, 3) NOT NULL,
  reference_type  VARCHAR(40),   -- 'sale', 'purchase', 'adjustment', dll.
  reference_id    UUID,
  notes           TEXT,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements (product_id, created_at DESC);
CREATE INDEX idx_stock_movements_branch ON stock_movements (branch_id, created_at DESC);

-- Penjualan sembako (POS)
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  invoice_number  VARCHAR(30) NOT NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  status          sale_status NOT NULL DEFAULT 'selesai',
  subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  payment_method  payment_method NOT NULL DEFAULT 'tunai',
  paid_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes           TEXT,
  cashier_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  sold_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, invoice_number)
);

CREATE TABLE sale_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id       UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity      NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(14, 2) NOT NULL,
  line_total    NUMERIC(14, 2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_branch_date ON sales (branch_id, sold_at DESC);

-- -----------------------------------------------------------------------------
-- LAUNDRY — Layanan, Order, Status
-- -----------------------------------------------------------------------------

CREATE TABLE laundry_services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(30) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,   -- Cuci Kering, Setrika, Express, dll.
  unit          laundry_service_unit NOT NULL DEFAULT 'kg',
  base_price    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  estimated_hours INT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE laundry_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  order_number    VARCHAR(30) NOT NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   VARCHAR(120),          -- snapshot jika walk-in tanpa akun
  customer_phone  VARCHAR(20),
  status          laundry_order_status NOT NULL DEFAULT 'terima',
  promised_at     TIMESTAMPTZ,         -- estimasi selesai
  picked_up_at    TIMESTAMPTZ,
  subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  payment_method  payment_method,
  notes           TEXT,
  received_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, order_number)
);

CREATE TABLE laundry_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES laundry_orders(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES laundry_services(id) ON DELETE RESTRICT,
  item_label      VARCHAR(80),           -- mis. "Kemeja", "Selimut"
  quantity        NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(14, 2) NOT NULL,
  line_total      NUMERIC(14, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Riwayat perubahan status (untuk tracking & notifikasi pelanggan)
CREATE TABLE laundry_status_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES laundry_orders(id) ON DELETE CASCADE,
  from_status   laundry_order_status,
  to_status     laundry_order_status NOT NULL,
  notes         TEXT,
  changed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_laundry_orders_status ON laundry_orders (branch_id, status);
CREATE INDEX idx_laundry_orders_customer ON laundry_orders (customer_id, received_at DESC);
CREATE INDEX idx_laundry_status_logs_order ON laundry_status_logs (order_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- VIEW BANTUAN
-- -----------------------------------------------------------------------------

CREATE VIEW v_products_low_stock AS
SELECT
  ps.branch_id,
  b.name AS branch_name,
  p.id AS product_id,
  p.sku,
  p.name AS product_name,
  p.unit,
  ps.quantity,
  p.min_stock
FROM product_stocks ps
JOIN products p ON p.id = ps.product_id
JOIN branches b ON b.id = ps.branch_id
WHERE p.is_active = TRUE
  AND ps.quantity <= p.min_stock;

CREATE VIEW v_laundry_orders_active AS
SELECT
  lo.id,
  lo.branch_id,
  lo.order_number,
  lo.customer_name,
  lo.customer_phone,
  lo.status,
  lo.promised_at,
  lo.received_at,
  lo.total,
  lo.paid_amount,
  (lo.total - lo.paid_amount) AS remaining_payment
FROM laundry_orders lo
WHERE lo.status NOT IN ('diambil', 'dibatalkan');

-- -----------------------------------------------------------------------------
-- TRIGGER: updated_at otomatis (contoh pada branches)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_laundry_orders_updated_at
  BEFORE UPDATE ON laundry_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
