# NOCTIVA

Animated anime wallpaper platform: public gallery, permanent link per wallpaper, no-signup downloads, private admin dashboard managed from a phone.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS) · Cloudflare R2 · Vercel

> Status: the source was written but **has not been built or run yet** (the authoring sandbox had no internet for `npm install`). Follow the steps below, run `npm run build`, and fix anything it reports before going live.

## What's implemented

- Public: cinematic hero (original SVG artwork), featured / latest / popular, categories, search, filters (category, quality), sort, pagination, favorites (browser-only), EN/AR with full RTL (cookie-persisted), legal pages, SEO (metadata, Open Graph, canonical, JSON-LD, sitemap, robots), empty/error/unavailable pages.
- `/v/<slug>`: dynamic page from the database (e.g. `moonlight-001`), video preview, metadata, quality picker, copy/native/WhatsApp/Telegram/X share, related wallpapers. Unpublished or deleted → professional "unavailable" page.
- Downloads: `/api/download/<fileId>` → short-lived signed R2 URL with `Content-Disposition: attachment` (the real stored file). One download counted per visitor per wallpaper per 10 minutes.
- Admin (`/admin`): Supabase email login + `admin_users` check (middleware, layouts and every API route), dashboard (totals, storage, recents, top), upload with progress, edit / replace video / extra qualities / thumbnail / preview, publish / unpublish, delete with confirmation, category CRUD (EN + AR names), Instagram import.
- Security: RLS on all tables, service-role key server-only, private bucket for originals, upload type/size validation, object existence check before saving, rate limiting (best-effort), security headers.

## Honest limitations

- **Uploads are not resumable.** They go straight to R2 with a progress bar; a failed upload restarts. (Single PUT limit on R2 is 5 GB.)
- **No automatic FFmpeg conversion.** Extra qualities are uploaded manually. The thumbnail is captured in the browser from the video (if the phone's browser can decode it) or uploaded.
- **Instagram import works only for your own media.** It uses the official Instagram API with your access token; a public Reel URL from anyone else cannot be imported. The file returned is what Instagram serves for that Reel, which may not be your original export — upload the original manually for best quality. Imports are saved as **drafts**; nothing is published until you review it.
- Rate limiting is in-memory per serverless instance. Add Cloudflare/Vercel WAF rules for strict limits.
- Legal pages are generic templates. Have them reviewed before launch.

## Setup (works from a phone using GitHub Codespaces)

### 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
3. Authentication → Users → **Add user** (your email + a strong password).
4. SQL Editor, run (use your email):
   ```sql
   insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';
   ```
5. Authentication → Providers → Email: **disable sign-ups** so nobody else can create accounts.
6. Project Settings → API → copy URL, anon key, service-role key.

### 2. Cloudflare R2
1. Create two buckets: `noctiva-private` (originals, stays private) and `noctiva-public` (thumbnails + previews).
2. On `noctiva-public`: Settings → enable Public access (r2.dev or your custom domain). Copy the public URL.
3. R2 → Manage API tokens → create a token with **Object Read & Write** for both buckets. Copy Account ID, Access Key ID, Secret.
4. CORS (needed for browser uploads). On **both** buckets → Settings → CORS policy:
   ```json
   [{
     "AllowedOrigins": ["https://YOUR-DOMAIN", "http://localhost:3000"],
     "AllowedMethods": ["PUT", "GET", "HEAD"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3600
   }]
   ```

### 3. Instagram import (optional)
Use an Instagram **professional** account, create a Meta app with "Instagram API with Instagram Login", generate a long-lived token for your account, and set `INSTAGRAM_ACCESS_TOKEN`. Without it, the import page shows a clear message and offers manual upload.

### 4. GitHub + Vercel
1. Push this folder to a new GitHub repository (never commit `.env`).
2. vercel.com → Add New Project → import the repo.
3. Add every variable from `.env.example` in Project → Settings → Environment Variables.
4. Deploy. Every push to `main` deploys automatically.
5. Set `NEXT_PUBLIC_SITE_URL` to your real domain and redeploy.

### Local run
```bash
cp .env.example .env.local   # fill in values
npm install
npm run build && npm start   # or: npm run dev
```

## Project structure
```
supabase/migrations/0001_init.sql   schema, indexes, RLS, seed categories
src/middleware.ts                   session refresh + /admin gate
src/lib/                            i18n, r2, auth, data, supabase clients, utils
src/components/                     public UI + admin/ forms
src/app/                            pages (/, /explore, /v/[slug], /favorites, /legal/[doc])
src/app/admin/                      login + (panel)/ dashboard, upload, wallpapers, categories, import
src/app/api/                        download, wallpapers, admin/*
```

## Production checklist
- [ ] `npm run build` and `npm run typecheck` pass
- [ ] Admin login works; a non-admin account is rejected
- [ ] Upload a real video: thumbnail, publish, open `/v/<slug>` in a private window, download, and compare the file size/hash with the original
- [ ] Test on Android Chrome and iPhone Safari (upload + download)
- [ ] Arabic RTL pass over every page
- [ ] Sign-ups disabled in Supabase; R2 private bucket is not public
- [ ] Legal pages reviewed; `NEXT_PUBLIC_CONTACT_EMAIL` set


## Update note
Apply all SQL files in `supabase/migrations` in filename order. Existing deployments must also apply `0002_fix_download_rpc_permissions.sql`.
