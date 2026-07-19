# Lankawa Architecture

## Layers

1. **Experience** — Next.js web app, PWA, public REST API
2. **Modules** — Pulse, District Atlas, Disaster, Economy (Phase 1)
3. **Data** — Source registry, observations, freshness SLAs
4. **Ingest** — Python workers with pluggable source adapters

## Freshness Contract

Every data source reports:
- `fresh` — within expected cadence
- `stale` — within 3× cadence
- `down` — older or unreachable

## Data Tiers

| Tier | Examples |
|------|----------|
| Partner API | Octane fuel, lk-flood-api |
| Community | nuuuwan/lanka_data, lk_irrigation |
| Scrape | CBSL FX, CEYPETCO, CEB, Meteo |
| Documents | Budget PDFs, gazettes |

## Deployment

- **Web/API**: Vercel (`bom1` region)
- **Ingest**: GitHub Actions or Fly.io
- **Database**: Supabase/Neon PostgreSQL + PostGIS
