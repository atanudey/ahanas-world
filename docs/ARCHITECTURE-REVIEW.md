# Ahana's World — Architectural Review

A review of structural and security weaknesses, prioritised by severity, each
with concrete remediation steps. Companion to [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Status legend:** ✅ Fixed in this change · 🔜 Planned (steps below) · 📝 Documented decision

| #  | Flaw                                             | Severity | Status |
| -- | ------------------------------------------------ | -------- | ------ |
| 1  | Session cookie never validated → auth bypass     | Critical | ✅ |
| 2  | PIN reset takeover via public endpoint           | Critical | ✅ |
| 3  | Anon can write/delete storage objects            | Critical | ✅ |
| 4  | Secrets & tokens stored in plaintext             | High     | 🔜 |
| 5  | Public bucket exposes unapproved/private media   | High     | 🔜 |
| 6  | Synchronous social publishing in the request     | High     | 🔜 |
| 7  | No brute-force protection on the PIN             | High     | 🔜 |
| 8  | No input validation on API routes                | Medium   | 🔜 |
| 9  | No env validation; scattered `process.env!`      | Medium   | 🔜 |
| 10 | Service-role key used for public reads           | Medium   | 🔜 |
| 11 | No data-access layer; mapping leaks to client    | Medium   | 🔜 |
| 12 | Mock content baked into the production path      | Medium   | 🔜 |
| 13 | `parent_settings` mixes settings/secrets/auth    | Low      | 📝 |
| 14 | Swallowed errors; no structured logging          | Low      | 🔜 |
| 15 | Stale `TESTING-PLAN.md` (different project)       | Low      | 🔜 |

---

## ✅ Fixed in this change

### 1. Session cookie was never validated (critical auth bypass)
**Before:** `verify-pin` issued a *random* token that was never stored, and
`proxy.ts` only checked that the cookie was non-empty. Any request with
`Cookie: ahanas_admin_session=anything` passed the gate — reading/modifying
secrets, deleting content, etc. Sessions also never expired.

**Fix:** `src/lib/auth/session.ts` issues **HMAC-signed, self-expiring** tokens
(`version.expiry.signature`) keyed on `ADMIN_SESSION_SECRET` (falling back to
`SUPABASE_SERVICE_ROLE_KEY`). `proxy.ts` now verifies signature + expiry
(constant-time) on every protected request. Stateless — no DB round-trip.

**Follow-up:** set a dedicated `ADMIN_SESSION_SECRET` in production; add
server-side revocation if multi-device logout is ever needed (token table).

### 2. PIN could be reset by anyone (critical takeover)
**Before:** `verify-pin` is public, and `action: "set"` overwrote an existing PIN
without authentication — an attacker could set their own PIN and log in.

**Fix:** the route now sets a PIN **only** when none exists (first-time). Changing
an existing PIN requires the authenticated `PATCH /api/settings`. The `action`
field is ignored; first-time-ness is derived from DB state, not the client.

### 3. Anonymous clients could write/delete storage objects (critical)
**Before:** the storage INSERT/UPDATE/DELETE policies (migration 002) checked only
`bucket_id`, with no role restriction — the anon key could upload/overwrite/delete
any media or thumbnail.

**Fix:** `004_restrict_storage_writes.sql` drops the permissive write policies.
All writes go through the server (service role, which bypasses RLS); anon retains
read-only. **Action required:** apply migration 004 to existing databases.

---

## 🔜 Planned — High

### 4. Secrets and OAuth tokens stored in plaintext
`parent_settings` holds `facebook_app_secret`, `google_client_secret`,
`facebook_access_token`, and `youtube_refresh_token` in plaintext. A DB dump or
read leaks full control of the connected social accounts.

**Steps**
1. Add `pgcrypto` (or app-level AES-256-GCM) and a key from a secret manager /
   `ENCRYPTION_KEY` env var.
2. Introduce `src/lib/crypto.ts` with `encryptSecret` / `decryptSecret`.
3. Encrypt on write in the settings PATCH + OAuth callback; decrypt in
   `getAppCredentials` and the publisher.
4. Migrate existing rows (one-off script). Never return secrets to the client —
   the settings GET already masks them; keep it that way.

### 5. Public storage bucket exposes unapproved/private media
Both buckets are `public: true`. Content in `review_needed`/`private` still has
publicly reachable media URLs (UUID paths make enumeration hard, but the objects
are not access-controlled). For a child's media this is a privacy issue.

**Steps**
1. Make `media` (at least) a **private** bucket; keep `thumbnails` public if
   desired for the public grid.
2. Serve private media via short-lived **signed URLs**
   (`supabase.storage.from('media').createSignedUrl(path, ttl)`), generated
   server-side only for authorised viewers.
3. Update `src/lib/utils/storage.ts` consumers accordingly.

### 6. Social publishing runs synchronously inside the request
`POST /api/content/[id]/publish` awaits `publishToSocialMedia`, which performs a
YouTube resumable upload and Instagram polling (up to ~60s). This blocks the
request and will exceed serverless timeouts; there are no retries or idempotency,
and a crash mid-flight leaves `social_posts` stuck in `publishing`.

**Steps**
1. Make publish enqueue work and return immediately: insert `social_posts` rows
   in `pending` and trigger async processing.
2. Process via a Supabase Edge Function / cron / external worker that drains
   `pending` rows, honours `retry_count` with backoff, and updates status.
3. Add idempotency (skip platforms already `published` for a content id) and a
   reconciliation pass for stuck `publishing` rows.

### 7. No brute-force protection on the PIN
A 4-digit PIN is ~10k combinations; `verify-pin` has no rate limit or lockout.

**Steps**
1. Track failed attempts (count + window) per client/IP, e.g. in a
   `pin_attempts` table or a rate-limit store.
2. Lock out / exponentially back off after N failures; log attempts.
3. Encourage 6–8 digit PINs in the UI.

---

## 🔜 Planned — Medium

### 8. No input validation on API routes
Routes parse `request.json()` / `formData` and cast (`as string`) without schema
validation. Malformed input can reach the DB or produce confusing 500s.

**Steps:** add `zod`; define a schema per route; parse at the boundary and return
`400` with field errors. Start with `upload`, `content/[id]` PATCH, and `settings`.

### 9. No environment validation; scattered non-null assertions
`process.env.NEXT_PUBLIC_SUPABASE_URL!` (and peers) are asserted at multiple call
sites. A missing var yields a cryptic runtime failure deep in a request.

**Steps:** add `src/lib/env.ts` that validates required vars once (zod) and
exports a typed `env`. Replace `process.env.*!` reads with `env.*`. Fail fast at
startup with a clear message.

### 10. Service-role key used for public reads
`GET /api/content` and `usePublicContent` read through the **service role**, which
bypasses RLS — over-privileged for anonymous content and a larger blast radius if
the route is ever mis-scoped.

**Steps:** read public content with the **anon** client so RLS (`public +
published`) is the enforcing boundary; reserve `createSupabaseAdmin` for
writes/admin reads.

### 11. No data-access layer; DB→domain mapping leaks to the client
Supabase queries are scattered across routes and the publisher, and the
DB-record→`ContentItem` mapping lives in the **client** hook `usePublicContent`.
Logic is duplicated (e.g. `getPlatformsForContentType` exists in both source and a
test).

**Steps**
1. Add `src/lib/repositories/` (e.g. `contentRepo`, `settingsRepo`) as the single
   place that talks to Supabase.
2. Move DB→domain mapping server-side; have the public API return ready-to-render
   `ContentItem`s so the client stops reshaping records.
3. Export shared helpers (`getPlatformsForContentType`) from source and have tests
   import them instead of re-implementing.

### 12. Mock content baked into the production path
`usePublicContent` initialises with and falls back to `MOCK_CONTENT`, so the live
site can silently render fabricated content if the API fails.

**Steps:** render a real empty/error state instead; keep `MOCK_CONTENT` strictly
as a test/storybook fixture, not a runtime fallback.

### 14. Swallowed errors; no structured logging/observability
Many handlers use `catch {}` / `catch { return 500 }` and `console.error`. Root
causes are invisible in production.

**Steps:** add a small logger with levels + request correlation; wire an error
reporter (e.g. Sentry); stop discarding caught errors silently.

---

## 📝 Documented decisions

### 13. `parent_settings` mixes settings, secrets, and auth
The singleton table conflates feature toggles, OAuth tokens, app credentials, and
the admin PIN. Acceptable for a **single-tenant, single-admin** app today.
Revisit (split tables, per-child support) only if the product grows to multiple
families/children. The DB-first credential design is deliberate (configure from
the UI post-deploy).

---

## 🔜 Planned — Low / hygiene

### 15. Stale testing plan
`TESTING-PLAN.md` describes a different project ("iTech Portal"). Replace it with
a short plan reflecting this repo, or remove it in favour of the Testing section
in `ARCHITECTURE.md`.

### Other minor items
- Several `<img>` usages instead of `next/image` (LCP/bandwidth) — intentional for
  blob/object URLs in capture previews; revisit for static images.
- Inconsistent thumbnail path scheme (`${id}/thumb.jpg` vs media
  `${type}/${id}/...`) — harmless but worth unifying.
- CSRF: state-changing routes rely on a `SameSite=Strict` cookie, which mitigates
  CSRF; add explicit token checks if the cookie policy is ever relaxed.

---

## Suggested order of work
1. **Apply migration 004** (storage) to every environment — required for fix #3.
2. Set `ADMIN_SESSION_SECRET` in production (fix #1 hardening).
3. #6 async publishing and #5 private media — biggest correctness/privacy wins.
4. #4 secret encryption and #7 PIN rate limiting — defence in depth.
5. #9 env + #8 validation + #11 repositories — structural cleanup, lower risk.
