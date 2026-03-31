#!/bin/bash
# ============================================
#  Ahana's World — Android APK Builder
# ============================================
#
# Wraps the Replit-hosted web app into an Android APK using
# Trusted Web Activity (TWA). The app opens your HTTPS URL
# full-screen with camera/mic permissions — no browser bar.
#
# Prerequisites:
#   - Node.js 18+
#   - Java JDK 8+ (macOS: brew install openjdk)
#   - Android SDK auto-downloaded on first run
#
# Usage:
#   ./mobile/build-apk.sh
#
# Output:
#   mobile/app-release-signed.apk
#   mobile/app-release-unsigned.apk

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Ahana's World — Android APK Builder${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ─── Check prerequisites ───
if ! command -v java &>/dev/null; then
  echo -e "${RED}Java not found.${NC}"
  echo "  macOS: brew install openjdk"
  echo "  Linux: sudo apt install default-jdk"
  exit 1
fi
echo "  Java: $(java -version 2>&1 | head -1)"
echo "  Node: $(node --version)"
echo ""

# ─── Set ANDROID_HOME if available ───
if [ -z "${ANDROID_HOME:-}" ]; then
  [ -d "$HOME/Library/Android/sdk" ] && export ANDROID_HOME="$HOME/Library/Android/sdk"
  [ -d "$HOME/Android/Sdk" ] && export ANDROID_HOME="$HOME/Android/Sdk"
fi
[ -n "${ANDROID_HOME:-}" ] && echo "  Android SDK: $ANDROID_HOME" || echo "  Android SDK: will auto-download"

# ─── Init TWA project ───
echo ""
if [ ! -f "twa-manifest.json" ]; then
  echo -e "${RED}twa-manifest.json not found in mobile/ directory${NC}"
  exit 1
fi

echo "Initializing TWA project from manifest..."
npx --yes @bubblewrap/cli init --manifest="https://0d7d975e-8235-4be3-a0cd-6b2b8639c101-00-3m9uvd6yjk597.picard.replit.dev/manifest.webmanifest" --directory .

echo ""
echo "Building APK..."
npx --yes @bubblewrap/cli build

# ─── Check result ───
APK=$(find . -name "*.apk" -maxdepth 1 2>/dev/null | head -1)

if [ -n "$APK" ]; then
  APK_SIZE=$(du -h "$APK" | cut -f1)
  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}  APK built: $APK ($APK_SIZE)${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo "  Install on phone:"
  echo "    adb install $APK"
  echo "    OR transfer $APK to phone and open it"
  echo ""
else
  echo ""
  echo -e "${YELLOW}============================================${NC}"
  echo -e "${YELLOW}  Build didn't produce APK.${NC}"
  echo -e "${YELLOW}  Use PWABuilder web tool instead:${NC}"
  echo -e "${YELLOW}============================================${NC}"
  echo ""
  echo "  1. Go to https://www.pwabuilder.com/"
  echo "  2. Enter your URL:"
  echo "     https://0d7d975e-8235-4be3-a0cd-6b2b8639c101-00-3m9uvd6yjk597.picard.replit.dev"
  echo "  3. Click 'Package for stores' > Android > Download"
  echo "  4. Install the APK on your phone"
  echo ""
fi
