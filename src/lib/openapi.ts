export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Lankawa Public API",
    version: "0.4.0",
    description:
      "Public civic intelligence API for Sri Lanka. Every metric includes source provenance and freshness tiers.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Source health and freshness",
        responses: { "200": { description: "Health snapshot" } },
      },
    },
    "/pulse": {
      get: {
        summary: "Live pulse metrics",
        responses: { "200": { description: "Pulse snapshot" } },
      },
    },
    "/districts": {
      get: {
        summary: "List all districts",
        responses: { "200": { description: "District list" } },
      },
    },
    "/districts/{slug}": {
      get: {
        summary: "Get district by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "District profile" },
          "404": { description: "Not found" },
        },
      },
    },
    "/provinces": {
      get: {
        summary: "List all provinces",
        responses: { "200": { description: "Province list" } },
      },
    },
    "/provinces/{slug}": {
      get: {
        summary: "Get province by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Province profile with districts" },
          "404": { description: "Not found" },
        },
      },
    },
    "/elections": {
      get: {
        summary: "Presidential election 2024 summary",
        responses: { "200": { description: "Election data snapshot" } },
      },
    },
    "/elections/parliamentary": {
      get: {
        summary: "Parliamentary election 2024 summary",
        responses: { "200": { description: "Parliamentary election snapshot" } },
      },
    },
    "/elections/parliamentary/{slug}": {
      get: {
        summary: "Parliamentary district seats",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Electoral district result" },
          "404": { description: "Not found" },
        },
      },
    },
    "/services": {
      get: {
        summary: "Public services directory",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["hospital", "school", "gn_office"] },
          },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Filtered facilities list" } },
      },
    },
    "/services/{id}": {
      get: {
        summary: "Single public service facility",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Facility detail" },
          "404": { description: "Not found" },
        },
      },
    },
    "/flood/history": {
      get: {
        summary: "Flood station level history",
        parameters: [
          { name: "station", in: "query", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 24 } },
        ],
        responses: { "200": { description: "Historical water levels with freshness tier" } },
      },
    },
    "/fuel/history": {
      get: {
        summary: "CPC fuel price history",
        parameters: [
          { name: "days", in: "query", schema: { type: "integer", default: 90 } },
        ],
        responses: { "200": { description: "Petrol 92 and auto diesel price series" } },
      },
    },
    "/budget": {
      get: {
        summary: "National budget snapshot",
        responses: { "200": { description: "FY 2024/25 and 2025/26 budget seed data" } },
      },
    },
    "/health/dengue": {
      get: {
        summary: "Weekly dengue statistics",
        responses: { "200": { description: "District-level dengue case counts (seed)" } },
      },
    },
    "/property": {
      get: {
        summary: "District property price bands",
        responses: { "200": { description: "Median land price bands by district" } },
      },
    },
    "/elections/history": {
      get: {
        summary: "Multi-cycle election history",
        responses: { "200": { description: "Presidential 2010–2024 and parliamentary summaries" } },
      },
    },
    "/local-government": {
      get: {
        summary: "Local government directory",
        parameters: [
          { name: "district", in: "query", schema: { type: "string" } },
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["MC", "UC", "PS"] },
          },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Filtered local bodies list" } },
      },
    },
  },
} as const;

export const apiEndpoints = [
  {
    method: "GET",
    path: "/api/v1/health",
    summaryKey: "healthSummary" as const,
    descriptionKey: "healthDescription" as const,
    example: `{ "generatedAt": "2026-07-19T06:00:00.000Z", "sources": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/pulse",
    summaryKey: "pulseSummary" as const,
    descriptionKey: "pulseDescription" as const,
    example: `{ "generatedAt": "...", "metrics": [...], "flood": [...], "sources": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/districts",
    summaryKey: "districtsSummary" as const,
    descriptionKey: "districtsDescription" as const,
    example: `{ "districts": [{ "slug": "colombo", "name": "Colombo", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/districts/{slug}",
    summaryKey: "districtSummary" as const,
    descriptionKey: "districtDescription" as const,
    example: `{ "slug": "colombo", "name": "Colombo", "population": 2427285, ... }`,
  },
  {
    method: "GET",
    path: "/api/v1/provinces",
    summaryKey: "provincesSummary" as const,
    descriptionKey: "provincesDescription" as const,
    example: `{ "count": 9, "provinces": [{ "slug": "western", "name": "Western", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/provinces/{slug}",
    summaryKey: "provinceSummary" as const,
    descriptionKey: "provinceDescription" as const,
    example: `{ "slug": "western", "districtCount": 3, "population": 5846400, ... }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections",
    summaryKey: "electionsSummary" as const,
    descriptionKey: "electionsDescription" as const,
    example: `{ "election": { "id": "presidential-2024", ... }, "districts": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections/parliamentary",
    summaryKey: "parliamentarySummary" as const,
    descriptionKey: "parliamentaryDescription" as const,
    example: `{ "election": { "id": "parliamentary-2024", ... }, "districts": [...] }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections/parliamentary/{slug}",
    summaryKey: "parliamentaryDistrictSummary" as const,
    descriptionKey: "parliamentaryDistrictDescription" as const,
    example: `{ "slug": "colombo", "totalSeats": 18, "seats": { "npp": 14, ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/services?district=colombo&type=hospital",
    summaryKey: "servicesSummary" as const,
    descriptionKey: "servicesDescription" as const,
    example: `{ "count": 2, "facilities": [{ "id": "colombo-national-hospital", ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/services/{id}",
    summaryKey: "serviceSummary" as const,
    descriptionKey: "serviceDescription" as const,
    example: `{ "id": "colombo-national-hospital", "type": "hospital", ... }`,
  },
  {
    method: "GET",
    path: "/api/v1/flood/history?station=Peradeniya&limit=24",
    summaryKey: "floodHistorySummary" as const,
    descriptionKey: "floodHistoryDescription" as const,
    example: `{ "points": [{ "timestamp": "...", "waterLevel": 1.39 }], "tier": "fresh" }`,
  },
  {
    method: "GET",
    path: "/api/v1/fuel/history?days=90",
    summaryKey: "fuelHistorySummary" as const,
    descriptionKey: "fuelHistoryDescription" as const,
    example: `{ "days": 90, "series": [{ "fuelType": "petrol_92", "points": [...] }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/budget",
    summaryKey: "budgetSummary" as const,
    descriptionKey: "budgetDescription" as const,
    example: `{ "fiscalYears": [{ "id": "fy2025-26", "revenue": 4580, ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/health/dengue",
    summaryKey: "dengueSummary" as const,
    descriptionKey: "dengueDescription" as const,
    example: `{ "nationalTotal": 3842, "districts": [{ "slug": "colombo", "cases": 612 }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/property",
    summaryKey: "propertySummary" as const,
    descriptionKey: "propertyDescription" as const,
    example: `{ "districts": [{ "slug": "colombo", "medianPerPerch": 9500000, ... }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/elections/history",
    summaryKey: "electionHistorySummary" as const,
    descriptionKey: "electionHistoryDescription" as const,
    example: `{ "presidential": { "cycles": [{ "year": 2024, ... }] }, "parliamentary": { ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/local-government?district=colombo&type=MC",
    summaryKey: "localGovernmentSummary" as const,
    descriptionKey: "localGovernmentDescription" as const,
    example: `{ "totalCount": 327, "count": 1, "bodies": [{ "id": "...", "type": "MC" }] }`,
  },
  {
    method: "GET",
    path: "/api/v1/openapi.json",
    summaryKey: "openApiSummary" as const,
    descriptionKey: "openApiDescription" as const,
    example: `{ "openapi": "3.1.0", "info": { ... }, "paths": { ... } }`,
  },
] as const;
