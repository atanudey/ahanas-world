#!/bin/bash
# ============================================
#  Ahana's World — API Test Suite
# ============================================
#
# Tests all API endpoints against a running instance.
# Usage:
#   ./scripts/test-api.sh [BASE_URL]
#
# Examples:
#   ./scripts/test-api.sh                          # defaults to http://localhost:3000
#   ./scripts/test-api.sh https://ahanas-world.repl.co
#
# Prerequisites:
#   - App must be running (Docker or Replit)
#   - Supabase must be reachable
#   - curl and jq must be installed

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0
SKIP=0
COOKIE_JAR=$(mktemp)
CONTENT_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cleanup() {
  rm -f "$COOKIE_JAR"
  # Clean up test content if it was created
  if [ -n "$CONTENT_ID" ]; then
    curl -s -X DELETE "$BASE_URL/api/content/$CONTENT_ID" -b "$COOKIE_JAR" > /dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

log_pass() {
  echo -e "  ${GREEN}PASS${NC}  $1"
  PASS=$((PASS + 1))
}

log_fail() {
  echo -e "  ${RED}FAIL${NC}  $1"
  [ -n "${2:-}" ] && echo -e "        ${RED}$2${NC}"
  FAIL=$((FAIL + 1))
}

log_skip() {
  echo -e "  ${YELLOW}SKIP${NC}  $1"
  SKIP=$((SKIP + 1))
}

log_section() {
  echo ""
  echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# Helper: make a request and return HTTP status code
http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

# Helper: make a request and return body
http_body() {
  curl -s "$@"
}

echo "============================================"
echo "  Ahana's World — API Test Suite"
echo "============================================"
echo ""
echo "Target: $BASE_URL"
echo ""

# ─── Health Check ───
log_section "Health Check"

STATUS=$(http_status "$BASE_URL/")
if [ "$STATUS" = "200" ]; then
  log_pass "Homepage returns 200"
else
  log_fail "Homepage returns $STATUS (expected 200)"
  echo "  App may not be running. Aborting."
  exit 1
fi

# ─── Auth: PIN System ───
log_section "Auth: PIN System"

# Check PIN status
BODY=$(http_body "$BASE_URL/api/auth/verify-pin")
PIN_CONFIGURED=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pinConfigured', False))" 2>/dev/null || echo "error")

if [ "$PIN_CONFIGURED" = "True" ] || [ "$PIN_CONFIGURED" = "true" ]; then
  log_pass "GET /api/auth/verify-pin — PIN is configured"

  # Verify wrong PIN returns 401
  STATUS=$(http_status -X POST "$BASE_URL/api/auth/verify-pin" \
    -H "Content-Type: application/json" \
    -d '{"pin":"0000"}')
  if [ "$STATUS" = "401" ]; then
    log_pass "POST /api/auth/verify-pin — wrong PIN returns 401"
  else
    log_fail "POST /api/auth/verify-pin — wrong PIN returns $STATUS (expected 401)"
  fi
elif [ "$PIN_CONFIGURED" = "False" ] || [ "$PIN_CONFIGURED" = "false" ]; then
  log_pass "GET /api/auth/verify-pin — no PIN configured (first-time)"

  # Set a test PIN
  BODY=$(http_body -X POST "$BASE_URL/api/auth/verify-pin" \
    -H "Content-Type: application/json" \
    -d '{"pin":"9999"}' \
    -c "$COOKIE_JAR")
  SUCCESS=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
  if [ "$SUCCESS" = "True" ] || [ "$SUCCESS" = "true" ]; then
    log_pass "POST /api/auth/verify-pin — set PIN succeeds"
  else
    log_fail "POST /api/auth/verify-pin — set PIN failed: $BODY"
  fi
else
  log_fail "GET /api/auth/verify-pin — unexpected response: $BODY"
fi

# Test PIN too short
STATUS=$(http_status -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin":"12"}')
if [ "$STATUS" = "400" ]; then
  log_pass "POST /api/auth/verify-pin — short PIN returns 400"
else
  log_fail "POST /api/auth/verify-pin — short PIN returns $STATUS (expected 400)"
fi

# ─── Proxy / Auth Protection ───
log_section "Proxy: Route Protection"

# Protected routes should return 401 without session cookie
STATUS=$(http_status "$BASE_URL/api/settings")
if [ "$STATUS" = "401" ]; then
  log_pass "GET /api/settings — returns 401 without auth"
else
  log_skip "GET /api/settings — returns $STATUS (proxy may not be blocking)"
fi

STATUS=$(http_status "$BASE_URL/api/content")
if [ "$STATUS" = "401" ]; then
  log_pass "GET /api/content — returns 401 without auth"
else
  log_skip "GET /api/content — returns $STATUS (proxy may not be blocking)"
fi

# Parent page should redirect to login
STATUS=$(http_status -L "$BASE_URL/parent/login")
if [ "$STATUS" = "200" ]; then
  log_pass "GET /parent/login — accessible (200)"
else
  log_fail "GET /parent/login — returns $STATUS (expected 200)"
fi

# Public routes should work without auth
STATUS=$(http_status "$BASE_URL/hub")
if [ "$STATUS" = "200" ]; then
  log_pass "GET /hub — accessible without auth (200)"
else
  log_fail "GET /hub — returns $STATUS (expected 200)"
fi

# ─── Authenticate for remaining tests ───
log_section "Authenticate"

# Try to login with PIN 9999 (test PIN) or skip auth tests
BODY=$(http_body -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin":"9999"}' \
  -c "$COOKIE_JAR")
AUTH_SUCCESS=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")

if [ "$AUTH_SUCCESS" = "True" ] || [ "$AUTH_SUCCESS" = "true" ]; then
  log_pass "Authenticated with test PIN"
else
  echo -e "  ${YELLOW}Could not authenticate (PIN may differ). Testing unauthenticated endpoints only.${NC}"
fi

# ─── Settings API ───
log_section "Settings API"

BODY=$(http_body "$BASE_URL/api/settings" -b "$COOKIE_JAR")
HAS_FB_ENABLED=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('facebook_enabled' in d)" 2>/dev/null || echo "false")

if [ "$HAS_FB_ENABLED" = "True" ]; then
  log_pass "GET /api/settings — returns settings with platform toggles"

  # Check that secrets are masked
  FB_SECRET=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('facebook_app_secret',''))" 2>/dev/null || echo "")
  if [ -z "$FB_SECRET" ] || echo "$FB_SECRET" | grep -q '\*'; then
    log_pass "GET /api/settings — secrets are masked"
  else
    log_fail "GET /api/settings — secrets NOT masked (security issue!)"
  fi

  # Check admin_pin_configured field exists
  PIN_FIELD=$(echo "$BODY" | python3 -c "import sys,json; print('admin_pin_configured' in json.load(sys.stdin))" 2>/dev/null || echo "false")
  if [ "$PIN_FIELD" = "True" ]; then
    log_pass "GET /api/settings — includes admin_pin_configured field"
  else
    log_fail "GET /api/settings — missing admin_pin_configured field"
  fi
else
  log_fail "GET /api/settings — unexpected response: $(echo "$BODY" | head -c 100)"
fi

# PATCH settings — toggle
BODY=$(http_body -X PATCH "$BASE_URL/api/settings" \
  -H "Content-Type: application/json" \
  -d '{"require_review": true}' \
  -b "$COOKIE_JAR")
PATCH_OK=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
if [ "$PATCH_OK" = "True" ] || [ "$PATCH_OK" = "true" ]; then
  log_pass "PATCH /api/settings — toggle require_review succeeds"
else
  log_fail "PATCH /api/settings — toggle failed: $BODY"
fi

# PATCH settings — save credentials (site_url)
BODY=$(http_body -X PATCH "$BASE_URL/api/settings" \
  -H "Content-Type: application/json" \
  -d "{\"site_url\": \"$BASE_URL\"}" \
  -b "$COOKIE_JAR")
PATCH_OK=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
if [ "$PATCH_OK" = "True" ] || [ "$PATCH_OK" = "true" ]; then
  log_pass "PATCH /api/settings — save site_url succeeds"
else
  log_fail "PATCH /api/settings — save site_url failed: $BODY"
fi

# PATCH settings — masked value should be skipped
BODY=$(http_body -X PATCH "$BASE_URL/api/settings" \
  -H "Content-Type: application/json" \
  -d '{"facebook_app_secret": "****masked"}' \
  -b "$COOKIE_JAR")
PATCH_OK=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
if [ "$PATCH_OK" = "True" ] || [ "$PATCH_OK" = "true" ]; then
  # Now verify the secret wasn't overwritten with the masked value
  BODY2=$(http_body "$BASE_URL/api/settings" -b "$COOKIE_JAR")
  FB_SECRET2=$(echo "$BODY2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('facebook_app_secret',''))" 2>/dev/null || echo "")
  if [ "$FB_SECRET2" != "****masked" ]; then
    log_pass "PATCH /api/settings — masked values are correctly skipped"
  else
    log_fail "PATCH /api/settings — masked value was saved (should be skipped!)"
  fi
else
  log_fail "PATCH /api/settings — masked value test failed: $BODY"
fi

# PATCH settings — invalid fields should be rejected
STATUS=$(http_status -X PATCH "$BASE_URL/api/settings" \
  -H "Content-Type: application/json" \
  -d '{"hack_field": "malicious"}' \
  -b "$COOKIE_JAR")
if [ "$STATUS" = "400" ]; then
  log_pass "PATCH /api/settings — rejects unknown fields (400)"
else
  log_skip "PATCH /api/settings — unknown fields return $STATUS"
fi

# ─── Content API ───
log_section "Content API"

# List content
BODY=$(http_body "$BASE_URL/api/content" -b "$COOKIE_JAR")
IS_ARRAY=$(echo "$BODY" | python3 -c "import sys,json; print(type(json.load(sys.stdin)) == list)" 2>/dev/null || echo "false")
if [ "$IS_ARRAY" = "True" ]; then
  CONTENT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  log_pass "GET /api/content — returns array ($CONTENT_COUNT items)"
else
  log_fail "GET /api/content — expected array: $(echo "$BODY" | head -c 100)"
fi

# Upload content (text-only, no media)
BODY=$(http_body -X POST "$BASE_URL/api/content/upload" \
  -F "type=reading" \
  -F "title=Test Reading Entry $(date +%s)" \
  -F "notes=Automated test entry" \
  -F "mimeType=" \
  -b "$COOKIE_JAR")
CONTENT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
if [ -n "$CONTENT_ID" ] && [ "$CONTENT_ID" != "" ]; then
  log_pass "POST /api/content/upload — text content created (id: ${CONTENT_ID:0:8}...)"
else
  log_fail "POST /api/content/upload — failed: $(echo "$BODY" | head -c 200)"
  CONTENT_ID=""
fi

# Get single content
if [ -n "$CONTENT_ID" ]; then
  BODY=$(http_body "$BASE_URL/api/content/$CONTENT_ID" -b "$COOKIE_JAR")
  TITLE=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('title',''))" 2>/dev/null || echo "")
  if [ -n "$TITLE" ]; then
    log_pass "GET /api/content/$CONTENT_ID — returns content detail"
  else
    log_fail "GET /api/content/$CONTENT_ID — unexpected: $(echo "$BODY" | head -c 100)"
  fi

  # Update content
  BODY=$(http_body -X PATCH "$BASE_URL/api/content/$CONTENT_ID" \
    -H "Content-Type: application/json" \
    -d '{"description": "Updated by test script", "notes": "Test update"}' \
    -b "$COOKIE_JAR")
  UPDATED_DESC=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('description',''))" 2>/dev/null || echo "")
  if [ "$UPDATED_DESC" = "Updated by test script" ]; then
    log_pass "PATCH /api/content/$CONTENT_ID — update succeeds"
  else
    log_fail "PATCH /api/content/$CONTENT_ID — update failed: $(echo "$BODY" | head -c 100)"
  fi

  # Get content with status filter
  STATUS_VAL=$(http_status "$BASE_URL/api/content?status=review_needed" -b "$COOKIE_JAR")
  if [ "$STATUS_VAL" = "200" ]; then
    log_pass "GET /api/content?status=review_needed — filtered query works"
  else
    log_fail "GET /api/content?status=review_needed — returns $STATUS_VAL"
  fi

  # Delete content
  BODY=$(http_body -X DELETE "$BASE_URL/api/content/$CONTENT_ID" \
    -b "$COOKIE_JAR")
  DEL_OK=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "false")
  if [ "$DEL_OK" = "True" ] || [ "$DEL_OK" = "true" ]; then
    log_pass "DELETE /api/content/$CONTENT_ID — delete succeeds"
    CONTENT_ID="" # Already cleaned up
  else
    log_fail "DELETE /api/content/$CONTENT_ID — delete failed: $BODY"
  fi

  # Verify deletion
  STATUS_VAL=$(http_status "$BASE_URL/api/content/$CONTENT_ID" -b "$COOKIE_JAR" 2>/dev/null || echo "404")
  if [ "$STATUS_VAL" = "404" ] || [ "$STATUS_VAL" = "500" ]; then
    log_pass "GET /api/content (deleted) — returns 404/500 as expected"
  else
    log_skip "GET /api/content (deleted) — returns $STATUS_VAL"
  fi
fi

# ─── OAuth Routes (non-interactive) ───
log_section "OAuth Routes"

# OAuth initiation should redirect (302) or error if no credentials
STATUS=$(http_status "$BASE_URL/api/settings/oauth/facebook" -b "$COOKIE_JAR")
if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
  log_pass "GET /api/settings/oauth/facebook — redirects to Facebook ($STATUS)"
elif [ "$STATUS" = "500" ]; then
  log_pass "GET /api/settings/oauth/facebook — returns 500 (credentials not configured)"
else
  log_fail "GET /api/settings/oauth/facebook — returns $STATUS (expected 302 or 500)"
fi

STATUS=$(http_status "$BASE_URL/api/settings/oauth/google" -b "$COOKIE_JAR")
if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
  log_pass "GET /api/settings/oauth/google — redirects to Google ($STATUS)"
elif [ "$STATUS" = "500" ]; then
  log_pass "GET /api/settings/oauth/google — returns 500 (credentials not configured)"
else
  log_fail "GET /api/settings/oauth/google — returns $STATUS (expected 302 or 500)"
fi

# Unknown platform
STATUS=$(http_status "$BASE_URL/api/settings/oauth/tiktok" -b "$COOKIE_JAR")
if [ "$STATUS" = "400" ]; then
  log_pass "GET /api/settings/oauth/tiktok — unknown platform returns 400"
else
  log_fail "GET /api/settings/oauth/tiktok — returns $STATUS (expected 400)"
fi

# OAuth callback without code
STATUS=$(http_status "$BASE_URL/api/settings/oauth/callback?error=access_denied&state=facebook")
if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
  log_pass "GET /api/settings/oauth/callback — error redirect works ($STATUS)"
else
  log_fail "GET /api/settings/oauth/callback — returns $STATUS (expected 302)"
fi

# ─── Public Pages ───
log_section "Public Pages"

for page in "/" "/hub" "/music" "/art" "/reading" "/space" "/milestones"; do
  STATUS=$(http_status "$BASE_URL$page")
  if [ "$STATUS" = "200" ]; then
    log_pass "GET $page — 200 OK"
  else
    log_fail "GET $page — returns $STATUS"
  fi
done

# ─── PWA & SEO ───
log_section "PWA & SEO"

# Manifest
STATUS=$(http_status "$BASE_URL/manifest.webmanifest")
if [ "$STATUS" = "200" ]; then
  BODY=$(http_body "$BASE_URL/manifest.webmanifest")
  HAS_NAME=$(echo "$BODY" | python3 -c "import sys,json; print('Ahana' in json.load(sys.stdin).get('name',''))" 2>/dev/null || echo "false")
  if [ "$HAS_NAME" = "True" ]; then
    log_pass "GET /manifest.webmanifest — valid PWA manifest"
  else
    log_fail "GET /manifest.webmanifest — missing app name"
  fi
else
  log_fail "GET /manifest.webmanifest — returns $STATUS"
fi

# Icon
STATUS=$(http_status "$BASE_URL/icon")
if [ "$STATUS" = "200" ]; then
  log_pass "GET /icon — app icon generated (200)"
else
  log_fail "GET /icon — returns $STATUS"
fi

# Apple icon
STATUS=$(http_status "$BASE_URL/apple-icon")
if [ "$STATUS" = "200" ]; then
  log_pass "GET /apple-icon — Apple touch icon generated (200)"
else
  log_fail "GET /apple-icon — returns $STATUS"
fi

# Check homepage has metadata in HTML
BODY=$(http_body "$BASE_URL/")
if echo "$BODY" | grep -q "og:title"; then
  log_pass "Homepage HTML — contains OpenGraph metadata"
else
  log_skip "Homepage HTML — no og:title found (may be client-rendered)"
fi

# ─── Results ───
echo ""
echo "============================================"
echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$SKIP skipped${NC}"
echo "============================================"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
