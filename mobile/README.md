# Ahana's World — Android App

This wraps the Replit-hosted web app into an Android APK using Trusted Web Activity (TWA).

## How it works

The Android app is a thin wrapper that opens your Replit HTTPS URL (`https://...replit.dev`) in a full-screen Chrome tab — no browser bar. Camera, microphone, and all web APIs work because the URL is HTTPS.

## Build the APK

### Option 1: Automated script

```bash
./mobile/build-apk.sh
```

Requires Java JDK 8+ (`brew install openjdk`). Android SDK auto-downloads on first run.

### Option 2: PWABuilder (easiest — no setup needed)

1. Go to [pwabuilder.com](https://www.pwabuilder.com/)
2. Enter your Replit URL
3. Click **Package for stores** > **Android**
4. Download the APK
5. Transfer to phone and install

### Option 3: Chrome "Add to Home Screen"

On your Android phone:
1. Open your Replit URL in Chrome
2. Tap the three-dot menu > **Add to Home Screen**
3. The app icon appears on your home screen

This is the simplest approach but doesn't have a full native feel.

## Install on phone

- **USB**: `adb install mobile/app-release-signed.apk`
- **File transfer**: Send APK to phone via USB/Drive/Email, open it
- **Enable "Unknown sources"**: Settings > Security > Install unknown apps

## Update the app

The app always loads the latest version from Replit — no app update needed when you change the web code. Just deploy to Replit and the app reflects changes immediately.

## Files

- `twa-manifest.json` — TWA configuration (app name, colors, URL, permissions)
- `build-apk.sh` — Automated build script
- `.gitignore` — Excludes build artifacts
