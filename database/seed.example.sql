-- Contoh data awal (jalankan setelah schema.sql)
-- Sesuaikan password_hash setelah modul auth siap

INSERT INTO branches (code, name, address, phone)
VALUES (
  'HQ01',
  'Waroengku Laundry',
  'Jl. Sumatra No.79, RT.03/RW.Rawalele, Jombang, Kec. Ciputat, Kota Tangerang Selatan, Banten 15414',
  '08116144092'
);

INSERT INTO product_categories (name, sort_order) VALUES
  ('Beras & Serealia', 1),
  ('Minyak & Bumbu', 2),
  ('Sembako Lainnya', 3);

INSERT INTO laundry_services (code, name, unit, base_price, estimated_hours) VALUES
  ('CUCI_KERING', 'Cuci Kering', 'kg', 7000, 24),
  ('CUCI_SETRIKA', 'Cuci + Setrika', 'kg', 9000, 48),
  ('SETRIKA', 'Setrika Saja', 'pcs', 5000, 12),
  ('EXPRESS', 'Express (6 jam)', 'kg', 12000, 6);
