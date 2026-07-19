# Lankawa Roadmap

Phase 4 shipped July 2026. This document captures research from Phase 4 development and recommendations for Phase 5+.

## Phase 4 Delivered

| Feature | Status |
|---------|--------|
| Public services for all 25 districts | ✅ 78 seeded facilities (hospital, school, GN office per district + extras) |
| Province choropleth maps | ✅ Density / presidential / parliamentary modes, lazy-loaded |
| API expansion | ✅ Provinces, parliamentary, services, flood history |
| Election swing charts | ✅ 2019 presidential baseline vs 2024 |
| Flood sparklines | ✅ Per-station history on district pages |
| Vanni crosswalk | ✅ Explainer on elections + affected district pages |
| GeoJSON optimization | ✅ 579KB → 124KB (~79% reduction) |

## GeoJSON Optimization Notes

- **Before:** `public/geo/districts.geojson` — 592,630 bytes (~579 KB)
- **After:** 126,873 bytes (~124 KB) — **78.6% reduction**
- **Method:** Coordinate precision reduction (4 decimal places) + vertex decimation (min 0.008° spacing) via `scripts/simplify-geojson.mjs`
- **Caching:** `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` on `/geo/*` via `next.config.ts`

## Data Limitations & Seed Caveats

1. **Public services:** Representative facilities per district sourced from MoH hospital lists, MoE school directories, and district secretariat references. Not exhaustive — typically 3+ facilities per district (1 hospital, 1 school, 1 GN office). Colombo, Kandy have additional landmark entries.
2. **2019 presidential baseline:** Sri Lanka's prior presidential election was November 2019 (Gotabaya Rajapaksa vs Sajith Premadasa). Used as the "2020 comparison baseline" for swing charts; district figures are seeded approximations aligned with published national totals, not digitized official district ledgers.
3. **Vanni districts:** Kilinochchi, Mannar, Mullaitivu, and Vavuniya share aggregated Vanni electoral-district presidential totals in official returns — individual admin-district splits are not published separately.
4. **Flood history:** Depends on lk-flood-api availability; sparklines degrade gracefully when the upstream API is down.
5. **GeoJSON:** Simplified boundaries are suitable for choropleth at national scale; not for cadastral or high-precision GIS.

---

## Gap Analysis: What Sri Lankan Civic Platforms Are Missing

Research across existing portals (Election Commission, CBSL, Disaster Management Centre, Ministry websites, Verité Research, Manthri.lk, etc.) reveals persistent gaps Lankawa could own:

| Gap | Opportunity for Lankawa |
|-----|---------------------------|
| **Unified district key** | Most portals use inconsistent geography; Lankawa's 25-district atlas is already the right abstraction |
| **Budget & expenditure tracker** | No consumer-friendly national/provincial budget explorer with year-over-year charts |
| **Government tenders (Procurement)** | e-GP data exists but is fragmented; district/province-filtered tender feed would be high value |
| **MP attendance & voting** | Manthri.lk covers some ground but no integrated district-linked attendance scorecards |
| **Dengue & disease maps** | Epidemiology Unit publishes weekly counts; no live choropleth by district |
| **Fuel price history** | Octane/Lanka IOC publish prices; no longitudinal in-platform chart (Phase 3 started FX sparkline pattern) |
| **Bus & rail connectivity** | No open GTFS for Sri Lanka; static route maps per district would help |
| **Court case backlog / HRCSL** | Human rights and judicial metrics are PDF-only |
| **Local government ( Pradeshiya Sabha)** | 340+ local bodies with no searchable directory |
| **Climate & air quality** | No AQI layer by city/district |
| **Cost of living index** | NCPI exists monthly but not district-granular or visualized |

**Lankawa's moat:** trilingual, in-platform (no link-outs), provenance on every number, district-first navigation, dark civic UX.

---

## Ardeno Stack Integration Opportunities

In-platform modules (not external links) aligned with the SuvenSeo / Ardeno ecosystem:

| Module | Integration approach |
|--------|---------------------|
| **Octane (fuel)** | Embed fuel price cards + history sparklines on `/economy` and district pages; source via internal Octane API adapter |
| **PropertyLK** | District-level median land price bands as a "housing pulse" card; choropleth overlay mode on province maps |
| **lk-flood-api** | Already integrated; extend to push notifications tier on `/disaster` |
| **Shared auth (future)** | Single sign-on across Ardeno apps for saved districts / alerts — Phase 6+ |
| **Unified search** | Cross-index PropertyLK listings + Lankawa civic data in GlobalSearch (internal API only) |

All integrations must follow Lankawa rules: freshness tiers, `/sources/[id]` provenance, no external UI links.

---

## Phase 5 Recommendations

### P0 — High impact, builds on Phase 4

1. **Budget tracker module** — Seed FY2024/25 appropriation by ministry; filter by sector; link to district impact proxies
2. **Fuel price history** — Octane integration with 90-day sparkline on economy page (pattern from flood sparklines)
3. **Dengue weekly map** — Epidemiology Unit scrape/API; choropleth mode on district map
4. **Local services expansion** — Police stations, divisional hospitals, MOH offices; move from seed to ingest pipeline
5. **API v0.3** — Webhooks documentation, rate-limit headers, ETag support

### P1 — Differentiation

6. **MP scorecards** — Attendance + private member bills by electoral district
7. **Tender feed** — e-GP notices with district/province filters
8. **Compare mode** — Side-by-side district comparison (population, election swing, flood risk)
9. **Offline PWA** — Cache district profiles + GeoJSON for low-connectivity users
10. **Notification preferences** — Flood alert subscriptions (requires auth — defer Supabase to Phase 5 infra sprint)

### P2 — Platform

11. **Pradeshiya Sabha layer** — 340 local bodies on map
12. **Historical election explorer** — 2010, 2015, 2019, 2024 cycles
13. **Embeddable widgets** — `<lankawa-district slug="colombo">` for partners (still served from lankawa.vercel.app)
14. **Data export** — CSV/GeoJSON download from API with same provenance metadata

---

## Phase 6+ Vision

- Real-time ingest pipeline (Supabase + cron) once infra sprint is approved
- Citizen report layer (crowdsourced potholes, outages) moderated in-platform
- LLM civic assistant grounded only on Lankawa sources with citation cards
- Tamil/Sinhala voice search

---

*Last updated: Phase 4 completion, July 2026*
