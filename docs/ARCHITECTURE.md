# Ahana's World — Architecture

A private creative portfolio for a child. Captures (songs, art, videos, reading
reflections) are recorded from a tablet-friendly **Hub**, reviewed by a parent in
the **Parent Studio**, and — once approved — published to a **public site** and
optionally cross-posted to Facebook, Instagram, and YouTube.

> This document describes the system as it is. For known weaknesses and the plan
> to address them, see [`ARCHITECTURE-REVIEW.md`](./ARCHITECTURE-REVIEW.md).

---

## 1. Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router, Turbopack, React 19)                 |
| Language     | TypeScript (strict)                                          |
| Styling      | Tailwind CSS v4, custom theme system (3 themes)              |
| Data / Auth  | Supabase (Postgres + Storage); custom PIN-based admin auth   |
| Media        | Client-side capture (MediaRecorder/Canvas) + browser compression |
| Social       | Facebook Graph API, Instagram Graph API, YouTube Data API v3 |
| Tests        | Vitest + Testing Library (unit), Playwright (E2E)            |
| Hosting      | Replit / Docker (standalone Next output)                     |

> **Note:** Next.js 16 renamed the `middleware` convention to **`proxy`**. The
> request gate lives in `src/proxy.ts` and exports a `proxy` function — this is
> intentional and correct for this version, not a typo.

---

## 2. Surfaces

The app has three distinct surfaces, separated by route group and auth posture.

### Public site (`/`, `/music`, `/art`, `/space`, `/reading`, `/milestones`, `/content/[slug]`)
Anonymous, read-only. Renders **published + public** content. Route group
`src/app/(public)`. Content is fetched client-side via `usePublicContent`, which
falls back to `MOCK_CONTENT` when the API/DB is unavailable.

### Hub (`/hub`)
The child's capture studio — tablet-first. Four capture components under
`src/components/hub`:
- `AudioCapture` — record songs
- `DrawingCapture` — draw on a canvas
- `VideoCapture` — photo/video via camera
- `ReadingCapture` — book reflections

Captures are compressed in the browser (`src/lib/utils/compress.ts`) and uploaded
through `useUploadContent` → `POST /api/content/upload`. New content lands in
status `review_needed`, visibility `private`.

> The Hub is currently **not** behind the auth gate (see review doc). It is meant
> to be used on a trusted family device.

### Parent Studio (`/parent`, `/parent/login`)
PIN-protected dashboard for reviewing, editing, approving/publishing, and
configuring social integrations. Views under `src/components/parent`
(`ContentDetailPanel`, `PublishSettingsView`, `ReleaseCalendarView`, etc.).

---

## 3. Directory map

```
src/
  app/
    (public)/            Public route group (sections + content detail)
    hub/                 Capture studio
    parent/              Parent dashboard + login
    api/
      auth/verify-pin/   PIN setup + verification, issues session cookie
      content/           CRUD + upload + publish
      settings/          Settings CRUD + OAuth initiation/callback
    layout.tsx           Root layout (ThemeProvider, fonts)
    manifest.ts          PWA manifest
  components/
    public/ hub/ parent/ minecraft/ shared/
  context/ThemeContext.tsx   Theme store (useSyncExternalStore)
  hooks/                     useUploadContent, usePublicContent
  lib/
    auth/                session.ts (signed tokens), pin.ts (hashing)
    social/              publisher.ts + facebook/instagram/youtube clients
    supabase/            server.ts (service role), client.ts (anon)
    utils/               storage.ts (URLs), compress.ts (media)
    credentials.ts       DB-first app credentials w/ env fallback
    constants.ts theme.ts types/
  proxy.ts               Auth gate (Next 16 "proxy"/middleware)
supabase/migrations/     SQL schema, storage buckets, RLS
tests/                   unit/ (Vitest), e2e/ (Playwright), check-links.ts
docs/                    This documentation
```

---

## 4. Data model

Three tables (`supabase/migrations/001_create_tables.sql`,
`003_add_app_credentials.sql`):

### `content`
The registry of every capture.
- Identity: `id` (uuid), `slug` (unique), `type`, `title`
- Editorial: `description`, `story`, `notes`, `category`, `medium`, `sections[]`
- Lifecycle: `status` (`draft → review_needed → scheduled → published / failed / archived / private`), `visibility` (`public / private / internal`)
- Media: `media_path`, `thumbnail_path`, `media_type`, `file_size_bytes`, `duration_ms`
- Stats/time: `views`, `xp_awarded`, `created_at`, `updated_at`, `published_at`

### `social_posts`
One row per platform publish attempt, FK to `content` (cascade delete).
- `platform`, `status` (`pending / publishing / published / failed / skipped`),
  `platform_post_id`, `platform_url`, `error_message`, `retry_count`

### `parent_settings` (singleton, `id = 1`)
Mixes three concerns:
- Toggles: `auto_publish`, `*_enabled`, `require_review`
- OAuth tokens: `facebook_access_token`, `facebook_page_id`, `instagram_account_id`, `youtube_refresh_token`, `youtube_channel_id`
- App credentials + admin: `facebook_app_id/secret`, `google_client_id/secret`, `google_redirect_uri`, `site_url`, `admin_pin_hash`

### Storage
Two **public** buckets, `media` and `thumbnails` (`002_create_storage.sql`).
Server uploads with the service-role key. Public read; writes restricted to the
service role (`004_restrict_storage_writes.sql`).

### Row-Level Security
- `content`: anon may `SELECT` only `visibility='public' AND status='published'`.
- `social_posts`, `parent_settings`: RLS enabled, **no** anon policy → no anon access.
- The service role bypasses RLS (`BYPASSRLS`), so all server paths work regardless.

---

## 5. Key flows

### Capture → upload
1. Hub capture component produces a `Blob` (+ optional thumbnail).
2. `useUploadContent` compresses images / extracts a video thumbnail, builds
   `FormData`, and `POST`s to `/api/content/upload`.
3. The route uploads to Storage (service role), then inserts a `content` row with
   `status='review_needed'`, `visibility='private'`.

### Review → publish
1. Parent opens the Studio (PIN gate), edits via `PATCH /api/content/[id]`.
2. Approve → `POST /api/content/[id]/publish`:
   - sets `status='published'`, `visibility='public'`, `published_at`
   - calls `publishToSocialMedia(id)` **synchronously**
3. `publishToSocialMedia` selects platforms by media type, filters by enabled
   settings + token configuration, calls each client, and records a `social_posts`
   row per platform (`published` / `failed` / `skipped`).

### Social OAuth
1. `GET /api/settings/oauth/[platform]` redirects to the provider consent screen.
2. Provider redirects to `GET /api/settings/oauth/callback`, which exchanges the
   code for tokens and stores them in `parent_settings`.
3. YouTube publishing later refreshes its access token on demand via
   `getAppCredentials()`.

---

## 6. Authentication

Single-admin, PIN-based. (No Supabase Auth / user accounts.)

- **PIN setup/verify:** `POST /api/auth/verify-pin`. First call (no PIN yet)
  stores `SHA-256(pin)` and signs the admin in. Later calls verify in constant
  time. A PIN can only be *changed* through the authenticated
  `PATCH /api/settings`.
- **Session:** an HMAC-signed, self-expiring token (`src/lib/auth/session.ts`),
  stored in the `ahanas_admin_session` httpOnly + `SameSite=Strict` cookie (24h).
  Signed with `ADMIN_SESSION_SECRET` (falls back to `SUPABASE_SERVICE_ROLE_KEY`).
- **Gate:** `src/proxy.ts` verifies the token's signature and expiry on
  `/parent/*`, `/api/settings/*`, `/api/content/*`. API → `401`; pages → redirect
  to `/parent/login`. The Hub and the public site are open.

---

## 7. Configuration

Credentials are **DB-first with env fallback** (`getAppCredentials`), so the app
can be configured from the Studio UI after deploy without redeploying.

| Variable                       | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL (client + server)          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Anon key (browser client)                       |
| `SUPABASE_SERVICE_ROLE_KEY`    | Service role (server writes; session secret fallback) |
| `ADMIN_SESSION_SECRET`         | Dedicated HMAC key for admin sessions (recommended) |
| `FACEBOOK_APP_ID/SECRET`       | Fallback if not set in `parent_settings`        |
| `GOOGLE_CLIENT_ID/SECRET`      | Fallback if not set in `parent_settings`        |
| `GOOGLE_REDIRECT_URI`          | OAuth callback override                          |
| `NEXT_PUBLIC_SITE_URL`         | Base URL for OAuth redirects                     |

---

## 8. Testing & CI

- **Unit** (`tests/unit`, Vitest): logic layer — auth, social clients, publisher
  orchestration, credentials, storage URLs, theme store. Coverage is scoped to
  `src/lib/**` + `src/context/**` (UI is covered by E2E) with ~80% thresholds.
- **E2E** (`tests/e2e`, Playwright): public pages, auth, content, settings,
  OAuth, smoke, broken-links.
- **Standalone:** `tests/check-links.ts` crawls for broken links.
- **CI** (`.github/workflows/test.yml`): lint + typecheck → unit tests → build →
  E2E, on push/PR to `main`.

Local commands: `npm run dev`, `npm test`, `npm run test:coverage`,
`npm run test:e2e`, `npm run lint`, `npm run build`.

---

## 9. Deployment

`next.config.ts` uses `output: "standalone"`. Targets:
- **Replit** (`.replit`): `npm run build && npm run start`.
- **Docker** (`docker/`, `docker-compose.yml`): app + self-hosted Supabase.

Migrations in `supabase/migrations` run in order (`000` roles → `004` storage
hardening).
