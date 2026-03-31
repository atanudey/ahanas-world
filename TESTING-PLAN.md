# Comprehensive Testing Plan — iTech Portal

## Context

iTech Portal has 6 apps with inconsistent test coverage: Learn Status has good tests, CTC Builder has calculation tests, but Gateway, Project Mgmt, and Password Reset have zero tests. There's no CI/CD, no E2E testing, no broken link detection, and no automated regression suite. As a one-person team, every test must be automated — nothing manual.

**Goal:** Full automated test suite that runs on every push: unit tests, API integration tests, E2E browser tests, broken link checks, and code coverage — with a GitHub Actions CI pipeline.

---

## Testing Layers (Industry Standard: Testing Pyramid)

```
        ┌─────────┐
        │  E2E    │  ← Playwright (browser tests, broken links)
        ├─────────┤
        │  API    │  ← Supertest/pytest (backend integration)
        ├─────────┤
        │  Unit   │  ← Vitest/Jest/pytest (logic, components)
        └─────────┘
```

---

## Step 1: Shared E2E Test Suite (Playwright)

**New directory:** `tests/` at project root

Playwright tests the entire app end-to-end through a real browser against running Docker containers. This catches broken links, broken routes, auth flows, and cross-app navigation.

**Files:**
- `tests/playwright.config.ts` — config: baseURL `https://localhost`, ignore HTTPS errors
- `tests/package.json` — Playwright + dependencies
- `tests/global-setup.ts` — wait for all services to be healthy before running tests
- `tests/fixtures.ts` — shared test fixtures (authenticated page, admin page)

**Test files:**
| File | What it tests |
|------|--------------|
| `tests/e2e/auth.spec.ts` | Login page loads, Google OAuth redirect works, email/password login, registration flow, forgot password, logout, MFA flow |
| `tests/e2e/portal.spec.ts` | Portal home loads after login, all app cards visible, app card links work |
| `tests/e2e/admin.spec.ts` | Admin panel loads, user list, create/delete user, app access CRUD |
| `tests/e2e/ctc-builder.spec.ts` | CTC Builder loads, employee list, create employee, run calculation, export |
| `tests/e2e/project-mgmt.spec.ts` | Project Mgmt dashboard loads, board list renders |
| `tests/e2e/learn-status.spec.ts` | Learn Status loads, status cards render, tabs work |
| `tests/e2e/password-reset.spec.ts` | Password Reset loads, find user flow, security questions |
| `tests/e2e/rover.spec.ts` | Rover loads, model selector works, send message, conversation list |
| `tests/e2e/broken-links.spec.ts` | Crawls every `<a href>` on every page, verifies no 404/500 responses |
| `tests/e2e/smoke.spec.ts` | Quick smoke test: every app root URL returns 200 |

**Auth fixture pattern:** Use `DEV_MODE=true` for E2E tests to bypass Google OAuth. Playwright stores auth state (cookies) and reuses across tests.

**Broken link checker approach:**
1. Start from portal home (`/`)
2. Crawl all internal links recursively
3. For each link: check HTTP status, flag 404s/500s
4. Also check all `<img src>`, `<link href>`, `<script src>` for broken assets
5. Report all broken URLs with the page they were found on

---

## Step 2: Gateway Backend Tests (NEW — currently zero tests)

**Files:**
- `gateway/src/__tests__/db.test.ts` — DB init, seed, migrations
- `gateway/src/__tests__/auth.test.ts` — All auth routes (login, register, OTP, MFA, password reset)
- `gateway/src/__tests__/admin.test.ts` — Admin CRUD (users, apps, access)
- `gateway/src/__tests__/middleware.test.ts` — JWT sign/verify, checkAppAccess, requireAuth
- `gateway/src/__tests__/otp.test.ts` — OTP create, verify, rate limit, cleanup
- `gateway/jest.config.js` or vitest config
- `gateway/src/__tests__/setup.ts` — Test DB setup (use a test schema or testcontainers)

**Test approach:** Supertest against Express app with a real test PostgreSQL (either Docker testcontainer or the same postgres with a `gateway_test` schema). Mock only external services (Google OAuth, email/SMTP).

**Key test cases:**
- Auth: login with valid/invalid credentials, registration 3-step flow, MFA flow, password reset
- Admin: CRUD operations, unique constraint errors (409), cascade deletes
- Middleware: JWT expiry, malformed tokens, app access checks
- OTP: rate limiting (3 per 15 min), expiry, max attempts

**Add to `gateway/package.json`:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

---

## Step 3: Password Reset Backend Tests (NEW — currently zero tests)

**Files:**
- `password-reset/backend/tests/conftest.py` — pytest fixtures, test DB setup
- `password-reset/backend/tests/test_auth.py` — Login, session, logout
- `password-reset/backend/tests/test_security_questions.py` — Setup, verify, random selection
- `password-reset/backend/tests/test_user_service.py` — User lookup, AD/Google integration (mocked)
- `password-reset/backend/tests/test_db.py` — init_database, cleanup, seed data

**Test approach:** pytest + Flask test client. Use a test schema in PostgreSQL. Mock AD/LDAP and Google Workspace API calls.

**Add to `password-reset/backend/requirements.txt`:**
```
pytest==8.3.4
pytest-cov==6.1.1
```

---

## Step 4: Project Mgmt Backend Tests (NEW — currently zero tests)

**Files:**
- `project-mgmt-app/backend/tests/conftest.py` — pytest fixtures
- `project-mgmt-app/backend/tests/test_boards.py` — Board list, report generation
- `project-mgmt-app/backend/tests/test_cache.py` — Redis caching behavior

**Test approach:** pytest + FastAPI TestClient. Mock Jira and TestRail API responses. Test Redis caching TTL and invalidation.

---

## Step 5: Frontend Component Tests (fill gaps)

Apps that already have tests (Learn Status, Rover) — keep and extend.

Apps that need tests added:

### CTC Builder Frontend
- `ctc-builder/client/__tests__/EmployeeForm.test.tsx` — form validation, submission
- `ctc-builder/client/__tests__/CalculationResult.test.tsx` — breakdown rendering
- `ctc-builder/client/__tests__/BulkUpload.test.tsx` — file validation, error display

### Project Mgmt Frontend
- `project-mgmt-app/frontend/src/__tests__/Dashboard.test.jsx` — board cards render
- `project-mgmt-app/frontend/src/__tests__/BoardReport.test.jsx` — chart rendering

### Password Reset Frontend
- `password-reset/ad-password-reset-frontend/src/__tests__/FindUser.test.tsx` — user lookup form
- `password-reset/ad-password-reset-frontend/src/__tests__/SecurityQuestions.test.tsx` — question flow
- `password-reset/ad-password-reset-frontend/src/__tests__/ResetPassword.test.tsx` — password reset form

**All frontend tests use:** Vitest + @testing-library/react + MSW (mock API responses)

---

## Step 6: GitHub Actions CI Pipeline

**New file:** `.github/workflows/test.yml`

Triggers on: push to `dev`, `dev-postgres`, `main` + all PRs

```yaml
Jobs:
  1. lint-and-typecheck:
     - Gateway: tsc --noEmit
     - CTC Builder: tsc --noEmit
     - Learn Status: tsc --noEmit
     - Password Reset Frontend: tsc --noEmit

  2. unit-tests (parallel matrix):
     - gateway-tests: npm test (with PostgreSQL service container)
     - ctc-builder-tests: npm test
     - learn-status-backend-tests: npm test
     - learn-status-frontend-tests: npm test
     - password-reset-tests: pytest --cov
     - project-mgmt-tests: pytest --cov
     - rover-backend-tests: npm test
     - rover-frontend-tests: npm test

  3. e2e-tests (needs: unit-tests):
     - docker compose up -d
     - Wait for health checks
     - npx playwright test
     - Upload test report + screenshots as artifacts

  4. coverage-report:
     - Merge all coverage reports
     - Post coverage summary as PR comment
     - Fail if coverage drops below threshold
```

**Service containers in CI:**
- PostgreSQL 15 (for gateway, ctc-builder, password-reset, rover tests)
- Redis 7 (for project-mgmt, rover tests)

**Coverage thresholds (starting point — tighten over time):**
- Gateway: 70% (new tests)
- CTC Builder: 60% (existing calculation tests)
- Learn Status: 80% (already well-tested)
- Password Reset: 50% (new tests)
- Rover: 50% (partial tests)

---

## Step 7: Test Utilities and Helpers

**New file:** `tests/docker-test.sh`
- Starts all containers with `DEV_MODE=true`
- Waits for all health endpoints
- Runs full test suite locally
- Prints coverage summary
- One command: `./tests/docker-test.sh`

**New file:** `tests/check-links.ts`
- Standalone broken link checker
- Can run independently: `npx ts-node tests/check-links.ts`
- Crawls from base URL, follows all internal links
- Checks images, CSS, JS assets
- Reports broken URLs with source page

---

## Implementation Order

| Step | Risk | Effort | Value |
|------|------|--------|-------|
| 1. E2E + broken links (Playwright) | Low | High | **Highest** — catches regressions across all apps |
| 2. Gateway backend tests | Low | Medium | High — auth is critical |
| 3. CI pipeline (GitHub Actions) | Low | Medium | High — automates everything |
| 4. Password Reset backend tests | Low | Medium | Medium |
| 5. Frontend component tests (gaps) | Low | Medium | Medium |
| 6. Project Mgmt backend tests | Low | Low | Low (simple CRUD + cache) |
| 7. Test utilities | Low | Low | Quality of life |

**Recommended:** Steps 1 → 3 → 2 → 4 → 5 → 6 → 7

---

## Files Summary

~40 new files:

- `tests/` (root) — 12 files: Playwright config, E2E specs, broken link checker, docker-test.sh
- `gateway/src/__tests__/` — 6 files: backend API tests
- `password-reset/backend/tests/` — 5 files: pytest API tests
- `project-mgmt-app/backend/tests/` — 3 files: pytest API tests
- `ctc-builder/client/__tests__/` — 3 files: frontend component tests
- `project-mgmt-app/frontend/src/__tests__/` — 2 files: frontend tests
- `password-reset/ad-password-reset-frontend/src/__tests__/` — 3 files: frontend tests
- `.github/workflows/test.yml` — 1 file: CI pipeline

---

## Verification

After implementation, verify:
1. `./tests/docker-test.sh` — all tests pass locally
2. `git push` → GitHub Actions runs all jobs green
3. Coverage report generated and posted
4. Broken link checker finds zero broken links
5. Every app has at least one passing E2E test
6. PR comment shows coverage summary
