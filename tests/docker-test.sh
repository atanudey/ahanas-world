#!/bin/bash
# ============================================
#  Ahana's World — Full Test Suite Runner
# ============================================
#
# Runs all tests: unit tests, API tests, E2E tests, broken link check.
# Starts Docker containers if needed, runs tests, reports results.
#
# Usage:
#   ./tests/docker-test.sh              # Full suite against Docker
#   ./tests/docker-test.sh --unit-only  # Just unit tests (no Docker needed)
#   ./tests/docker-test.sh --skip-e2e   # Skip Playwright E2E
#
# Prerequisites:
#   - Docker and docker-compose (for full suite)
#   - Node.js 20+ and npm

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

UNIT_ONLY=false
SKIP_E2E=false
BASE_URL="http://localhost:3000"
FAILURES=0

for arg in "$@"; do
  case $arg in
    --unit-only) UNIT_ONLY=true ;;
    --skip-e2e) SKIP_E2E=true ;;
    *) BASE_URL="$arg" ;;
  esac
done

section() {
  echo ""
  echo -e "${CYAN}════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}════════════════════════════════════════${NC}"
  echo ""
}

run_step() {
  local name="$1"
  shift
  echo -e "  Running: ${name}..."
  if "$@"; then
    echo -e "  ${GREEN}PASSED${NC}: ${name}"
  else
    echo -e "  ${RED}FAILED${NC}: ${name}"
    FAILURES=$((FAILURES + 1))
  fi
  echo ""
}

# ─── Step 1: Unit Tests (always run, no Docker needed) ───
section "Step 1: Unit Tests (Vitest)"
run_step "Vitest unit tests" npm test

if [ "$UNIT_ONLY" = true ]; then
  echo ""
  if [ "$FAILURES" -gt 0 ]; then
    echo -e "${RED}$FAILURES step(s) failed.${NC}"
    exit 1
  else
    echo -e "${GREEN}All unit tests passed!${NC}"
    exit 0
  fi
fi

# ─── Step 2: TypeScript Check ───
section "Step 2: TypeScript Check"
run_step "tsc --noEmit" npx tsc --noEmit

# ─── Step 3: Lint ───
section "Step 3: Lint"
run_step "ESLint" npm run lint -- --max-warnings=0 2>/dev/null || run_step "ESLint (warnings ok)" npm run lint

# ─── Step 4: Build ───
section "Step 4: Production Build"
run_step "next build" npm run build

# ─── Step 5: Start services and wait ───
section "Step 5: Start Services"

# Check if app is already running
if curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
  echo -e "  ${YELLOW}App already running at $BASE_URL${NC}"
  STARTED_BY_US=false
else
  echo "  Starting Docker containers..."
  docker compose up -d 2>/dev/null || echo "  (Docker not available — skipping)"

  echo "  Starting Next.js..."
  npm run start &
  APP_PID=$!
  STARTED_BY_US=true

  # Wait for app to be ready
  echo "  Waiting for app to be ready..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null "$BASE_URL" 2>/dev/null; then
      echo -e "  ${GREEN}App is ready!${NC}"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo -e "  ${RED}App did not start in time.${NC}"
      FAILURES=$((FAILURES + 1))
    fi
    sleep 2
  done
fi

# ─── Step 6: API Tests (bash scripts) ───
section "Step 6: API Tests"
run_step "API test suite" ./scripts/test-api.sh "$BASE_URL"

# ─── Step 7: Social Integration Tests ───
section "Step 7: Social Integration Tests"
run_step "Social integrations" ./scripts/test-social-integrations.sh "$BASE_URL"

# ─── Step 8: Smoke Test ───
section "Step 8: Smoke Test"
run_step "Smoke test" ./scripts/test-smoke.sh "$BASE_URL"

# ─── Step 9: Broken Link Check ───
section "Step 9: Broken Link Check"
run_step "Broken link checker" npx tsx tests/check-links.ts "$BASE_URL"

# ─── Step 10: E2E Tests (Playwright) ───
if [ "$SKIP_E2E" = false ]; then
  section "Step 10: E2E Tests (Playwright)"
  # Install browsers if needed
  npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
  run_step "Playwright E2E" npx playwright test --reporter=list
else
  echo ""
  echo -e "  ${YELLOW}Skipping E2E tests (--skip-e2e)${NC}"
fi

# ─── Cleanup ───
if [ "${STARTED_BY_US:-false}" = true ] && [ -n "${APP_PID:-}" ]; then
  echo ""
  echo "  Stopping app (PID $APP_PID)..."
  kill "$APP_PID" 2>/dev/null || true
fi

# ─── Results ───
section "Results"
if [ "$FAILURES" -gt 0 ]; then
  echo -e "  ${RED}$FAILURES step(s) failed.${NC}"
  echo "  Review the output above for details."
  exit 1
else
  echo -e "  ${GREEN}All tests passed!${NC}"
  exit 0
fi
