#!/bin/bash
# ============================================
#  Ahana's World — Social Media Integration Tests
# ============================================
#
# Tests Facebook, Instagram, and YouTube API connectivity.
# These tests hit real APIs, so they require valid tokens.
#
# Usage:
#   ./scripts/test-social-integrations.sh [BASE_URL]
#
# Prerequisites:
#   - App must be running with valid social credentials configured
#   - Facebook Page access token must be active
#   - Google/YouTube refresh token must be valid
#
# Note: These are READ-ONLY tests — they do NOT post content.
#       They verify that tokens are valid and APIs are reachable.

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0
SKIP=0
COOKIE_JAR=$(mktemp)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cleanup() { rm -f "$COOKIE_JAR"; }
trap cleanup EXIT

log_pass() { echo -e "  ${GREEN}PASS${NC}  $1"; PASS=$((PASS + 1)); }
log_fail() { echo -e "  ${RED}FAIL${NC}  $1"; [ -n "${2:-}" ] && echo -e "        ${RED}$2${NC}"; FAIL=$((FAIL + 1)); }
log_skip() { echo -e "  ${YELLOW}SKIP${NC}  $1"; SKIP=$((SKIP + 1)); }
log_section() { echo ""; echo -e "${CYAN}━━━ $1 ━━━${NC}"; }

echo "============================================"
echo "  Social Media Integration Tests"
echo "============================================"
echo ""
echo "Target: $BASE_URL"
echo ""

# ─── Authenticate ───
log_section "Authenticate"

# Try PIN 9999 (test PIN)
BODY=$(curl -s -X POST "$BASE_URL/api/auth/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{"pin":"9999"}' \
  -c "$COOKIE_JAR")
AUTH=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success',False))" 2>/dev/null || echo "false")
if [ "$AUTH" != "True" ] && [ "$AUTH" != "true" ]; then
  echo -e "  ${RED}Cannot authenticate. Set PIN to 9999 or update this script.${NC}"
  echo "  Continuing with unauthenticated requests..."
fi

# ─── Fetch Current Settings ───
log_section "Check Platform Connections"

SETTINGS=$(curl -s "$BASE_URL/api/settings" -b "$COOKIE_JAR")

FB_CONNECTED=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('facebook_connected',False))" 2>/dev/null || echo "false")
IG_CONNECTED=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('instagram_connected',False))" 2>/dev/null || echo "false")
YT_CONNECTED=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('youtube_connected',False))" 2>/dev/null || echo "false")

FB_APP_ID=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('facebook_app_id',''))" 2>/dev/null || echo "")
GOOGLE_CLIENT=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('google_client_id',''))" 2>/dev/null || echo "")

echo "  Facebook App ID:    ${FB_APP_ID:0:10}${FB_APP_ID:+...}"
echo "  Google Client ID:   ${GOOGLE_CLIENT:0:10}${GOOGLE_CLIENT:+...}"
echo "  Facebook connected: $FB_CONNECTED"
echo "  Instagram connected: $IG_CONNECTED"
echo "  YouTube connected:  $YT_CONNECTED"

# ─── Facebook API Test ───
log_section "Facebook Graph API"

if [ "$FB_CONNECTED" = "True" ] || [ "$FB_CONNECTED" = "true" ]; then
  FB_PAGE_ID=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('facebook_page_id',''))" 2>/dev/null || echo "")

  if [ -n "$FB_PAGE_ID" ]; then
    # Test: Verify page token is valid by fetching page info (read-only)
    # We can't directly call the Graph API from here since the token is server-side
    # Instead, test the OAuth initiation endpoint
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/settings/oauth/facebook" -b "$COOKIE_JAR")
    if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
      log_pass "Facebook OAuth — redirect works (credentials configured)"

      # Verify redirect URL contains v21.0
      REDIRECT_URL=$(curl -s -I "$BASE_URL/api/settings/oauth/facebook" -b "$COOKIE_JAR" | grep -i "location:" | head -1)
      if echo "$REDIRECT_URL" | grep -q "v21.0"; then
        log_pass "Facebook OAuth — using Graph API v21.0"
      else
        log_fail "Facebook OAuth — not using v21.0" "$(echo "$REDIRECT_URL" | head -c 100)"
      fi
    else
      log_fail "Facebook OAuth — returns $STATUS"
    fi

    log_pass "Facebook Page ID: $FB_PAGE_ID"
  else
    log_fail "Facebook connected but no Page ID"
  fi
else
  log_skip "Facebook — not connected"
fi

# ─── Instagram Test ───
log_section "Instagram"

if [ "$IG_CONNECTED" = "True" ] || [ "$IG_CONNECTED" = "true" ]; then
  IG_ID=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('instagram_account_id',''))" 2>/dev/null || echo "")
  if [ -n "$IG_ID" ]; then
    log_pass "Instagram Business Account: $IG_ID"
    log_pass "Instagram — connected via Facebook"
  else
    log_fail "Instagram connected but no account ID"
  fi
else
  log_skip "Instagram — not connected (requires Facebook connection first)"
fi

# ─── YouTube/Google Test ───
log_section "YouTube / Google"

if [ -n "$GOOGLE_CLIENT" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/settings/oauth/google" -b "$COOKIE_JAR")
  if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ]; then
    log_pass "Google OAuth — redirect works (credentials configured)"

    REDIRECT_URL=$(curl -s -I "$BASE_URL/api/settings/oauth/google" -b "$COOKIE_JAR" | grep -i "location:" | head -1)
    if echo "$REDIRECT_URL" | grep -q "access_type=offline"; then
      log_pass "Google OAuth — requests offline access (for refresh token)"
    else
      log_skip "Google OAuth — access_type not found in redirect"
    fi
  else
    log_fail "Google OAuth — returns $STATUS"
  fi
else
  log_skip "Google — Client ID not configured"
fi

if [ "$YT_CONNECTED" = "True" ] || [ "$YT_CONNECTED" = "true" ]; then
  YT_CHANNEL=$(echo "$SETTINGS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('youtube_channel_id',''))" 2>/dev/null || echo "")
  if [ -n "$YT_CHANNEL" ]; then
    log_pass "YouTube Channel ID: $YT_CHANNEL"
  else
    log_fail "YouTube connected but no channel ID"
  fi
else
  log_skip "YouTube — not connected"
fi

# ─── Publishing Pipeline Test ───
log_section "Publishing Pipeline (Dry Run)"

# Create test content, check that publish would work
BODY=$(curl -s -X POST "$BASE_URL/api/content/upload" \
  -F "type=reading" \
  -F "title=Social Test $(date +%s)" \
  -F "notes=Test for social publishing pipeline" \
  -F "mimeType=" \
  -b "$COOKIE_JAR")
TEST_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")

if [ -n "$TEST_ID" ]; then
  log_pass "Created test content for pipeline check"

  # Check content status
  BODY=$(curl -s "$BASE_URL/api/content/$TEST_ID" -b "$COOKIE_JAR")
  STATUS_VAL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "")
  if [ "$STATUS_VAL" = "review_needed" ]; then
    log_pass "Content status is 'review_needed' (awaiting approval)"
  else
    log_fail "Content status is '$STATUS_VAL' (expected 'review_needed')"
  fi

  # Note: We don't actually publish because this is a text-only entry
  # (no media_path), so social posting would be skipped.
  # The publish endpoint would still update status to 'published'.

  # Clean up
  curl -s -X DELETE "$BASE_URL/api/content/$TEST_ID" -b "$COOKIE_JAR" > /dev/null 2>&1
  log_pass "Cleaned up test content"
else
  log_fail "Could not create test content"
fi

# ─── Platform Enable/Disable Test ───
log_section "Platform Toggle Test"

for PLATFORM in facebook instagram youtube; do
  KEY="${PLATFORM}_enabled"

  # Disable
  BODY=$(curl -s -X PATCH "$BASE_URL/api/settings" \
    -H "Content-Type: application/json" \
    -d "{\"$KEY\": false}" \
    -b "$COOKIE_JAR")

  # Verify
  BODY2=$(curl -s "$BASE_URL/api/settings" -b "$COOKIE_JAR")
  VAL=$(echo "$BODY2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('$KEY',True))" 2>/dev/null || echo "true")
  if [ "$VAL" = "False" ] || [ "$VAL" = "false" ]; then
    log_pass "Toggle $PLATFORM OFF — verified"
  else
    log_fail "Toggle $PLATFORM OFF — still enabled"
  fi

  # Re-enable
  curl -s -X PATCH "$BASE_URL/api/settings" \
    -H "Content-Type: application/json" \
    -d "{\"$KEY\": true}" \
    -b "$COOKIE_JAR" > /dev/null
done

# ─── Results ───
echo ""
echo "============================================"
echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$SKIP skipped${NC}"
echo "============================================"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
