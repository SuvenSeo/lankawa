# Lankawa Partner Integrations

This document describes how Lankawa integrates the Ardeno sister platforms: Octane, PropertyLK, Vehicle Platform, Food Platform, and Life Platform. All UI navigation stays in-platform — partner URLs are used for server-side fetch only.

## Summary

| Platform | Adapter | Live status (Jul 2026) | Lankawa module | Seed fallback |
|----------|---------|------------------------|----------------|-----------------|
| **Octane** | `src/lib/integrations/octane.ts` | ✅ Live (`/v1/prices/latest`, `/v1/prices/history`) | Home pulse, `/economy`, `/api/v1/fuel/history` | Static CPC series in `src/lib/fuel.ts`; pulse uses last-known CPC prices |
| **PropertyLK** | `src/lib/integrations/propertylk.ts` | ⚠️ Intermittent (production API often times out) | `/property`, `/api/v1/property`, pulse property metric | `src/data/property-seed.json` — explicit seed notice on page when live fetch fails |
| **Vehicle Platform** | `src/lib/integrations/vehicle.ts` | ✅ Live | `/vehicles`, `/api/v1/vehicles`, pulse vehicle metric | `src/data/vehicle-seed.json` |
| **Food Platform** | `src/lib/integrations/food.ts` | ❌ Direct endpoints return HTTP 500 | `/food`, `/api/v1/food`, COL food link | `src/data/food-seed.json`; tries Life Platform food domain as secondary live source |
| **Life Platform** | `src/lib/integrations/life.ts` | ✅ Live (`/api/v1/life/overview`) | `/ardeno`, `/api/v1/life`, home Ardeno cards | `src/lib/life.ts` seed overview |
| **Open-Meteo (weather)** | `src/lib/integrations/weather.ts` | ✅ Live | Home pulse, hero strip | Unavailable → `—` with tier `down` |
| **CEB power** | `src/lib/integrations/power.ts` | ✅ Live (CEB Care scrape) | Home pulse, `/disaster` | `unknown` status when CEB Care unreachable — never fake normal |
| **CSE (Colombo Stock Exchange)** | `src/lib/integrations/cse.ts` | ✅ Live (`cse.lk` public HTTP) | `/economy` CseMarketCard + pulse `cse_aspi` | Seed snapshot when API unavailable |
| **News RSS** | `src/lib/integrations/news.ts` | ✅ Live (Daily Mirror + Ada Derana RSS) | Pulse civic metric `news_headlines` | Ingest cache at `ingest/output/sl_news.json` |

## Environment variables

```bash
OCTANE_API_BASE=https://octane-api.fly.dev
PROPERTYLK_API_URL=https://property-price-intelligence-an-ardeno-production.fly.dev
VEHICLE_API_BASE=https://vehicle-platform-backend.fly.dev/api/v1
FOOD_API_BASE=https://food-platform-backend.fly.dev/api/v1
LIFE_API_BASE=https://life-platform-backend.fly.dev/api/v1

# Pulse layer (optional overrides)
CSE_LK_API_BASE=https://www.cse.lk/api
NEWS_RSS_FEEDS=https://www.dailymirror.lk/rss/1,https://www.adaderana.lk/rss.php
```

## Octane (fuel)

**Endpoints tried**

- `GET {OCTANE_API_BASE}/v1/prices/latest` — home pulse, economy
- `GET {OCTANE_API_BASE}/v1/prices/history?fuel=petrol_92&source=cpc&limit=90` — fuel history API

**Fallback**

- Pulse: last-known CPC prices (petrol 92 = 414, auto diesel = 382, dated 2026-06-30) with freshness note
- History: static 7-point series in `src/lib/fuel.ts`

**Provenance:** `octane_fuel` → `/sources/octane_fuel`

## PropertyLK (property)

**Endpoints tried**

- `GET {PROPERTYLK_API_URL}/api/v1/districts` — property page, `/api/v1/property`, pulse

**Fallback**

- `src/data/property-seed.json` with `sourceId: propertylk_seed`
- Property page shows `disclaimerSeed` when live API unavailable
- Pulse note: "Seed fallback — live PropertyLK API unavailable"

**Provenance:** `propertylk_api` (live) or `propertylk_seed` (fallback)

## Vehicle Platform (AutoLens LK)

**Endpoints tried**

- `GET {VEHICLE_API_BASE}/stats/summary` — national totals
- `GET {VEHICLE_API_BASE}/stats/district-prices` — district medians (mapped to Lankawa slugs)
- `GET {VEHICLE_API_BASE}/listings/makes` — popular makes

**Not used in UI:** `/listings` (contains external listing URLs — never surfaced in Lankawa)

**Fallback**

- `src/data/vehicle-seed.json` from June 2026 market snapshot

**Provenance:** `vehicle_platform_api` or `vehicle_platform_seed` → `/sources/{id}`

## Food Platform (FoodLK)

**Endpoints tried (direct — all returned HTTP 500 during integration testing)**

- `/api/v1/stats/summary`
- `/api/v1/categories/summary`
- `/api/v1/home/summary`
- `/api/v1/basket/estimate?district=colombo`
- `/api/v1/items`, `/api/v1/market-quotes`, `/api/v1/trends/summary`

**Secondary live source**

- `GET {LIFE_API_BASE}/life/overview` — food domain metrics and `top_items` when FoodLK direct API fails

**Fallback**

- `src/data/food-seed.json` — staples from Life Platform patterns; district meal costs aligned with cost-of-living seed

**Provenance:** `food_platform_api` or `food_platform_seed`

## Life Platform (Ariva)

**Endpoints tried**

- `GET {LIFE_API_BASE}/life/overview` — Ardeno hub headline + domain health
- `GET {LIFE_API_BASE}/life/domains` — available but overview preferred for hub page

**Fallback**

- Constructed seed in `getLifeOverviewSeed()` referencing Octane, PropertyLK, AutoLens LK, FoodLK modules

**Provenance:** `life_platform_api` or `life_platform_seed` → `/sources/{id}`

## CSE consolidation strategy (PulseCSE vs Chime)

Lankawa needs Colombo Stock Exchange (CSE) market data for the economy pulse. Two sister repos implement overlapping concerns:

| Dimension | [PulseCSE](https://github.com/SuvenSeo/PulseCSE) | [Chime / koel](https://github.com/Cookie-Cat21/Chime) |
|-----------|--------------------------------------------------|--------------------------------------------------------|
| **Purpose** | Full-stack investor alert cockpit (dashboard, portfolio P&L, simulations, metrics API) | Thin CSE watcher: Telegram push alerts + optional browse dash |
| **Backend** | Python FastAPI + Postgres/SQLite + migrations + pollers | Python poller + Postgres; package name `chime` |
| **Notifications** | Telegram bot, webhooks, console — first-class | Telegram push — primary product surface |
| **CSE data** | Live adapter behind `adapters/` boundary + mock mode | `chime/adapters/cse.py` — verified public `cse.lk` JSON endpoints |
| **Scope for Lankawa** | Too heavy — duplicates alert engine, storage, bot runtime | Right adapter boundary — read-only HTTP fetch, normalized snapshots |

### Decision

**Lankawa uses read-only CSE data ported from the Chime adapter pattern — not a fork of PulseCSE.**

1. **No Telegram** — Lankawa is in-platform civic UX; no bot commands or push routing.
2. **No duplicate PulseCSE backend** — PulseCSE remains a separate Ardeno product (alerts, portfolio, `/api/dashboard`). Lankawa does not embed or proxy its Postgres schema.
3. **Public CSE HTTP only** — Server-side fetch of `https://www.cse.lk/api/*` endpoints (ASPI, market summary, trade summary) with the same normalization discipline as `chime/adapters/cse.py`: circuit-breaker friendly, market-hours aware, delayed-data disclaimers.
4. **Economy module only** — CSE metrics (`cse_aspi`, `cse_market_status`) surface on `/economy`, not the home “today” strip (FX, fuel, weather, power, flood stay primary).
5. **Provenance** — `cse_lk` source → `/sources/cse_lk`; no external links to PulseCSE or Chime in UI.

### Implementation status

| File | Status |
|------|--------|
| `src/lib/sources.ts` | ✅ `cse_lk` source registered |
| `src/lib/integrations/cse.ts` | ✅ `buildCseSnapshot()`, `buildCsePulseMetricFromSnapshot()` |
| `src/lib/pulse.ts` | ✅ CSE metric on economy pulse; excluded from home today strip |

Reference endpoints (from Chime probe, Jul 2026): `aspiData`, `snpData`, `tradeSummary`, `marketSummery`, `marketStatus`.

## Weather (Open-Meteo)

**Adapter:** `src/lib/integrations/weather.ts`

- `GET https://api.open-meteo.com/v1/forecast` — Colombo coordinates, current temp + WMO weather code + precipitation
- **Pulse builder:** `buildWeatherPulseMetric()` → metric `weather_colombo`
- **Revalidate:** 30 min (`next: { revalidate: 1800 }`)
- **Fallback:** value `—`, tier `down`, note "Open-Meteo unavailable"

**Provenance:** `open_meteo` → `/sources/open_meteo`

## Power (CEB outages)

**Adapter:** `src/lib/integrations/power.ts`

- **Target:** CEB Care (`https://cebcare.ceb.lk`) — demand-management schedule + sampled present outages
- **Pulse builder:** `buildPowerPulseMetric()` → metric `power_status` (`normal` | `scheduled` | `outage` | `unknown`)
- **Fallback:** Returns `unknown` when CEB Care cannot be reached — never fabricates `normal`
- **UI link:** provenance path `/disaster` (grouped with flood monitoring)

**Provenance:** `ceb_power` → `/sources/ceb_power`

## News RSS

**Adapter:** `src/lib/integrations/news.ts`

- **Feeds:** Daily Mirror breaking news, Ada Derana RSS
- **Pulse builder:** `buildNewsPulseMetric()` → metric `news_headlines` (count + top headline note)
- **Cache:** `ingest/output/sl_news.json` when fresh; live fetch with 30 min revalidate
- **Not on home today strip** — civic pulse contribution only

**Provenance:** `news_rss` → `/sources/news_rss`

## In-platform pages & APIs

| Page | URL |
|------|-----|
| Ardeno hub | `/[locale]/ardeno` |
| Vehicles | `/[locale]/vehicles` |
| Food | `/[locale]/food` |
| Property (existing) | `/[locale]/property` |
| Economy / fuel (existing) | `/[locale]/economy` |

| API | URL |
|-----|-----|
| Vehicles | `/api/v1/vehicles` |
| Food | `/api/v1/food` |
| Life overview | `/api/v1/life` |
| Property (existing) | `/api/v1/property` |
| Fuel history (existing) | `/api/v1/fuel/history` |

## Design constraints

1. **No external clickable links** to fly.dev or partner homepages in UI
2. **Server-side fetch only** — `next: { revalidate }` caching on integration adapters
3. **Graceful degradation** — every adapter returns seed data when upstream fails
4. **Provenance** — every snapshot exposes `sourceId`, `sourceName`, and `/sources/[id]` links

## Audit: before vs after

### Before this integration

- Octane: live in pulse and fuel history ✅
- PropertyLK: adapter existed but property page/pulse used static seed only ⚠️
- Vehicle, Food, Life: not integrated ❌
- Ardeno hub: not present ❌

### After this integration

- Octane: pulse fallback prices when API down ✅
- PropertyLK: live fetch on property page + pulse; seed with explicit messaging ✅
- Vehicle: full module + API + pulse + search + nav ✅
- Food: module + API + Life Platform secondary fetch + seed ✅
- Life: Ardeno hub + API + home preview cards ✅
- Weather: Open-Meteo live on home pulse + hero strip ✅
- Power: live CEB Care on home pulse + disaster hub ✅
- CSE: live `cse.lk` adapter on economy pulse; seed fallback ✅
- News RSS: live RSS parse + ingest cache fallback ✅
