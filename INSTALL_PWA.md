# Cara Install PWA di TV

## **Smart TV dengan Browser (Samsung, LG, dll)**

1. Buka browser di TV (Chrome/Edge/Samsung Internet)
2. Masuk ke URL dashboard: `https://your-vercel-url.vercel.app`
3. Tekan tombol **Menu/Options** di remote
4. Cari pilihan **"Add to Home Screen"** atau **"Install App"**
5. Klik Install
6. Icon dashboard akan muncul di home screen TV
7. Buka dari icon tersebut untuk mode fullscreen

---

## **Android TV (Mi TV, TCL, Sony, dll)**

### **Opsi A: Via Chrome Browser** ⭐ Paling Mudah
1. Install **Chrome** dari Google Play Store (kalau belum ada)
2. Buka Chrome, masuk ke URL dashboard
3. Klik titik 3 di pojok kanan atas
4. Pilih **"Add to Home screen"** atau **"Install app"**
5. Dashboard jadi app standalone

### **Opsi B: Via Kiosk Browser** (Recommended untuk TV 24/7)
1. Download **Fully Kiosk Browser** dari Play Store
2. Install dan buka app
3. Masukkan URL dashboard di address bar
4. Tekan tombol Settings
5. Enable:
   - ✅ Kiosk Mode
   - ✅ Hide Navigation Bar
   - ✅ Hide Status Bar
   - ✅ Auto-start on boot
   - ✅ Keep screen on
   - ✅ Prevent sleep
6. Set refresh interval (optional): 60 detik
7. Dashboard akan jalan fullscreen otomatis tiap TV nyala

### **Opsi C: Sideload APK (Advanced)**
Kalau mau build native Android APK:
1. Wrap PWA pakai **PWA Builder** atau **Bubblewrap**
2. Generate APK
3. Transfer ke TV via USB
4. Install via File Manager
5. Open app seperti native app biasa

---

## **Apple TV (Tidak Support PWA)**
Apple TV tidak support PWA. Solusi:
- **AirPlay/Cast** dari iPhone/iPad/Mac ke TV
- Atau pakai **Kiosk Browser** third-party dari App Store (terbatas)

---

## **Chromecast/Google TV**
1. Cast dari laptop/HP Chrome browser
2. Atau gunakan **Chrome Remote Desktop** + Chrome browser di TV stick

---

## **Tips untuk Tampilan Optimal:**
- ✅ Gunakan resolusi TV minimal 1080p (Full HD)
- ✅ Set browser ke mode landscape
- ✅ Zoom browser ke 100% (default)
- ✅ Disable browser notifications
- ✅ Clear cache browser sebelum install

## **Auto-Refresh:**
Dashboard sudah auto-update setiap 30 detik, tidak perlu refresh manual.
