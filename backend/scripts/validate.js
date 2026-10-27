#!/usr/bin/env node
// ──────────────────────────────────────────────────────────
// scripts/validate.js  — Build-time Data Validation Script
//
// LEARNING NOTE — Why .js not .ts?
//   This script runs in Node.js BEFORE the TypeScript compiler
//   runs. Node.js can't execute .ts files natively. So we keep
//   this as a plain .js file using ES Modules (import/export).
//
//   But notice: it imports from our .ts file! How?
//   → Because Astro's build process uses Vite which uses esbuild
//     to handle .ts files at runtime during dev/build.
//   → During plain `node scripts/validate.js`, we use a workaround
//     by reading the JSON directly and running validation logic
//     inline (no TS import needed for the script runner).
//
// LEARNING NOTE — process.exit():
//   Node.js scripts communicate success/failure through exit codes:
//     exit(0) = success (CI/CD considers the build successful)
//     exit(1) = failure (CI/CD fails the build pipeline)
//   This is how our validator "halts the build" on errors.
//
// LEARNING NOTE — import assertions:
//   `with { type: 'json' }` tells Node.js this is a JSON import.
//   This is part of the ES Modules specification for importing
//   non-JS files.
// ──────────────────────────────────────────────────────────

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// __filename and __dirname don't exist in ES Modules.
// We reconstruct them from import.meta.url.
// import.meta.url is the URL of this file, e.g. file:///home/.../validate.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Read the JSON data file ────────────────────────────
const dataPath = join(__dirname, '..', 'src', 'data', 'nodes.json');
let rawData;

try {
  const fileContent = readFileSync(dataPath, 'utf-8');
  rawData = JSON.parse(fileContent);
} catch (err) {
  console.error('❌ Failed to read or parse src/data/nodes.json:');
  console.error(err.message);
  process.exit(1);
}

// ── Inline validation (mirrors src/utils/validator.ts) ──
// We duplicate the core logic here to avoid needing a TS
// transpiler for this pre-build script.

const ISO_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;
const VALID_CATEGORIES = new Set([
  'nature', 'culture', 'ecology', 'viewpoint', 'heritage', 'community',
]);

const errors = [];

if (!Array.isArray(rawData)) {
  errors.push('nodes.json must be a JSON array at the top level');
} else {
  // Collect all IDs first (for connection reference validation)
  const allIds = new Set(rawData.map((r) => r?.id).filter(Boolean));
  const seenIds = new Set();

  rawData.forEach((record, index) => {
    const id = record?.id ?? `[index ${index}]`;
    const addError = (field, message) => errors.push({ recordId: id, field, message });

    // Required string fields
    ['id', 'title', 'local_name', 'category', 'description', 'vehicle', 'seasonal_warnings'].forEach((field) => {
      if (typeof record[field] !== 'string' || record[field].trim() === '') {
        addError(field, `"${field}" must be a non-empty string`);
      }
    });

    // Category
    if (typeof record.category === 'string' && !VALID_CATEGORIES.has(record.category)) {
      addError('category', `"category" must be one of: ${[...VALID_CATEGORIES].join(', ')}`);
    }

    // Lat/Lng
    if (typeof record.lat !== 'number' || record.lat < -90 || record.lat > 90) {
      addError('lat', '"lat" must be a number between -90 and 90');
    }
    if (typeof record.lng !== 'number' || record.lng < -180 || record.lng > 180) {
      addError('lng', '"lng" must be a number between -180 and 180');
    }

    // Altitude
    if (typeof record.altitude_m !== 'number' || record.altitude_m < 0) {
      addError('altitude_m', '"altitude_m" must be a non-negative number');
    }

    // last_verified
    if (record.last_verified !== null) {
      if (typeof record.last_verified !== 'string' || !ISO_DATE_REGEX.test(record.last_verified)) {
        addError('last_verified', '"last_verified" must be null or YYYY-MM-DD');
      }
    }

    // guide_phone
    if (record.guide_phone !== null && record.guide_phone !== '') {
      if (typeof record.guide_phone !== 'string' || !PHONE_REGEX.test(record.guide_phone)) {
        addError('guide_phone', '"guide_phone" must be null, empty, or E.164 format (+countrycode...)');
      }
    }

    // Duplicate ID check
    if (typeof record.id === 'string') {
      if (seenIds.has(record.id)) {
        addError('id', `Duplicate id "${record.id}"`);
      }
      seenIds.add(record.id);
    }

    // Connections
    if (!Array.isArray(record.connections)) {
      addError('connections', '"connections" must be an array');
    } else {
      record.connections.forEach((conn, i) => {
        if (typeof conn !== 'string') {
          addError(`connections[${i}]`, 'Each connection must be a string ID');
        } else if (!allIds.has(conn)) {
          addError('connections', `Connection target "${conn}" does not exist in nodes.json`);
        }
      });
    }
  });
}

// ── Report results ─────────────────────────────────────
if (errors.length > 0) {
  console.error('\n❌ Data validation FAILED — build halted\n');
  errors.forEach((e) => {
    if (typeof e === 'string') {
      console.error(`  • ${e}`);
    } else {
      console.error(`  • [${e.recordId}] ${e.field}: ${e.message}`);
    }
  });
  console.error(`\n${errors.length} error(s) found in src/data/nodes.json\n`);
  process.exit(1); // Non-zero exit code = build failure
} else {
  const count = Array.isArray(rawData) ? rawData.length : 0;
  console.log(`✅ Data validation passed — ${count} destination(s) valid\n`);
  process.exit(0);
}
