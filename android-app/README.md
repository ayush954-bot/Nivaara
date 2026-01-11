# Nivaara Realty Solutions - Android App

This directory contains the Android app wrapper (Trusted Web Activity) for the Nivaara Realty Solutions website.

## 📱 What is This?

This is a **Trusted Web Activity (TWA)** Android app that wraps your website in a native Android app shell. It provides:

- Native app experience
- Full-screen display (no browser UI)
- App icon in launcher
- Offline support (via PWA)
- Push notifications (ready to implement)
- Play Store distribution

## 🚀 Quick Start

### Prerequisites

1. **Android Studio** (Latest version)
   - Download: https://developer.android.com/studio

2. **JDK 17** (Usually bundled with Android Studio)

### Open Project

1. Launch Android Studio
2. Click "Open an Existing Project"
3. Navigate to this `android-app` directory
4. Click "OK"
5. Wait for Gradle sync to complete

### Build Debug APK

```bash
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK

1. First, generate a signing key (see PLAY_STORE_SUBMISSION_GUIDE.md)
2. Create `keystore.properties` file
3. Run:
   ```bash
   ./gradlew assembleRelease
   ```

Output: `app/build/outputs/apk/release/app-release.apk`

### Build App Bundle (for Play Store)

```bash
./gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

## 📂 Project Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/nivaararealty/app/
│   │   │   └── MainActivity.java          # Main app entry point
│   │   ├── res/
│   │   │   ├── mipmap-*/                  # App icons
│   │   │   ├── values/
│   │   │   │   └── strings.xml            # App name, asset statements
│   │   │   └── xml/
│   │   └── AndroidManifest.xml            # App configuration
│   └── build.gradle                        # App dependencies
├── build.gradle                            # Project build config
├── settings.gradle                         # Project settings
└── gradle.properties                       # Gradle properties
```

## ⚙️ Configuration

### Change App Name

Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change Package Name

1. Edit `app/build.gradle`:
   ```gradle
   defaultConfig {
       applicationId "com.yourcompany.app"
   }
   ```

2. Rename package in `MainActivity.java`

3. Update `AndroidManifest.xml`

### Change Website URL

Edit `app/src/main/java/com/nivaararealty/app/MainActivity.java`:
```java
@Override
protected Uri getLaunchingUrl() {
    return Uri.parse("https://your-website.com");
}
```

### Update Digital Asset Links

Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="asset_statements">
    [{
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
            "namespace": "web",
            "site": "https://your-website.com"
        }
    }]
</string>
```

## 🔐 Signing Configuration

### For Development

Debug builds are automatically signed with a debug key.

### For Production

1. Generate release key:
   ```bash
   keytool -genkey -v -keystore nivaara-release-key.keystore \
     -alias nivaara-key \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

2. Create `keystore.properties`:
   ```properties
   storePassword=YOUR_PASSWORD
   keyPassword=YOUR_PASSWORD
   keyAlias=nivaara-key
   storeFile=../nivaara-release-key.keystore
   ```

3. Update `app/build.gradle` (see PLAY_STORE_SUBMISSION_GUIDE.md)

## 📱 Testing

### On Emulator

1. Create AVD in Android Studio
2. Run app: Click "Run" button or press Shift+F10

### On Real Device

1. Enable Developer Options on device
2. Enable USB Debugging
3. Connect device via USB
4. Run app from Android Studio

### Install APK Manually

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 🌐 Digital Asset Links

For the app to work in full-screen mode (no browser UI), you need to set up Digital Asset Links:

1. Get your app's SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore nivaara-release-key.keystore -alias nivaara-key
   ```

2. Create `/.well-known/assetlinks.json` on your website:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.nivaararealty.app",
       "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
     }
   }]
   ```

3. Upload to: `https://nivaararealty.com/.well-known/assetlinks.json`

4. Verify it's accessible and returns `Content-Type: application/json`

## 🚀 Publishing to Play Store

See the comprehensive guide: `../PLAY_STORE_SUBMISSION_GUIDE.md`

Quick steps:
1. Build release AAB
2. Create Play Console account ($25)
3. Complete store listing
4. Upload AAB
5. Submit for review

## 🛠️ Troubleshooting

### Gradle Sync Failed

- Update Android Studio
- File > Invalidate Caches > Invalidate and Restart
- Delete `.gradle` folder and sync again

### App Shows Browser UI

- Check Digital Asset Links are configured
- Verify SHA-256 fingerprint matches
- Wait 24-48 hours for verification

### Build Errors

- Clean project: Build > Clean Project
- Rebuild: Build > Rebuild Project
- Check for missing dependencies

## 📚 Resources

- [Trusted Web Activity Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Android Developer Docs](https://developer.android.com/)
- [Play Store Publishing](https://developer.android.com/studio/publish)

## 📞 Support

For help with the app:
- Email: info@nivaararealty.com
- Phone: +91 9764515697

---

**Happy Building!** 🚀
