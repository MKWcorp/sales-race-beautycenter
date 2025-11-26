# Cara Build APK dari PWA Dashboard

Ada 2 cara mudah untuk convert PWA ini jadi APK Android:

---

## **Opsi 1: PWA Builder (Paling Mudah)** ⭐ Recommended

### **Langkah-langkah:**

1. **Buka PWA Builder**
   - Go to: https://www.pwabuilder.com/

2. **Input URL Dashboard**
   - Masukkan URL Vercel: `https://your-dashboard.vercel.app`
   - Klik **"Start"**

3. **Review PWA Score**
   - PWA Builder akan scan manifest.json dan service worker
   - Pastikan score minimal 80/100

4. **Generate Android Package**
   - Klik tab **"Publish"** 
   - Pilih **"Android"**
   - Klik **"Generate Package"**

5. **Configure Android Settings:**
   ```
   Package ID: com.drwskincare.salesrace
   App Name: Battle Business Game
   Start URL: /
   Display Mode: fullscreen
   Orientation: landscape
   Theme Color: #0f172a
   Background Color: #0f172a
   Icon: (auto-detect dari manifest.json)
   ```

6. **Download APK**
   - Klik **"Download"**
   - Akan dapat file `.zip` berisi:
     - `app-release-signed.apk` (untuk install)
     - Source code (optional)

7. **Install ke TV**
   - Transfer APK ke TV via USB/email/cloud
   - Buka File Manager di TV
   - Install APK
   - Buka app → Dashboard fullscreen! 🎉

---

## **Opsi 2: Bubblewrap CLI (Advanced)**

### **Requirements:**
- Node.js v16+
- Java JDK 11+
- Android SDK

### **Install Bubblewrap:**
```bash
npm install -g @bubblewrap/cli
```

### **Init Project:**
```bash
cd /c/Users/akuci/OneDrive/Documents/racebeautycenter
bubblewrap init --manifest https://your-dashboard.vercel.app/manifest.json
```

### **Jawab pertanyaan config:**
```
Application package name: com.drwskincare.salesrace
Application name: Battle Business Game
Start URL: /
Display mode: fullscreen
Status bar color: #0f172a
Navigation bar color: #0f172a
Orientation: landscape
Icon URL: https://your-dashboard.vercel.app/icon-512.png
Maskable icon: Yes
```

### **Build APK:**
```bash
bubblewrap build
```

### **Output:**
APK akan ada di: `./app-release-signed.apk`

---

## **Opsi 3: Android Studio (Full Control)**

### **Langkah-langkah:**

1. **Download & Install Android Studio**
   - https://developer.android.com/studio

2. **Create New Project:**
   - New Project → **Empty Activity**
   - Package name: `com.drwskincare.salesrace`
   - Language: Kotlin
   - Minimum SDK: 24 (Android 7.0)

3. **Edit `AndroidManifest.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.drwskincare.salesrace">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Battle Business Game"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="false">
        
        <activity
            android:name=".MainActivity"
            android:screenOrientation="landscape"
            android:configChanges="orientation|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

4. **Edit `MainActivity.kt`:**
```kotlin
package com.drwskincare.salesrace

import android.os.Bundle
import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Fullscreen mode
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        )
        
        webView = WebView(this)
        setContentView(webView)
        
        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }
        
        webView.webViewClient = WebViewClient()
        
        // Load dashboard
        webView.loadUrl("https://your-dashboard.vercel.app")
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

5. **Build APK:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK ada di: `app/build/outputs/apk/release/app-release.apk`

6. **Sign APK (Production):**
   - Build → Generate Signed Bundle / APK
   - Create new keystore atau gunakan existing
   - APK signed siap install

---

## **Perbandingan:**

| Method | Difficulty | Features | Best For |
|--------|-----------|----------|----------|
| **PWA Builder** | ⭐ Easy | Auto-update, no code | Quick deployment |
| **Bubblewrap** | ⭐⭐ Medium | CLI-based, customizable | Developers |
| **Android Studio** | ⭐⭐⭐ Hard | Full control, native features | Production apps |

---

## **Recommended: PWA Builder**

Paling mudah dan cepat:
1. Buka https://www.pwabuilder.com/
2. Input URL dashboard
3. Download APK
4. Install di TV
5. Done! 🚀

APK hasil PWA Builder:
- ✅ Auto-update dari web (tidak perlu install ulang)
- ✅ Fullscreen native
- ✅ Splash screen otomatis
- ✅ Icon dari manifest.json
- ✅ Signed & ready to install

---

## **Test APK di TV:**

1. Enable **Developer Options** di TV:
   - Settings → About → Build number (klik 7x)

2. Enable **Install from Unknown Sources**:
   - Settings → Security → Unknown sources → ON

3. Transfer APK ke TV (USB/cloud/email)

4. Install via File Manager

5. Open app → Dashboard fullscreen landscape! 📺

---

## **Update Dashboard:**

Karena APK hanya wrapper untuk PWA:
- Update code di GitHub
- Push ke Vercel
- APK otomatis load versi terbaru (no need reinstall!)
- Cache cleared otomatis tiap 5 menit
