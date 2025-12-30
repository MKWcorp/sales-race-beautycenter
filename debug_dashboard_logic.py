import requests
import json

print("=== DEBUG DASHBOARD FETCHING LOGIC ===")
print()

# Test apa yang terjadi kalau dashboard fetch dengan clinic ID
tanggal = "2025-12-20"

print(f"Tanggal test: {tanggal}")
print()

clinics = [
    (2, "Beauty Center Bantul"),
    (5, "Beauty Center Kotagede"),
]

print("--- METODE DASHBOARD (dengan parameter clinic) ---")
total_dashboard = {}

for clinic_id, clinic_name in clinics:
    print(f"\n{clinic_name} (ID: {clinic_id})")
    
    # Produk
    url_produk = f"https://clinic.beautycenter.id/api/laporan-penjualan-produk?nama_cabang={clinic_id}&dari_tanggal={tanggal}&sampai_tanggal={tanggal}"
    resp_produk = requests.get(url_produk, timeout=30)
    
    produk_data = []
    for page in range(1, 10):
        url = f"https://clinic.beautycenter.id/api/laporan-penjualan-produk?nama_cabang={clinic_id}&dari_tanggal={tanggal}&sampai_tanggal={tanggal}&page={page}"
        resp = requests.get(url, timeout=30)
        data = resp.json().get('data', [])
        if not data:
            break
        produk_data.extend(data)
    
    # Perawatan
    perawatan_data = []
    for page in range(1, 10):
        url = f"https://clinic.beautycenter.id/api/laporan-penjualan-perawatan?klinik={clinic_id}&dari_tanggal={tanggal}&sampai_tanggal={tanggal}&page={page}"
        resp = requests.get(url, timeout=30)
        data = resp.json().get('data', [])
        if not data:
            break
        perawatan_data.extend(data)
    
    print(f"  Produk: {len(produk_data)} transaksi")
    print(f"  Perawatan: {len(perawatan_data)} transaksi")
    
    # Hitung total
    total = 0
    for item in produk_data:
        total += float(item.get('total_bayar', 0))
    for item in perawatan_data:
        total += float(item.get('total_pembayaran', 0) or item.get('total_bayar', 0))
    
    print(f"  TOTAL: Rp {total:,.0f}")
    total_dashboard[clinic_name] = total
    
    # Show clinic names found
    clinic_names_produk = set([item['nama_clinic'] for item in produk_data])
    clinic_names_perawatan = set([item['nama_clinic'] for item in perawatan_data])
    
    if clinic_names_produk:
        print(f"  Produk dari cabang: {', '.join(clinic_names_produk)}")
    if clinic_names_perawatan:
        print(f"  Perawatan dari cabang: {', '.join(clinic_names_perawatan)}")

print()
print()
print("--- METODE BENAR (fetch all, filter manual) ---")
total_correct = {}

# Fetch all data tanpa filter clinic
print(f"\nFetch semua data tanggal {tanggal}...")

all_produk = []
for page in range(1, 100):
    url = f"https://clinic.beautycenter.id/api/laporan-penjualan-produk?dari_tanggal={tanggal}&sampai_tanggal={tanggal}&page={page}"
    resp = requests.get(url, timeout=30)
    data = resp.json().get('data', [])
    if not data:
        break
    all_produk.extend(data)

all_perawatan = []
for page in range(1, 100):
    url = f"https://clinic.beautycenter.id/api/laporan-penjualan-perawatan?dari_tanggal={tanggal}&sampai_tanggal={tanggal}&page={page}"
    resp = requests.get(url, timeout=30)
    data = resp.json().get('data', [])
    if not data:
        break
    all_perawatan.extend(data)

print(f"Total produk: {len(all_produk)}")
print(f"Total perawatan: {len(all_perawatan)}")
print()

# Filter manual per clinic
for clinic_id, clinic_name in clinics:
    produk_filtered = [item for item in all_produk if item['nama_clinic'] == clinic_name]
    perawatan_filtered = [item for item in all_perawatan if item['nama_clinic'] == clinic_name]
    
    total = 0
    for item in produk_filtered:
        total += float(item.get('total_bayar', 0))
    for item in perawatan_filtered:
        total += float(item.get('total_pembayaran', 0) or item.get('total_bayar', 0))
    
    print(f"{clinic_name}:")
    print(f"  Produk: {len(produk_filtered)} transaksi")
    print(f"  Perawatan: {len(perawatan_filtered)} transaksi")
    print(f"  TOTAL: Rp {total:,.0f}")
    print()
    
    total_correct[clinic_name] = total

print()
print("=== PERBANDINGAN ===")
print()
print(f"{'Cabang':<40} {'Dashboard':<15} {'Correct':<15} {'Match?':<10}")
print("=" * 80)
for clinic_name in total_dashboard.keys():
    dashboard_val = total_dashboard[clinic_name]
    correct_val = total_correct[clinic_name]
    match = "✓" if abs(dashboard_val - correct_val) < 1 else "✗"
    print(f"{clinic_name:<40} Rp {dashboard_val:>11,.0f} Rp {correct_val:>11,.0f}  {match}")
