import pandas as pd
import requests
import json
from datetime import datetime
import re

# Mapping nama cabang dari CSV ke nama API
CABANG_MAPPING = {
    "Clinic magelang": "Klinik DRW Skincare Magelang",
    "clinic purworejo": "Klinik DRW Skincare Purworejo",
    "Cinic Kuotarjo": "Klinik DRW Skincare Kutoarjo",
    "Rumah cantik Rajawali": "Rumah Cantik Rajawali",
    "Kaliurang": "Beauty Center Kaliurang",
    "Jl paris Prawirotaman": "Beauty Center Parangtritis",
    "Maguwoharjo tajem": "Beauty Center Maguwoharjo",
    "Kota gede": "Beauty Center Kotagede",
    "bantul": "Beauty Center Bantul",
    "Prambanan": "Beauty Center Prambanan",
    "Godean": "Beauty Center Godean",
    "Muntilan": "Beauty Center Muntilan",
    "Wates": "Beauty Center Wates",
}

def clean_currency(value):
    """Konversi format Rupiah ke angka"""
    if pd.isna(value) or value == '':
        return 0
    if isinstance(value, (int, float)):
        return float(value)
    # Hapus 'Rp', koma, titik, spasi
    cleaned = str(value).replace('Rp', '').replace(',', '').replace('.', '').replace(' ', '')
    try:
        return float(cleaned)
    except:
        return 0

def parse_csv_settlement(file_path):
    """Parse CSV settlement dan ekstrak data omset per cabang per tanggal"""
    # Baca CSV, skip baris header yang tidak perlu
    df = pd.read_csv(file_path, skiprows=2)
    
    # Ambil baris cabang (skip baris revenue/total)
    df_cabang = df[df.iloc[:, 0].notna() & (df.iloc[:, 0] != 'revenue')].copy()
    
    # Dictionary untuk menyimpan data
    data = {}
    
    for idx, row in df_cabang.iterrows():
        cabang_csv = row.iloc[0]
        if cabang_csv == 'revenue' or pd.isna(cabang_csv):
            continue
            
        # Get mapped nama cabang
        cabang_api = CABANG_MAPPING.get(cabang_csv, cabang_csv)
        
        # Ambil data dari kolom tanggal (kolom index 3-33 untuk tanggal 1-31)
        data[cabang_api] = {}
        for day in range(1, 32):
            col_idx = day + 2  # Kolom mulai dari index 3 untuk tanggal 1
            if col_idx < len(row):
                value = clean_currency(row.iloc[col_idx])
                if value > 0:
                    # Format tanggal 2025-12-DD
                    tanggal = f"2025-12-{day:02d}"
                    data[cabang_api][tanggal] = value
    
    return data

def fetch_api_data(year=2025, month=12):
    """Fetch data dari API untuk bulan tertentu"""
    
    all_data = []
    year_month = f"{year}-{month:02d}"
    dari_tanggal = f"{year}-{month:02d}-01"
    
    # Hitung hari terakhir bulan
    if month == 12:
        sampai_tanggal = f"{year}-{month:02d}-31"
    else:
        sampai_tanggal = f"{year}-{month:02d}-30"
    
    # Coba beberapa endpoint dengan parameter yang benar
    endpoints = [
        # Endpoint perawatan (services/treatment) - kemungkinan ini yang digunakan
        f"https://clinic.beautycenter.id/api/laporan-penjualan-perawatan?dari_tanggal={dari_tanggal}&sampai_tanggal={sampai_tanggal}",
        # Endpoint produk (products)
        f"https://clinic.beautycenter.id/api/laporan-penjualan-produk?dari_tanggal={dari_tanggal}&sampai_tanggal={sampai_tanggal}",
    ]
    
    data_perawatan = []
    data_produk = []
    
    for endpoint in endpoints:
        try:
            print(f"🔄 Mencoba endpoint: {endpoint}")
            
            page = 1
            max_pages = 200
            endpoint_data = []
            
            while page <= max_pages:
                try:
                    # Tambahkan parameter page ke URL
                    if "?" in endpoint:
                        url = f"{endpoint}&page={page}"
                    else:
                        url = f"{endpoint}?page={page}"
                    
                    response = requests.get(url, timeout=30)
                    
                    if response.status_code != 200:
                        print(f"   ❌ Error: status {response.status_code}")
                        break
                        
                    result = response.json()
                    data = result.get('data', [])
                    
                    if not data:
                        break
                        
                    endpoint_data.extend(data)
                    print(f"   Page {page}: {len(data)} records")
                    
                    if not result.get('next_page_url'):
                        break
                        
                    page += 1
                    
                except Exception as e:
                    print(f"   ❌ Error fetching page {page}: {e}")
                    break
            
            if endpoint_data:
                if "perawatan" in endpoint:
                    data_perawatan = endpoint_data
                    print(f"   ✅ Total {len(endpoint_data)} transaksi perawatan\n")
                else:
                    data_produk = endpoint_data
                    print(f"   ✅ Total {len(endpoint_data)} transaksi produk\n")
                    
        except Exception as e:
            print(f"❌ Error dengan endpoint {endpoint}: {e}\n")
            continue
    
    # Gabungkan data perawatan dan produk
    all_data = data_perawatan + data_produk
    
    if not all_data:
        print("❌ Tidak ada data yang berhasil di-fetch dari semua endpoint")
        return {}
    
    print(f"📊 Total gabungan: {len(all_data)} transaksi (Perawatan: {len(data_perawatan)}, Produk: {len(data_produk)})\n")
    
    # Filter dan agregasi data per cabang per tanggal untuk bulan yang diminta
    aggregated = {}
    
    for record in all_data:
        # Coba beberapa field untuk tanggal
        tanggal = record.get('tanggal_transaksi') or record.get('tanggal') or record.get('created_at', '')
        if isinstance(tanggal, str) and ' ' in tanggal:
            tanggal = tanggal.split(' ')[0]  # Ambil bagian tanggal saja
        
        if not tanggal or not str(tanggal).startswith(year_month):
            continue
            
        # Coba beberapa field untuk nama cabang
        cabang = record.get('nama_clinic') or record.get('nama_klinik') or record.get('klinik', '')
        
        # Coba beberapa field untuk total bayar
        total_bayar = float(record.get('total_bayar') or record.get('total') or record.get('nominal') or 0)
        
        if not cabang:
            continue
        
        if cabang not in aggregated:
            aggregated[cabang] = {}
        if tanggal not in aggregated[cabang]:
            aggregated[cabang][tanggal] = 0
        
        aggregated[cabang][tanggal] += total_bayar
    
    return aggregated

def compare_data(csv_data, api_data):
    """Bandingkan data CSV settlement dengan data API"""
    
    print("=" * 100)
    print("📊 HASIL PERBANDINGAN DATA SETTLEMENT vs API POS")
    print("=" * 100)
    print()
    
    # Kumpulkan semua cabang
    all_cabang = set(csv_data.keys()) | set(api_data.keys())
    
    # Pisahkan Beauty Center/Rumah Cantik vs Klinik
    beauty_center_cabang = [c for c in all_cabang if 'Beauty Center' in c or 'Rumah Cantik' in c or 'Rumah cantik' in c]
    klinik_cabang = [c for c in all_cabang if 'Klinik' in c or 'Clinic' in c or 'Cinic' in c]
    
    total_selisih = 0
    total_csv = 0
    total_api = 0
    
    total_selisih_bc = 0
    total_csv_bc = 0
    total_api_bc = 0
    
    total_selisih_klinik = 0
    total_csv_klinik = 0
    total_api_klinik = 0
    
    cabang_with_diff = []
    cabang_with_diff_bc = []
    cabang_with_diff_klinik = []
    
    for cabang in sorted(all_cabang):
        csv_cabang = csv_data.get(cabang, {})
        api_cabang = api_data.get(cabang, {})
        
        # Total per cabang
        total_csv_cabang = sum(csv_cabang.values())
        total_api_cabang = sum(api_cabang.values())
        selisih_cabang = total_csv_cabang - total_api_cabang
        
        total_csv += total_csv_cabang
        total_api += total_api_cabang
        total_selisih += selisih_cabang
        
        # Kategorisasi
        is_beauty_center = cabang in beauty_center_cabang
        is_klinik = cabang in klinik_cabang
        
        if is_beauty_center:
            total_csv_bc += total_csv_cabang
            total_api_bc += total_api_cabang
            total_selisih_bc += selisih_cabang
        elif is_klinik:
            total_csv_klinik += total_csv_cabang
            total_api_klinik += total_api_cabang
            total_selisih_klinik += selisih_cabang
        
        if abs(selisih_cabang) > 1000:  # Threshold Rp 1.000
            item = {
                'cabang': cabang,
                'total_csv': total_csv_cabang,
                'total_api': total_api_cabang,
                'selisih': selisih_cabang
            }
            cabang_with_diff.append(item)
            
            if is_beauty_center:
                cabang_with_diff_bc.append(item)
            elif is_klinik:
                cabang_with_diff_klinik.append(item)
    
    # Tampilkan ringkasan BEAUTY CENTER & RUMAH CANTIK ONLY
    print(f"🏢 RINGKASAN BEAUTY CENTER & RUMAH CANTIK SAJA (Desember 2025)")
    print(f"-" * 100)
    print(f"{'Total Settlement (CSV)':.<50} Rp {total_csv_bc:>20,.0f}")
    print(f"{'Total POS (API)':.<50} Rp {total_api_bc:>20,.0f}")
    print(f"{'SELISIH':.<50} Rp {total_selisih_bc:>20,.0f}")
    print()
    
    if abs(total_selisih_bc) < 1000:
        print("✅ DATA BEAUTY CENTER SUDAH MATCH! Selisih di bawah Rp 1.000")
    else:
        persen_bc = (abs(total_selisih_bc) / total_csv_bc * 100) if total_csv_bc > 0 else 0
        if total_selisih_bc > 0:
            print(f"⚠️  SETTLEMENT LEBIH BESAR: Rp {total_selisih_bc:,.0f} ({persen_bc:.2f}%)")
            print(f"    → Ada transaksi yang belum masuk ke sistem POS")
        else:
            print(f"⚠️  POS LEBIH BESAR: Rp {abs(total_selisih_bc):,.0f} ({persen_bc:.2f}%)")
            print(f"    → Ada transaksi di POS yang belum di-settle")
    
    print()
    print("-" * 100)
    print(f"📊 RINGKASAN KLINIK (untuk informasi)")
    print(f"-" * 100)
    print(f"{'Total Settlement Klinik (CSV)':.<50} Rp {total_csv_klinik:>20,.0f}")
    print(f"{'Total POS Klinik (API)':.<50} Rp {total_api_klinik:>20,.0f}")
    print(f"{'SELISIH Klinik':.<50} Rp {total_selisih_klinik:>20,.0f}")
    
    print()
    print("-" * 100)
    print(f"📊 GRAND TOTAL SEMUA CABANG")
    print(f"-" * 100)
    print(f"{'Total Settlement (CSV)':.<50} Rp {total_csv:>20,.0f}")
    print(f"{'Total POS (API)':.<50} Rp {total_api:>20,.0f}")
    print(f"{'SELISIH':.<50} Rp {total_selisih:>20,.0f}")
    
    print()
    print()
    print("=" * 100)
    print(f"🏢 DETAIL BEAUTY CENTER & RUMAH CANTIK (yang ada perbedaan > Rp 1.000)")
    print("=" * 100)
    print()
    
    if not cabang_with_diff_bc:
        print("✅ SEMUA BEAUTY CENTER & RUMAH CANTIK SUDAH MATCH!")
    else:
        for item in cabang_with_diff_bc:
            print(f"📍 {item['cabang']}")
            print(f"   Settlement (CSV): Rp {item['total_csv']:>15,.0f}")
            print(f"   POS (API):        Rp {item['total_api']:>15,.0f}")
            print(f"   Selisih:          Rp {item['selisih']:>15,.0f}")
            
            persen_item = (abs(item['selisih']) / item['total_csv'] * 100) if item['total_csv'] > 0 else 0
            
            if item['selisih'] > 0:
                print(f"   ⚠️  Settlement LEBIH BESAR Rp {item['selisih']:,.0f} ({persen_item:.1f}%)")
            else:
                print(f"   ⚠️  POS LEBIH BESAR Rp {abs(item['selisih']):,.0f} ({persen_item:.1f}%)")
            print()
    
    # Tampilkan juga detail klinik jika ada
    if cabang_with_diff_klinik:
        print()
        print("=" * 100)
        print(f"🏥 DETAIL KLINIK (untuk informasi)")
        print("=" * 100)
        print()
        for item in cabang_with_diff_klinik:
            print(f"📍 {item['cabang']}")
            print(f"   Settlement (CSV): Rp {item['total_csv']:>15,.0f}")
            print(f"   POS (API):        Rp {item['total_api']:>15,.0f}")
            print(f"   Selisih:          Rp {item['selisih']:>15,.0f}")
            print()
    
    # Detail per tanggal untuk Beauty Center dengan perbedaan
    print(f"🏢 DETAIL BEAUTY CENTER & RUMAH CANTIK (yang ada perbedaan > Rp 1.000)")
    print("=" * 100)
    print()
    Beauty Center dengan perbedaan
    if cabang_with_diff_bc:
        print("=" * 100)
        print("📅 DETAIL HARIAN BEAUTY CENTER & RUMAH CANTIK (top 5 cabang dengan selisih terbesar)")
        print("=" * 100)
        print()
        
        # Sort by absolute selisih
        sorted_bc = sorted(cabang_with_diff_bc, key=lambda x: abs(x['selisih']), reverse=True)
        
        for item in sorted_bc     Rp {item['total_api']:>15,.0f}")
            print(f"   Selisih:          Rp {item['selisih']:>15,.0f}")
            
            if item['selisih'] > 0:
                print(f"   ⚠️  Settlement LEBIH BESAR Rp {item['selisih']:,.0f} (ada transaksi yang belum masuk POS)")
            else:
                print(f"   ⚠️  POS LEBIH BESAR Rp {abs(item['selisih']):,.0f} (ada transaksi yang belum di-settle)")
            print()
    
    # Detail per tanggal untuk cabang dengan perbedaan
    if cabang_with_diff:
        print("=" * 100)
        print("📅 DETAIL HARIAN (untuk cabang yang berbeda)")
        print("=" * 100)
        print()
        
        for item in cabang_with_diff[:5]:  # Tampilkan max 5 cabang pertama
            cabang = item['cabang']
            print(f"\n🏢 {cabang}")
            print(f"{'Tanggal':<15} {'Settlement (CSV)':>20} {'POS (API)':>20} {'Selisih':>20}")
            print("-" * 80)
            
            csv_cabang = csv_data.get(cabang, {})
            api_cabang = api_data.get(cabang, {})
            
            # Gabungkan semua tanggal
            all_dates = sorted(set(csv_cabang.keys()) | set(api_cabang.keys()))
            
            for tanggal in all_dates:
                csv_val = csv_cabang.get(tanggal, 0)
                api_val = api_cabang.get(tanggal, 0)
                diff = csv_val - api_val
                
                if abs(diff) > 1000:  # Hanya tampilkan yang berbeda
                    status = "⚠️" if abs(diff) > 1000 else ""
                    print(f"{tanggal:<15} Rp {csv_val:>15,.0f}   Rp {api_val:>15,.0f}   Rp {diff:>15,.0f} {status}")

def main():
    print("🚀 Memulai Analisis Perbandingan Data Settlement vs API POS\n")
    
    # Path ke file CSV
    csv_file = r"c:\Users\akuci\Downloads\Dashboard All Branch 2025 - Desember.csv"
    
    # Parse CSV
    print("📄 Parsing data CSV settlement...")
    csv_data = parse_csv_settlement(csv_file)
    print(f"✅ Berhasil parse {len(csv_data)} cabang dari CSV\n")
    
    # Fetch API
    api_data = fetch_api_data(year=2025, month=12)
    print(f"✅ Berhasil fetch {len(api_data)} cabang dari API\n")
    
    # Compare
    compare_data(csv_data, api_data)

if __name__ == "__main__":
    main()
