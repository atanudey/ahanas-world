#!/bin/bash
# ============================================
#  Smart dev server — auto-detects environment
# ============================================
#
# - Replit: runs HTTP on port 5000 (Replit provides HTTPS)
# - Local: runs HTTP on configured port (default 3030)
#
# For camera/mic on mobile, use the Replit HTTPS URL or ngrok.
#
# Usage:
#   ./scripts/dev.sh          # auto-detect
#   ./scripts/dev.sh --https  # force HTTPS (requires mkcert -install first)

PORT="${PORT:-3030}"
USE_HTTPS=false

for arg in "$@"; do
  case $arg in
    --https) USE_HTTPS=true ;;
  esac
done

# Auto-detect Replit
if [ -n "$REPL_ID" ] || [ -n "$REPL_SLUG" ]; then
  PORT="${PORT:-5000}"
  echo "  Detected: Replit"
fi

echo "  Starting on port $PORT..."
echo "  Local:   http://localhost:$PORT"
echo "  Network: http://$(hostname -I 2>/dev/null | awk '{print $1}' || ipconfig getifaddr en0 2>/dev/null || echo '0.0.0.0'):$PORT"
echo ""
echo "  TIP: For camera/mic on mobile, use your Replit HTTPS URL"
echo "       or install ngrok: ngrok http $PORT"
echo ""

if [ "$USE_HTTPS" = true ]; then
  exec npx next dev -p "$PORT" -H 0.0.0.0 --webpack --experimental-https
else
  exec npx next dev -p "$PORT" -H 0.0.0.0 --webpack
fi
