#!/usr/bin/env node
/**
 * Simplifies districts.geojson by reducing coordinate precision and decimating
 * ring vertices. Target: <150KB while preserving district topology.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "../public/geo/districts.geojson");
const outputPath = inputPath;

const PRECISION = 4;
const MIN_VERTEX_DISTANCE = 0.008;

function roundCoord(value) {
  const factor = 10 ** PRECISION;
  return Math.round(value * factor) / factor;
}

function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function simplifyRing(ring) {
  if (ring.length <= 4) {
    return ring.map(([lng, lat]) => [roundCoord(lng), roundCoord(lat)]);
  }

  const simplified = [ring[0]];
  for (let i = 1; i < ring.length - 1; i += 1) {
    const prev = simplified[simplified.length - 1];
    const current = ring[i];
    if (distance(prev, current) >= MIN_VERTEX_DISTANCE) {
      simplified.push(current);
    }
  }
  simplified.push(ring[ring.length - 1]);

  return simplified.map(([lng, lat]) => [roundCoord(lng), roundCoord(lat)]);
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring)),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring)),
      ),
    };
  }
  return geometry;
}

const raw = readFileSync(inputPath, "utf8");
const geojson = JSON.parse(raw);

for (const feature of geojson.features) {
  feature.geometry = simplifyGeometry(feature.geometry);
}

const output = JSON.stringify(geojson);
writeFileSync(outputPath, output);

const before = raw.length;
const after = output.length;
console.log(
  `GeoJSON: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB (${((1 - after / before) * 100).toFixed(1)}% reduction)`,
);
