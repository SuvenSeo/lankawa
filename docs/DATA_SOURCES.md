# Data Sources Registry

| ID | Name | Tier | Cadence | URL | Status |
|----|------|------|---------|-----|--------|
| `octane_fuel` | Octane Fuel API | Partner | Weekly | https://octane-api.fly.dev | Live |
| `lk_flood_api` | Sri Lanka Flood API | API | 10 min | https://lk-flood-api.vercel.app | Live |
| `cbsl_fx` | Central Bank FX | Scrape | Daily | https://www.cbsl.gov.lk | Live scrape + scheduled ingest |

## CBSL FX

- **Endpoint**: POST `https://www.cbsl.gov.lk/cbsl_custom/exratestt/exrates_resultstt.php`
- **Form fields**: 7-day window, `chk_cur[]=USD~US Dollar`, `submit_button=Submit` (required)
- **Metrics**: `usd_lkr_buy`, `usd_lkr_sell` (sell shown on pulse dashboard)
- **Runtime fetch**: `src/lib/integrations/cbsl.ts` (pulse page, graceful fallback)
- **Scheduled ingest**: `ingest/sources/cbsl_fx.py` + Vercel cron `/api/cron/ingest` + GitHub Actions

## District Map GeoJSON

- **File**: `public/geo/districts.geojson`
- **Origin**: [MalakaGu/Sri-lanka-maps](https://github.com/MalakaGu/Sri-lanka-maps) (ADM2 boundaries)
- **Enhancement**: `slug` property mapped to Lankawa district keys (25 districts)

## Bot Policy

User-Agent: `LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)`

- Server-side fetches only
- Conservative cadence (daily for CBSL)
- Exponential backoff on failure (`ingest/base.py`)
- Never block page loads on remote fetches (fallback values in pulse)

## Ingest Schedule

| Trigger | Schedule | Path |
|---------|----------|------|
| Vercel Cron | `0 6 * * *` (06:00 UTC) | `/api/cron/ingest` |
| GitHub Actions | `0 6 * * *` | `.github/workflows/ingest.yml` |

Set `CRON_SECRET` on Vercel for authenticated cron invocations. Persisted observations require `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
