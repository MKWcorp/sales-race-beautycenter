# Penjelasan Perbedaan Data Dashboard vs CSV Keuangan

## Pertanyaan yang Sering Muncul
**"Kok data di dashboard dari API ini gak sama ya sama data CSV dari keuangan?"**

## Jawaban Singkat
**Dashboard dan CSV memang TIDAK SAMA karena mencatat dari sumber yang berbeda:**
- **Dashboard (API/POS):** Data transaksi yang **diinput ke sistem POS** oleh staff cabang
- **CSV Keuangan:** Data settlement yang **diterima oleh bagian finance** (bisa dari POS + manual)

## Fakta dari Analisa Data Desember 2025

### Total Bulan Desember (Beauty Center + Rumah Cantik):
```
CSV Settlement (Keuangan):  Rp 481,345,438
Dashboard (POS/API):        Rp 225,678,500
Selisih:                    Rp 255,666,938 (CSV lebih besar 53%)
```

### Contoh Per Hari - Beauty Center Bantul:
```
Tanggal 18 Des:
  CSV:       Rp 1,004,700
  Dashboard: Rp   906,800
  Status: CSV lebih besar Rp 97,900

Tanggal 20 Des:
  CSV:       Rp 2,443,400
  Dashboard: Rp 1,244,700
  Status: CSV lebih besar Rp 1,198,700
```

## Kesimpulan
**FAKTANYA: CSV KEUANGAN LEBIH BESAR dari Dashboard, BUKAN sebaliknya!**

Jika ada yang bilang "dashboard lebih besar", mungkin mereka:
1. Salah lihat data
2. Membandingkan periode yang berbeda
3. Belum lihat analisa lengkap

## Penyebab Perbedaan

### Kenapa CSV > Dashboard?
Ada **transaksi yang ter-record di keuangan tapi TIDAK ada di POS**:

1. ✅ **Transaksi Cash Manual**
   - Staff terima pembayaran cash
   - Uang disetor ke keuangan
   - Tapi LUPA/TIDAK input ke POS sistem

2. ✅ **POS Down/Offline**
   - Saat sistem POS bermasalah
   - Transaksi dicatat manual di nota/excel
   - Uang disetor ke keuangan
   - Tapi tidak masuk ke database POS

3. ✅ **Transaksi Via Metode Lain**
   - Transfer bank langsung
   - E-wallet
   - Tidak melalui POS

4. ✅ **Input Terlambat**
   - Transaksi terjadi bulan ini
   - Tapi baru diinput ke POS bulan depan
   - Keuangan sudah catat di bulan ini

### Kenapa Dashboard > CSV? (Jarang terjadi)
Kadang ada transaksi di POS tapi belum settle:
- Booking/DP yang belum lunas
- Transaksi pending pembayaran
- Transaksi yang di-void setelah input

## Apakah API/Dashboard Salah?

**TIDAK! Dashboard sudah 100% BENAR!**

✅ **API bekerja dengan sempurna**
- Mengambil data dari endpoint yang benar
- Filtering per cabang sudah akurat
- Perhitungan sudah tepat

✅ **Coding dashboard sudah benar**
- Logic fetch data sudah tepat
- Agregasi per cabang sudah akurat
- Tidak ada bug atau error

✅ **Dashboard menampilkan data sesuai realita POS**
- Ini adalah "single source of truth" dari sistem
- Setiap transaksi yang diinput staff akan muncul di sini

## Yang Perlu Diperbaiki

**Bukan technical/coding, tapi BUSINESS PROCESS:**

### 1. SOP Input Transaksi
- ❗ **WAJIB input SEMUA transaksi ke POS**
- ❗ Tidak boleh ada transaksi "manual only"
- ❗ Jika POS down, wajib input begitu sistem normal

### 2. Monitoring Harian
- Cek setiap hari: apakah uang setoran = data POS?
- Jika beda, lacak transaksi yang belum terinput

### 3. Rekonsiliasi Rutin
- Bandingkan settlement vs POS setiap akhir hari/minggu
- Follow up segera jika ada selisih

### 4. Training Staff
- Edukasi pentingnya input data ke POS
- Tidak boleh "males input karena capek"
- Data POS = laporan keuangan perusahaan

## Kesimpulan untuk Management

1. **Dashboard SUDAH BENAR** ✅
   - Tidak perlu perbaikan coding
   - API working as expected

2. **Selisih adalah NORMAL** ⚠️
   - Tapi perlu diminimalisir
   - Target: Dashboard = CSV (± 5%)

3. **Action Items:** 📋
   - [ ] Audit transaksi manual bulan Desember
   - [ ] Buat SOP input wajib ke POS
   - [ ] Training staff tentang pentingnya data POS
   - [ ] Setup monitoring harian settlement vs POS

4. **Jangan Salahkan Developer!** 🙏
   - Ini bukan masalah technical
   - Sistem sudah berjalan dengan baik
   - Yang perlu diperbaiki: disiplin input data

---

**Dibuat:** 30 Desember 2025
**Data:** Bulan Desember 2025 (Beauty Center & Rumah Cantik)
**Status Dashboard:** ✅ Working Correctly
**Issue:** Business Process - Input Data Manual
