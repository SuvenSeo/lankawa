# Lankawa Roadmap

Phase 6 shipped July 2026. This document captures research from Phase 4–6 development and recommendations for Phase 7+.

## Phase 6 Delivered

| Feature | Status |
|---------|--------|
| Property / Housing pulse | ✅ `/property` with district median price bands, choropleth map, home pulse card |
| Historical election explorer | ✅ `/elections/history` with 2010, 2015, 2019, 2024 presidential tabs + swing charts |
| Pradeshiya Sabha layer | ✅ `/local-government` searchable directory (327 seed bodies) |
| Dengue choropleth | ✅ Table/map toggle on `/health` with district case bands |
| API v0.4 | ✅ `/property`, `/elections/history`, `/local-government` + OpenAPI update |
| Global search expansion | ✅ Property and local government entries indexed |
| Nav & cross-links | ✅ Property nav, district/province/elections links |

## Phase 5 Delivered

| Feature | Status |
|---------|--------|
| Fuel price history | ✅ Octane API integration, 90-day sparkline on `/economy` |
| Budget tracker (MVP) | ✅ `/budget` with FY 2024/25 & 2025/26 seed data |
| Dengue / health pulse | ✅ `/health` with district table, links from district pages |
| API v0.3 | ✅ `/budget`, `/health/dengue`, `/fuel/history` + ETag/Cache-Control |
| District compare mode | ✅ `/compare?districts=colombo,kandy` side-by-side metrics |
| MP scorecards (seed) | ✅ `/civic` with sample attendance & bills data |
| Tender feed (seed) | ✅ `/tenders` with search/filter |
| PWA manifest | ✅ `manifest.json`, icons, minimal offline SW for districts |

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
6. **Budget tracker:** FY 2024/25 and 2025/26 figures are rounded seed data aligned with budget speech totals and Verité Research sector summaries — not digitized appropriation ledgers. Ministry-level splits are illustrative.
7. **Dengue stats:** Weekly district counts are representative seed data patterned on Epidemiology Unit report formats — not live scraped surveillance. Do not use for clinical or outbreak response decisions.
8. **MP scorecards:** Illustrative sample members inspired by Manthri.lk patterns — not scraped from Manthri or official Hansard. Real names and records require ingest pipeline.
9. **Tender feed:** Static seed notices modeled on e-GP publication formats — not live procurement data from the e-GP portal.
10. **Fuel history:** Sourced from Octane partner API with Next.js revalidate caching; falls back to static series when upstream is unavailable.
11. **Property prices:** District median land price bands are representative seed data aligned with PropertyLK patterns. Server-side adapter attempts live fetch from the partner API; falls back to seed when unavailable. Not a property valuation service.
12. **Historical elections (2010, 2015):** District-level presidential results are seeded approximations aligned with published national totals — not digitized official district ledgers.
13. **Local government directory:** 327 seed bodies (MC, UC, PS) covering major councils and Pradeshiya Sabhas per district — not an exhaustive official gazette list of 340+ bodies.

---

## Gap Analysis: What Sri Lankan Civic Platforms Are Missing

Research across existing portals (Election Commission, CBSL, Disaster Management Centre, Ministry websites, Verité Research, Manthri.lk, etc.) reveals persistent gaps Lankawa could own:

| Gap | Opportunity for Lankawa |
|-----|---------------------------|
| **Unified district key** | Most portals use inconsistent geography; Lankawa's 25-district atlas is already the right abstraction |
| **Budget & expenditure tracker** | Phase 5 MVP shipped — extend with provincial budgets and year-over-year charts |
| **Government tenders (Procurement)** | Phase 5 seed feed shipped — integrate live e-GP in Phase 7 |
| **MP attendance & voting** | Phase 5 seed scorecards shipped — full Hansard ingest in Phase 7 |
| **Dengue & disease maps** | Phase 6 choropleth shipped — live Epidemiology Unit ingest in Phase 7 |
| **Fuel price history** | ✅ Phase 5 — extend to district-level transport cost proxies |
| **Bus & rail connectivity** | No open GTFS for Sri Lanka; static route maps per district would help |
| **Court case backlog / HRCSL** | Human rights and judicial metrics are PDF-only |
| **Local government (Pradeshiya Sabha)** | ✅ Phase 6 directory shipped — extend to councillor records |
| **Climate & air quality** | No AQI layer by city/district |
| **Cost of living index** | NCPI exists monthly but not district-granular or visualized |
| **Property / housing pulse** | ✅ Phase 6 PropertyLK-style module shipped |

**Lankawa's moat:** trilingual, in-platform (no link-outs), provenance on every number, district-first navigation, dark civic UX.

---

## Ardeno Stack Integration Opportunities

In-platform modules (not external links) aligned with the SuvenSeo / Ardeno ecosystem:

| Module | Integration approach |
|--------|---------------------|
| **Octane (fuel)** | ✅ Phase 5 — fuel history sparklines on `/economy`; extend to district transport cards |
| **PropertyLK** | ✅ Phase 6 — district median land price bands + choropleth on `/property` |
| **lk-flood-api** | Already integrated; extend to push notifications tier on `/disaster` |
| **Shared auth (future)** | Single sign-on across Ardeno apps for saved districts / alerts — Phase 7+ |
| **Unified search** | ✅ Phase 6 — property + local government indexed in GlobalSearch |

All integrations must follow Lankawa rules: freshness tiers, `/sources/[id]` provenance, no external UI links.

---

## Phase 7 Recommendations

### P0 — Infrastructure & live data

1. **Real-time ingest pipeline** — Supabase + cron for budget, tenders, MP records, dengue, property
2. **Live dengue ingest** — Replace seed with Epidemiology Unit weekly scrape/API
3. **Live PropertyLK adapter** — Wire partner API when production endpoint is stable
4. **Live e-GP tenders** — Replace seed tender feed with procurement portal ingest

### P1 — Differentiation

5. **Local services expansion** — Police stations, divisional hospitals, MOH offices
6. **Notification preferences** — Flood alert subscriptions (requires auth — Supabase)
7. **Offline PWA expansion** — Cache full district profiles + election data offline
8. **API webhooks docs** — Rate-limit headers, webhook documentation for partners
9. **Bus & rail static maps** — Per-district connectivity cards (no GTFS available)
10. **Full Hansard MP ingest** — Replace seed scorecards with real attendance records

### P2 — Platform

11. **Embeddable widgets** — `<lankawa-district slug="colombo">` for partners (still served from lankawa.vercel.app)
12. **Data export** — CSV/GeoJSON download from API with same provenance metadata
13. **LLM civic assistant** — Grounded only on Lankawa sources with citation cards
14. **Tamil/Sinhala voice search**

---

## Phase 7+ Vision

- Citizen report layer (crowdsourced potholes, outages) moderated in-platform
- Court backlog & HRCSL metrics from PDF extraction pipeline
- Climate & AQI layer by city/district
- District-granular cost of living index from NCPI proxies
- Local government councillor records and meeting minutes

---

*Last updated: Phase 6 completion, July 2026*
