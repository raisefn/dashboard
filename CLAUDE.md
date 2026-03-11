# raisefn Dashboard

## What This Is
raisefn is a fundraising intelligence platform. This repo is the frontend — a Next.js app deployed on Vercel at raisefn.com.

## Architecture

- **Framework**: Next.js (App Router), React, Tailwind CSS
- **Deployment**: Vercel (auto-deploys from main)
- **Backend API**: FastAPI on Railway at `brain-production-61da.up.railway.app`
  - Proxied through Vercel rewrites (see `next.config.ts`)
  - Auth: `X-API-Key` header
- **Database**: PostgreSQL on Railway (shared with tracker)
- **API client**: `lib/api.ts` — typed fetch helpers for all endpoints

## Key Pages

### Landing (`app/page.tsx`)
- Marketing homepage with animated hero, data sources graphic, pricing summary
- Prominent "data foundation" statement about 290+ sources

### Tracker (`app/tracker/`)
- `page.tsx` — data sources overview with animated graphic
- `rounds/` — browse funding rounds (filterable by type, sector, chain, amount, date)
- `projects/` — browse projects with enrichment data
- `investors/` — browse investors with round counts
- `feed/` — real-time funding feed
- `pulse/` — market stats dashboard (overview, sector breakdown, top investors)
- `layout.tsx` — shared tracker nav

### Brain (`app/brain/`)
- `page.tsx` — Brain capabilities showcase (6 V1 + future capabilities)
- Sub-pages: `agents/`, `entrepreneurs/`, `investors/` — audience-specific pages
- Chat UI is served from the Brain API itself at `/chat`

### Pricing (`app/pricing/page.tsx`)
- Three tiers: Explorer (free), Operator ($99/mo), Enterprise
- Explorer = full tracker access + 1 free Brain query
- Operator = unlimited Brain queries via API + chat

### SDK (`app/sdk/page.tsx`)
- Agent SDK documentation page

## Shared Components

- `components/nav.tsx` — top navigation bar
- `components/early-access-modal.tsx` — email capture modal (writes to Supabase)
- `components/fade-in-section.tsx` — intersection observer fade-in wrapper
- `components/pagination.tsx` — paginated list controls
- `components/stats-card.tsx` — metric display card
- `components/tracker-coming-soon.tsx` — placeholder for unbuilt tracker pages

## Data Flow

```
Railway Postgres ← tracker collectors fill data
       ↓
FastAPI API (Railway) ← serves /v1/projects, /v1/rounds, /v1/investors, /v1/stats/*
       ↓ (proxied via Vercel rewrites)
Next.js (this repo) ← lib/api.ts fetches with 5-min cache (revalidate: 300)
```

## In Progress / Planned

- **User auth & sign-in**: Free tier users sign in to access the tracker (Explorer tier)
- **Free tracker**: Authenticated users can browse rounds, projects, investors
- **Brain chat**: Already live at the Brain API `/chat` endpoint, proxied through Vercel

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend API base URL
- `API_KEY` — server-side API key for backend requests
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for early access signups

## Backend (separate repos)

- **raisefn/tracker** — data collection pipeline (Python, SQLAlchemy, 20+ collectors)
- **raisefn/brain** — intelligence API (FastAPI, Claude-powered, 6 endpoints + chat)

## Style

- Dark theme (zinc-950 background)
- Accent colors: teal-400 (primary), orange-500 (secondary)
- Minimal, no unnecessary animations beyond fade-ins
- Mobile responsive
