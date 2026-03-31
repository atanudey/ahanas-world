#!/bin/bash
# ============================================
#  Ahana's World — Smoke Test
# ============================================
#
# Quick health check for a deployed instance.
# Run after deploying to Replit or any host.
#
# Usage:
#   ./scripts/test-smoke.sh <URL>
#
# Example:
#   ./scripts/test-smoke.sh https://ahanas-world.repl.co

set -euo pipefail

URL="${1:?Usage: ./scripts/test-smoke.sh <BASE_URL>}"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check() {
  local path="$1"
  local expect="${2:-200}"
  local desc="${3:-$path}"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$URL$path" 2>/dev/null || echo "000")
  if [ "$status" = "$expect" ]; then
    echo -e "  ${GREEN}OK${NC}  $desc ($status)"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC}  $desc — got $status, expected $expect"
    FAIL=$((FAIL + 1))
  fi
}

check_contains() {
  local path="$1"
  local needle="$2"
  local desc="${3:-$path contains '$needle'}"
  local body
  body=$(curl -s --max-time 15 "$URL$path" 2>/dev/null || echo "")
  if echo "$body" | grep -q "$needle"; then
    echo -e "  ${GREEN}OK${NC}  $desc"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC}  $desc — not found in response"
    FAIL=$((FAIL + 1))
  fi
}

echo "============================================"
echo "  Smoke Test — $URL"
echo "============================================"
echo ""

echo "Pages:"
check "/" 200 "Homepage"
check "/hub" 200 "Child Hub"
check "/music" 200 "Music section"
check "/art" 200 "Art section"
check "/reading" 200 "Reading section"
check "/space" 200 "Space section"
check "/milestones" 200 "Milestones section"
check "/parent/login" 200 "Parent login"

echo ""
echo "API (public):"
check "/api/auth/verify-pin" 200 "PIN status check"

echo ""
echo "API (protected — should return 401):"
check "/api/settings" 401 "Settings (no auth)"
check "/api/content" 401 "Content list (no auth)"

echo ""
echo "PWA:"
check "/manifest.webmanifest" 200 "PWA manifest"
check "/icon" 200 "App icon"
check "/apple-icon" 200 "Apple touch icon"

echo ""
echo "SEO:"
check_contains "/" "og:title" "Homepage has OpenGraph"
check_contains "/music" "Songs from the Stars" "Music page has title"

echo ""
echo "Static assets:"
check "/favicon.ico" 200 "Favicon"

echo ""
echo "============================================"
echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "============================================"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "Some checks failed. Review the output above."
  exit 1
else
  echo "All checks passed! Deployment looks healthy."
fi
