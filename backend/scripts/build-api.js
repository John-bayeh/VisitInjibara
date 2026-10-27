#!/usr/bin/env node
// ──────────────────────────────────────────────────────────
// backend/scripts/build-api.js  — Static JSON API Generator
//
// LEARNING NOTE — What is a "static API"?
//   This project has no live server, but the frontend still
//   needs data. Instead of a REST API that responds at runtime,
//   we PRE-GENERATE JSON files at build time that act like
//   API endpoints. Vercel/Cloudflare serves them as static files.
//
//   Example output:
//     dist/api/destinations/index.json  → all destinations
//     dist/api/destinations/lake-zengena.json → one destination
//
//   The frontend fetches these just like a real API:
//     fetch('/api/destinations/index.json')
//
// LEARNING NOTE — Why generate these at all?
//   The frontend (Astro) can import nodes.json directly at
//   build time. But if you ever add a search feature, a
//   mobile app, or a third-party integration, they'll need
//   a standard JSON API. Building this now sets you up for that.
// ──────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Paths ─────────────────────────────────────────────────
const DATA_PATH   = join(__dirname, '..', 'src', 'data', 'nodes.json');
// Output goes into frontend/public/api/ so Astro copies it to dist/
const OUTPUT_ROOT = join(__dirname, '..', '..', 'frontend', 'public', 'api');

// ── Read validated data ────────────────────────────────────
let destinations;
try {
  destinations = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
} catch (err) {
  console.error('❌ Could not read nodes.json:', err.message);
  process.exit(1);
}

// ── Create output directories ──────────────────────────────
const destDir = join(OUTPUT_ROOT, 'destinations');
mkdirSync(destDir, { recursive: true });

// ── Write index.json (all destinations) ───────────────────
// Lightweight version — omit the long description to keep it small
const index = destinations.map((d) => ({
  id:       d.id,
  title:    d.title,
  local_name: d.local_name,
  category: d.category,
  lat:      d.lat,
  lng:      d.lng,
}));

writeFileSync(
  join(OUTPUT_ROOT, 'destinations', 'index.json'),
  JSON.stringify(index, null, 2),
  'utf-8'
);
console.log(`  ✔ /api/destinations/index.json  (${index.length} records)`);

// ── Write one JSON file per destination ───────────────────
for (const dest of destinations) {
  writeFileSync(
    join(destDir, `${dest.id}.json`),
    JSON.stringify(dest, null, 2),
    'utf-8'
  );
  console.log(`  ✔ /api/destinations/${dest.id}.json`);
}

console.log('\n✅ Static API build complete\n');
