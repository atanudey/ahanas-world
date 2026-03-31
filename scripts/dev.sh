#!/bin/bash
# ============================================
#  Smart dev server — auto-detects environment
# ============================================
#
# - Replit: runs HTTP on port 5000 (Replit provides HTTPS)
# - Local: runs HTTPS on port 3030 (self-signed cert for camera/mic)
#
# Usage:
#   ./scripts/dev.sh          # auto-detect
#   ./scripts/dev.sh --http   # force HTTP
#   ./scripts/dev.sh --https  # force HTTPS

PORT="${PORT:-3030}"
MODE=""

for arg in "$@"; do
  case $arg in
    --http) MODE="http" ;;
    --https) MODE="https" ;;
  esac
done

# Auto-detect environment
if [ -z "$MODE" ]; then
  if [ -n "$REPL_ID" ] || [ -n "$REPL_SLUG" ]; then
    # Replit — HTTPS is handled by the platform
    MODE="http"
    PORT="${PORT:-5000}"
    echo "  Detected: Replit — using HTTP (platform provides HTTPS)"
  else
    # Local development — use HTTPS for camera/mic on mobile
    MODE="https"
    echo "  Detected: Local — using HTTPS (needed for camera/mic on mobile devices)"
  fi
fi

echo "  Starting on port $PORT ($MODE)..."
echo ""

if [ "$MODE" = "https" ]; then
  exec npx next dev -p "$PORT" -H 0.0.0.0 --webpack --experimental-https
else
  exec npx next dev -p "$PORT" -H 0.0.0.0 --webpack
fi
