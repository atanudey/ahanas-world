# Ahana's World

A parent-managed creative site for a young artist. It has three faces:

- **Public site** (`/`, `/music`, `/art`, `/reading`, `/space`, `/milestones`) — a gallery of
  published songs, drawings, videos and reading reflections.
- **Child Hub** (`/hub`) — where Ahana records a song, snaps or films a creation, draws on a
  canvas, or logs a book. Every capture goes to the parent for review first.
- **Parent Studio** (`/parent`) — the review queue, publishing (to the site and optionally to
  Facebook, Instagram and YouTube), and settings. Protected by a PIN.

Built with Next.js 16, React 19, Tailwind 4 and Supabase (Postgres + Storage).

## Run the screens only (no database)

```bash
npm install
ADMIN_SESSION_SECRET=dev-secret npm run dev
```

Open <http://localhost:3030>. In development the public pages show sample content when no
database is reachable. Signing in, the Child Hub and uploads need the database (next section).

## Run with a local Supabase (Docker)

1. Create the keys the stack needs (writes `.env`, which git ignores):

   ```bash
   node -e '
   const c=require("crypto"),s=c.randomBytes(32).toString("hex"),b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
   const j=r=>{const h=b({alg:"HS256",typ:"JWT"}),p=b({role:r,iss:"supabase",iat:Math.floor(Date.now()/1e3),exp:Math.floor(Date.now()/1e3)+315360000});return h+"."+p+"."+c.createHmac("sha256",s).update(h+"."+p).digest("base64url")};
   console.log("JWT_SECRET="+s+"\nANON_KEY="+j("anon")+"\nSERVICE_ROLE_KEY="+j("service_role")+"\nPOSTGRES_PASSWORD="+c.randomBytes(12).toString("hex"))' > .env
   ```

2. Start the stack. On the first start the migrations in `supabase/migrations` run
   automatically, then the service roles get `POSTGRES_PASSWORD`:

   ```bash
   docker compose up -d
   ```

3. Point the app at it and start it:

   ```bash
   source .env
   cat > .env.local <<EOF
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
   ADMIN_SESSION_SECRET=$(openssl rand -hex 32)
   NEXT_PUBLIC_SITE_URL=http://localhost:3030
   EOF
   npm run dev
   ```

4. Go to <http://localhost:3030/parent/login>. The first PIN you enter becomes the parent PIN.
   The Child Hub asks for it too: a parent unlocks the device once and the session lasts a day.
   Supabase Studio is at <http://localhost:54323>.

To start again from an empty database: `docker compose down -v`.

### Existing databases

Migrations don't re-run on an existing volume. Apply new ones by hand, in order:

```bash
docker exec -i ahanas-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/00N_name.sql
```

On Supabase Cloud, paste them into the SQL editor. Migration 006 makes the storage buckets
private (media is served through `/api/files`), and 007 adds an index that stops a post being
published to the same platform twice.

## Environment variables

| Variable                        | Purpose                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key                                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service-role key (server writes, signed media URLs)                  |
| `ADMIN_SESSION_SECRET`          | Signs the parent session cookie (falls back to the service-role key) |
| `NEXT_PUBLIC_SITE_URL`          | Public base URL, used for OAuth redirects and Open Graph images      |
| `FACEBOOK_APP_ID` / `_SECRET`   | Optional fallbacks; normally set in Parent Studio → Publish Settings |
| `GOOGLE_CLIENT_ID` / `_SECRET`  | Same, for YouTube                                                    |

## Tests

```bash
npx tsc --noEmit     # types
npm run lint         # eslint
npm test             # unit tests (vitest)
npm run build        # production build
npm run test:e2e     # Playwright, against a running app
```

## Layout

```
src/app/            routes (App Router) and API handlers
src/components/     public site, hub capture modals, parent views, Minecraft theme
src/lib/            auth, content loaders, social publishing clients, storage helpers
supabase/migrations numbered SQL, applied in order
docker/             Kong config and the database init script
tests/              unit (vitest) and e2e (Playwright)
```

More detail in `docs/ARCHITECTURE.md`.
