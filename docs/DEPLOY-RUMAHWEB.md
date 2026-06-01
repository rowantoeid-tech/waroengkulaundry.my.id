# Deploy ke waroengkulaundry.my.id (Rumahweb)

Domain **waroengkulaundry.my.id** terdaftar di Rumahweb. Frontend toko saat ini adalah aplikasi statis (React + Vite).

## Ringkasan langkah

1. **Build lokal**
   ```bash
   cd apps/web
   npm install
   npm run build
   ```
   Hasil ada di folder `apps/web/dist/`.

2. **Upload ke hosting**
   - Login panel Rumahweb → kelola domain **waroengkulaundry.my.id**.
   - Buka **File Manager** atau FTP ke folder **public_html** (atau document root domain tersebut).
   - Upload **seluruh isi** folder `dist/` (bukan folder `dist` itu sendiri), sehingga `index.html` berada di akar `public_html`.

3. **HTTPS**
   - Aktifkan SSL gratis (Let's Encrypt) di panel Rumahweb untuk domain ini.
   - Pastikan akses memakai `https://waroengkulaundry.my.id`.

4. **SPA routing (nanti, jika pakai React Router)**
   Buat file `.htaccess` di `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

5. **Backend API (fase berikutnya)**
   - Subdomain misalnya `api.waroengkulaundry.my.id`, atau
   - VPS terpisah + database PostgreSQL.
   - Atur CORS API agar mengizinkan origin `https://waroengkulaundry.my.id`.

## Kontak toko (referensi)

| | |
|---|---|
| WhatsApp | 08116144092 |
| Alamat | Jl. Sumatra No.79, RT.03/RW.Rawalele, Jombang, Ciputat, Tangerang Selatan, Banten 15414 |

Data kontak di UI web diatur di `apps/web/src/config/site.ts`.
