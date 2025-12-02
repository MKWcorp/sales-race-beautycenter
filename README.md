# Beauty Sales Race - Android TV Dashboard

Aplikasi dashboard realtime untuk memonitor performa sales cabang klinik. Didesain khusus untuk tampilan TV (Landscape, Font Besar, Kontras Tinggi).

## Fitur
- **Realtime Race:** Visualisasi balapan antar cabang berdasarkan pencapaian bulanan.
- **Progress Bar Harian:** Bar merah/kuning/hijau menunjukkan progres pencapaian target harian (0-100%).
  - 🟢 Hijau: Sudah mencapai ≥80% target harian
  - 🟡 Kuning: Mencapai 70-79% target harian  
  - 🔴 Merah: Belum mencapai 70% target harian
- **Auto Refresh:** Data diperbarui otomatis setiap 30 detik.
- **TV Optimized:** UI bersih tanpa scrollbar, cocok untuk layar besar.

## Cara Menjalankan (Development)

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Jalankan server development:
    ```bash
    npm run dev
    ```

3.  Buka link yang muncul (biasanya `http://localhost:5173`) di browser.

## Konfigurasi API

File konfigurasi API ada di `src/services/api.js`.
Saat ini aplikasi menggunakan **Mock Data** jika API gagal diakses (misal karena CORS atau Auth).

Untuk menghubungkan ke API Production:
1.  Buka `src/services/api.js`.
2.  Pastikan `API_BASE_URL` sudah benar.
3.  Jika API membutuhkan Token, tambahkan header di konfigurasi axios:
    ```javascript
    const response = await axios.get(url, {
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    });
    ```

## Cara Menampilkan di Android TV

### Opsi 1: Browser TV (Paling Cepat)
1.  Deploy aplikasi ini ke Vercel/Netlify (gratis).
2.  Buka browser di Android TV (Chrome/Puffin/Browser bawaan).
3.  Ketik URL aplikasi Anda.
4.  Tekan F11 (atau menu Fullscreen) di remote.

### Opsi 2: Android App (Web View)
Jika Anda ingin icon aplikasi di menu TV:
1.  Gunakan tools seperti "Website 2 APK Builder".
2.  Masukkan URL aplikasi web yang sudah dideploy.
3.  Install APK hasil generate ke TV.
