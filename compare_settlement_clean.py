import pandas as pd
import requests
import json
from datetime import datetime
import re

# Mapping nama cabang dari CSV ke nama API (FIXED - sesuai dengan nama di API)
# PERHATIAN: Beberapa nama di CSV ada SPASI di akhir!
CABANG_MAPPING = {
    # Klinik - Ada spasi di akhir!
    "Clinic magelang ": "Klinik DRW Skincare Magelang",
    "clinic purworejo": "Klinik DRW Skincare Purworejo",
    "Cinic Kuotarjo ": "Klinik DRW Skincare Kutoarjo",
    
    # Beauty Center - FIXED: Semua pakai nama lengkap yang sama dengan API
    "Kaliurang": "Beauty Center Kaliurang",
    "Jl paris Prawirotaman ": "Beauty Center Prawirotaman",  # Ada spasi!
    "Maguwoharjo tajem": "Beauty Center Maguwoharjo",
    "Kota gede": "Beauty Center Kotagede",
    "bantul": "Beauty Center Bantul",
    "Prambanan": "Beauty Center Prambanan",
    "Godean ": "Beauty Center Godean",  # Ada spasi di akhir!
    "Muntilan": "Beauty Center Muntilan",
    "Wates": "Beauty Center Wates",
    
    # Rumah Cantik - Ada spasi di akhir!
    "Rumah cantik Rajawali ": "Rumah Cantik Rajawali",
}

def clean_currency(value):
    """Konversi format Rupiah ke angka"""
    if pd.isna(value) or value == '':
        return 0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace('Rp', '').replace(',', '').replace('.', '').replace(' ', '')
    try:
        return float(cleaned)
    except:
        return 0

def parse_csv_settlement(file_path):
    """Parse CSV settlement dan ekstrak data omset per cabang per tanggal"""
    df = pd.read_csv(file_path, skiprows=2)
    df_cabang = df[df.iloc[:, 0].notna() & (df.iloc[:, 0] != 'revenue')].copy()
    
    print("=== Nama cabang di CSV ===")
    for idx, row in df_cabang.iterrows():
        cabang_csv = row.iloc[0]
        if cabang_csv != 'revenue' and pd.notna(cabang_csv):
            print(f"   - '{cabang_csv}'")
    print()
    
    data = {}
    for idx, row in df_cabang.iterrows():
        cabang_csv = row.iloc[0]
        if cabang_csv == 'revenue' or pd.isna(cabang_csv):
            continue
            
        cabang_api = CABANG_MAPPING.get(cabang_csv, cabang_csv)
        print(f"   Mapping: '{cabang_csv}' -> '{cabang_api}'")
        data[cabang_api] = {}
        
        for day in range(1, 32):
            col_idx = day + 2
            if col_idx < len(row):
                value = clean_currency(row.iloc[col_idx])
                if value > 0:
                    tanggal = f"2025-12-{day:02d}"
                    data[cabang_api][tanggal] = value
    
    return data

def fetch_api_data(year=2025, month=12):
    """Fetch data dari API untuk bulan tertentu"""
    all_data = []
    year_month = f"{year}-{month:02d}"
    dari_tanggal = f"{year}-{month:02d}-01"
    sampai_tanggal = f"{year}-{month:02d}-31" if month == 12 else f"{year}-{month:02d}-30"
    
    endpoints = [
        f"https://clinic.beautycenter.id/api/laporan-penjualan-perawatan?dari_tanggal={dari_tanggal}&sampai_tanggal={sampai_tanggal}",
        f"https://clinic.beautycenter.id/api/laporan-penjualan-produk?dari_tanggal={dari_tanggal}&sampai_tanggal={sampai_tanggal}",
    ]
    
    data_perawatan = []
    data_produk = []
    
    for endpoint in endpoints:
        try:
            print(f">> Mencoba endpoint: {endpoint}")
            page = 1
            max_pages = 200
            endpoint_data = []
            
            while page <= max_pages:
                try:
                    url = f"{endpoint}&page={page}" if "?" in endpoint else f"{endpoint}?page={page}"
                    response = requests.get(url, timeout=30)
                    
                    if response.status_code != 200:
                        print(f"     Error: status {response.status_code}")
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
                    print(f"     Error fetching page {page}: {e}")
                    break
            
            if endpoint_data:
                if "perawatan" in endpoint:
                    data_perawatan = endpoint_data
                    print(f"     Total {len(endpoint_data)} transaksi perawatan\n")
                else:
                    data_produk = endpoint_data
                    print(f"     Total {len(endpoint_data)} transaksi produk\n")
                    
        except Exception as e:
            print(f"  Error dengan endpoint {endpoint}: {e}\n")
            continue
    
    all_data = data_perawatan + data_produk
    
    if not all_data:
        print("  Tidak ada data yang berhasil di-fetch dari semua endpoint")
        return {}
    
    print(f">> Total gabungan: {len(all_data)} transaksi (Perawatan: {len(data_perawatan)}, Produk: {len(data_produk)})\n")
    
    aggregated = {}
    for record in all_data:
        tanggal = record.get('tanggal_transaksi') or record.get('tanggal') or record.get('created_at', '')
        if isinstance(tanggal, str) and ' ' in tanggal:
            tanggal = tanggal.split(' ')[0]
        
        if not tanggal or not str(tanggal).startswith(year_month):
            continue
            
        cabang = record.get('nama_clinic') or record.get('nama_klinik') or record.get('klinik', '')
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
    """Bandingkan data CSV settlement dengan data API - FOKUS BEAUTY CENTER & RUMAH CANTIK"""
    
    print("=" * 100)
    print("=== HASIL PERBANDINGAN DATA SETTLEMENT vs API POS ===")
    print("=" * 100)
    print()
    
    all_cabang = set(csv_data.keys()) | set(api_data.keys())
    
    # Pisahkan Beauty Center/Rumah Cantik vs Klinik
    beauty_center_cabang = [c for c in all_cabang if 'Beauty Center' in c or 'Rumah Cantik' in c or 'Rumah cantik' in c]
    klinik_cabang = [c for c in all_cabang if 'Klinik' in c or 'Clinic' in c or 'Cinic' in c]
    
    total_csv_bc = 0
    total_api_bc = 0
    total_selisih_bc = 0
    
    total_csv_klinik = 0
    total_api_klinik = 0
    total_selisih_klinik = 0
    
    cabang_with_diff_bc = []
    cabang_with_diff_klinik = []
    
    for cabang in sorted(all_cabang):
        csv_cabang = csv_data.get(cabang, {})
        api_cabang = api_data.get(cabang, {})
        
        total_csv_cabang = sum(csv_cabang.values())
        total_api_cabang = sum(api_cabang.values())
        selisih_cabang = total_csv_cabang - total_api_cabang
        
        is_beauty_center = cabang in beauty_center_cabang
        is_klinik = cabang in klinik_cabang
        
        if is_beauty_center:
            total_csv_bc += total_csv_cabang
            total_api_bc += total_api_cabang
            total_selisih_bc += selisih_cabang
            
            if abs(selisih_cabang) > 1000:
                cabang_with_diff_bc.append({
                    'cabang': cabang,
                    'total_csv': total_csv_cabang,
                    'total_api': total_api_cabang,
                    'selisih': selisih_cabang
                })
        
        elif is_klinik:
            total_csv_klinik += total_csv_cabang
            total_api_klinik += total_api_cabang
            total_selisih_klinik += selisih_cabang
            
            if abs(selisih_cabang) > 1000:
                cabang_with_diff_klinik.append({
                    'cabang': cabang,
                    'total_csv': total_csv_cabang,
                    'total_api': total_api_cabang,
                    'selisih': selisih_cabang
                })
    
    # TAMPILKAN RINGKASAN BEAUTY CENTER & RUMAH CANTIK
    print(f"=== RINGKASAN BEAUTY CENTER & RUMAH CANTIK SAJA (Desember 2025) ===")
    print(f"-" * 100)
    print(f"{'Total Settlement (CSV)':.<50} Rp {total_csv_bc:>20,.0f}")
    print(f"{'Total POS (API)':.<50} Rp {total_api_bc:>20,.0f}")
    print(f"{'SELISIH':.<50} Rp {total_selisih_bc:>20,.0f}")
    print()
    
    if abs(total_selisih_bc) < 1000:
        print("  DATA BEAUTY CENTER SUDAH MATCH! Selisih di bawah Rp 1.000")
    else:
        persen_bc = (abs(total_selisih_bc) / total_csv_bc * 100) if total_csv_bc > 0 else 0
        if total_selisih_bc > 0:
            print(f"   SETTLEMENT LEBIH BESAR: Rp {total_selisih_bc:,.0f} ({persen_bc:.2f}%)")
            print(f"      Ada transaksi yang belum masuk ke sistem POS / API belum lengkap")
        else:
            print(f"   POS LEBIH BESAR: Rp {abs(total_selisih_bc):,.0f} ({persen_bc:.2f}%)")
            print(f"      Ada transaksi di POS yang belum di-settle")
    
    print()
    print("-" * 100)
    print(f"=== RINGKASAN KLINIK (untuk informasi) ===")
    print(f"-" * 100)
    print(f"{'Total Settlement Klinik (CSV)':.<50} Rp {total_csv_klinik:>20,.0f}")
    print(f"{'Total POS Klinik (API)':.<50} Rp {total_api_klinik:>20,.0f}")
    print(f"{'SELISIH Klinik':.<50} Rp {total_selisih_klinik:>20,.0f}")
    
    print()
    print()
    print("=" * 100)
    print(f"=== DETAIL BEAUTY CENTER & RUMAH CANTIK (yang ada perbedaan > Rp 1.000) ===")
    print("=" * 100)
    print()
    
    if not cabang_with_diff_bc:
        print("  SEMUA BEAUTY CENTER & RUMAH CANTIK SUDAH MATCH!")
    else:
        for item in cabang_with_diff_bc:
            print(f"  {item['cabang']}")
            print(f"   Settlement (CSV): Rp {item['total_csv']:>15,.0f}")
            print(f"   POS (API):        Rp {item['total_api']:>15,.0f}")
            print(f"   Selisih:          Rp {item['selisih']:>15,.0f}")
            
            persen_item = (abs(item['selisih']) / item['total_csv'] * 100) if item['total_csv'] > 0 else 0
            
            if item['selisih'] > 0:
                print(f"      Settlement LEBIH BESAR Rp {item['selisih']:,.0f} ({persen_item:.1f}%)")
            else:
                print(f"      POS LEBIH BESAR Rp {abs(item['selisih']):,.0f} ({persen_item:.1f}%)")
            print()
    
    # Tampilkan juga detail klinik jika ada
    if cabang_with_diff_klinik:
        print()
        print("=" * 100)
        print(f"=== DETAIL KLINIK (untuk informasi) ===")
        print("=" * 100)
        print()
        for item in cabang_with_diff_klinik:
            print(f"  {item['cabang']}")
            print(f"   Settlement (CSV): Rp {item['total_csv']:>15,.0f}")
            print(f"   POS (API):        Rp {item['total_api']:>15,.0f}")
            print(f"   Selisih:          Rp {item['selisih']:>15,.0f}")
            print()

def main():
    print("=== Memulai Analisis Perbandingan Data Settlement vs API POS ===")
    print("    FOKUS: Beauty Center & Rumah Cantik\n")
    
    csv_file = r"c:\Users\akuci\Downloads\Dashboard All Branch 2025 - Desember.csv"
    
    print("Parsing data CSV settlement...")
    csv_data = parse_csv_settlement(csv_file)
    print(f"Berhasil parse {len(csv_data)} cabang dari CSV\n")
    
    api_data = fetch_api_data(year=2025, month=12)
    print(f"Berhasil fetch {len(api_data)} cabang dari API\n")
    
    compare_data(csv_data, api_data)

if __name__ == "__main__":
    main()
