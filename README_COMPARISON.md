# Perbandingan Data Settlement vs POS

## 📋 Ringkasan

Script Python telah dibuat untuk membandingkan data settlement (dari CSV) dengan data POS (dari API).

**File:** `compare_settlement.py`

## ⚠️ Masalah API

Production API (https://clinic.beautycenter.id/api/laporanpembayaran) mengembalikan **404 Error**, kemungkinan karena:
1. Endpoint memerlukan authentikasi
2. URL endpoint berbeda
3. API belum deployment atau ada perubahan

## ✅ Solusi Alternatif

### Opsi 1: Menggunakan Development Server Lokal

1. Jalankan Next.js development server:
   ```bash
   npm run dev
   ```

2. Update script Python untuk menggunakan localhost:
   - Endpoint: `http://localhost:3000/api/sales?filter=monthly&month=12&year=2025`

3. Jalankan script:
   ```bash
   python compare_settlement.py
   ```

### Opsi 2: Export Data dari Database/POS Manual

1. Export data transaksi Desember 2025 dari sistem POS
2. Save as JSON dengan format:
   ```json
   {
     "data": [
       {
         "tanggal_transaksi": "2025-12-01",
         "nama_clinic": "Beauty Center Bantul",
         "total_bayar": "150000"
       }
     ]
   }
   ```
3. Save ke `getlaporanpembayaran_desember.json`
4. Update script untuk baca file ini

### Opsi 3: Manual Verification dengan Spreadsheet

Buat file Excel/Google Sheets dengan kolom:
- Tanggal
- Cabang
- Total Settlement (CSV)
- Total POS (Manual)
- Selisih
- Status

## 📊 Data Settlement CSV (Desember 2025)

Berdasarkan file CSV yang di-upload:

### Total Per Cabang

| Cabang | Total Settlement |
|--------|-----------------|
| **Klinik DRW Skincare Purworejo** | **Rp 210,657,618** |
| **Cinic Kuotarjo** | **Rp 170,320,896** |
| Clinic magelang | Rp 79,038,232 |
| Beauty Center Wates | Rp 73,788,424 |
| Beauty Center Maguwoharjo | Rp 61,296,173 |
| Beauty Center Godean | Rp 55,533,765 |
| Beauty Center Jl paris Prawirotaman | Rp 51,312,309 |
| Beauty Center Prambanan | Rp 50,286,830 |
| Beauty Center Kotagede | Rp 48,062,109 |
| Beauty Center Bantul | Rp 42,099,792 |
| Beauty Center Muntilan | Rp 34,034,646 |
| Rumah cantik Rajawali | Rp 33,808,852 |
| Beauty Center Kaliurang | Rp 31,122,538 |

**GRAND TOTAL: Rp 941,362,184**

## 🔍 Yang Perlu Dicek

Untuk memastikan API benar, perlu verifikasi:

1. **Total per cabang** - Apakah total POS match dengan settlement?
2. **Total per hari** - Apakah ada hari tertentu yang berbeda?
3. **Pola perbedaan** - Apakah ada cabang yang selalu berbeda?

### Kemungkinan Penyebab Perbedaan

Jika ada selisih, bisa karena:
- ✅ **POS kurang dari Settlement**: Transaksi belum diinput ke POS
- ✅ **POS lebih dari Settlement**: Transaksi belum di-settle
- ✅ **Perbedaan tanggal**: Transaksi dicatat di tanggal berbeda
- ✅ **Void/Refund**: Ada pembatalan yang belum tercatat
- ✅ **Cash/Payment method**: Perbedaan metode pembayaran

## 🚀 Next Steps

1. **Start development server** atau **export data POS**
2. **Run comparison script** dengan data yang valid
3. **Analyze hasil** - lihat cabang dan tanggal mana yang berbeda
4. **Investigasi perbedaan** - cek transaksi spesifik yang menyebabkan selisih

## 📝 Notes

- Data CSV dianggap **data yang benar** (settlement manual)
- Target: Validasi apakah **data POS (API)** match dengan settlement
- Threshold perbedaan yang diterima: < Rp 1.000 (untuk rounding)
