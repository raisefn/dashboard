# raisefn Dashboard

## What This Is
raisefn is a fundraising intelligence platform. This repo is the frontend — a Next.js app deployed on Vercel.

**raisefn.com is the PUBLIC landing page (early access only). The dashboard is on a separate Vercel deployment.**

## Architecture

- **Framework**: Next.js (App Router), React, Tailwind CSS
- **Deployment**: Vercel (auto-deploys from main), project "dashboard" under justinpetsches-projects
- **Tracker API**: FastAPI on Railway at `api-production-5f7b.up.railway.app`
- **Brain API**: FastAPI on Railway at `brain-production-61da.up.railway.app`
  - Proxied through Vercel rewrites (see `next.config.ts`)
- **Auth**: Supabase (ES256 JWT, magic link + password login)
- **Database**: PostgreSQL on Railway (shared between tracker and brain)

## Key Pages

### Login (`app/login/page.tsx`)
- Password or magic link via Supabase
- Redirects to `/brain/deploy` on success

### Brain Chat (`app/brain/deploy/page.tsx`) — THE MAIN UI
- SSE streaming chat with particle canvas animation
- Static welcome messages (role-specific: founder/investor/builder) with 800ms typing delay
- Imperative DOM for messages (addMessageToDOM, not React state)
- Admin bar: dropdown of users fetched from `/v1/brain/admin/users`, impersonation via X-Impersonate header
- Client-side admin check: `ADMIN_EMAILS = ["justinpetsche@gmail.com"]`
- Token refresh on 401: `supabase.auth.refreshSession()` then retry
- Tool colors: teal (match), emerald (qualify), orange (narrative/signal/outreach), violet (terms)

### Brain Marketing (`app/brain/page.tsx`)
- Brain capabilities showcase (6 V1 + future capabilities)
- Sub-pages: `agents/`, `entrepreneurs/`, `investors/`

### Tracker (`app/tracker/`)
- `rounds/`, `projects/`, `investors/`, `feed/`, `pulse/`

### Landing (`app/page.tsx`)
- Marketing homepage

### Pricing (`app/pricing/page.tsx`)
- Three tiers: Explorer (free), Operator ($99/mo), Enterprise

## Next.js Rewrites (next.config.ts)
- `/v1/brain/:path*` → brain Railway service
- `/brain/api/:path*` → brain Railway service (legacy)
- CORS allows: X-API-Key, Content-Type, Authorization, X-Impersonate

## Supabase Auth
- **ES256 algorithm** (not HS256/RS256) — critical gotcha
- Project: `kvjhdubbcwvebfmncqot.supabase.co`
- Client: `lib/supabase-browser.ts`

## Environment Variables
- `NEXT_PUBLIC_API_URL` — tracker API base URL
- `NEXT_PUBLIC_BRAIN_URL` — brain API base URL
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `API_KEY` — server-side API key for tracker

## Backend (separate repos)
- **raisefn/tracker** — data pipeline (Python, FastAPI, 20+ collectors)
- **raisefn/brain** — intelligence API (FastAPI, Claude-powered, 9 chat tools + 6 REST endpoints)

## Style
- Dark theme (zinc-950 background)
- Accent colors: teal-400 (primary), orange-500 (secondary)
- Mobile responsive

## Current State (2026-03-13)
- Clean DB — fresh start, no test users
- Working: auth, brain chat, admin panel with user dropdown, welcome messages
- Old `/chat` route deleted (replaced by `/brain/deploy`)
