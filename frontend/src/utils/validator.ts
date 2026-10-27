// ──────────────────────────────────────────────────────────
// src/utils/validator.ts  — Data Validator
//
// LEARNING NOTE — Why validate at all?
//   Our "database" is a JSON file edited by humans. Humans
//   make mistakes: wrong field names, missing required fields,
//   coordinates out of range, broken IDs in connections.
//
//   This validator runs at BUILD TIME (before Astro compiles)
//   to catch every such mistake. If it finds an error, the
//   build process stops and we fix the data — bad data never
//   reaches production.
//
// LEARNING NOTE — Pure functions:
//   validateNodes() takes data as input and returns errors.
//   It has NO SIDE EFFECTS — doesn't write files, doesn't
//   throw exceptions. This makes it easy to unit test.
//   We call it from scripts/validate.js (which does the
//   side effects: printing errors and exiting with code 1).
//
// LEARNING NOTE — TypeScript guards:
//   "typeof x === 'string'" is a TYPE GUARD — it narrows
//   the TypeScript type inside the if-block. This is how
//   we safely handle data that arrives as `unknown`.
// ──────────────────────────────────────────────────────────

import type { Destination, NodesData, ValidationError } from '../types/destination.ts';

// ISO 8601 date regex: matches YYYY-MM-DD
// Regex breakdown:
//   ^\d{4}  → starts with exactly 4 digits (year)
//   -       → literal hyphen
//   (0[1-9]|1[0-2])  → month 01-12
//   -       → literal hyphen
//   (0[1-9]|[12]\d|3[01])  → day 01-31
//   $       → end of string
const ISO_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// E.164 phone format: +{country code}{number}, 7-15 digits total
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

const VALID_CATEGORIES = new Set([
  'nature', 'culture', 'ecology', 'viewpoint', 'heritage', 'community',
]);

/**
 * Validates a raw, unknown value as a Destination record.
 * Returns an array of ValidationErrors (empty = valid).
 *
 * @param record - The raw record to validate
 * @param index  - Position in the array (for error messages before id is known)
 * @param allIds - Set of all IDs (for connection reference checking)
 */
function validateRecord(
  record: unknown,
  index: number,
  allIds: Set<string>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Type guard: record must be a plain object (not array, not null)
  if (typeof record !== 'object' || record === null || Array.isArray(record)) {
    return [{ recordId: `[index ${index}]`, field: 'root', message: 'Record must be a JSON object' }];
  }

  // Safe cast after type guard — we now know it's an object
  const r = record as Record<string, unknown>;

  // Helper: get the record ID for error messages (may be missing)
  const id = typeof r['id'] === 'string' ? r['id'] : `[index ${index}]`;

  // ── Required string fields ─────────────────────────────
  const requiredStrings: (keyof Destination)[] = [
    'id', 'title', 'local_name', 'category', 'description',
    'vehicle', 'seasonal_warnings',
  ];

  for (const field of requiredStrings) {
    if (typeof r[field] !== 'string' || (r[field] as string).trim() === '') {
      errors.push({ recordId: id, field, message: `"${field}" must be a non-empty string` });
    }
  }

  // ── Category validation ────────────────────────────────
  if (typeof r['category'] === 'string' && !VALID_CATEGORIES.has(r['category'])) {
    errors.push({
      recordId: id,
      field: 'category',
      message: `"category" must be one of: ${[...VALID_CATEGORIES].join(', ')}. Got: "${r['category']}"`,
    });
  }

  // ── Latitude: number in [-90, 90] ──────────────────────
  if (typeof r['lat'] !== 'number' || r['lat'] < -90 || r['lat'] > 90) {
    errors.push({ recordId: id, field: 'lat', message: '"lat" must be a number between -90 and 90' });
  }

  // ── Longitude: number in [-180, 180] ──────────────────
  if (typeof r['lng'] !== 'number' || r['lng'] < -180 || r['lng'] > 180) {
    errors.push({ recordId: id, field: 'lng', message: '"lng" must be a number between -180 and 180' });
  }

  // ── Altitude: non-negative number ──────────────────────
  if (typeof r['altitude_m'] !== 'number' || r['altitude_m'] < 0) {
    errors.push({ recordId: id, field: 'altitude_m', message: '"altitude_m" must be a non-negative number' });
  }

  // ── last_verified: null or ISO 8601 date ───────────────
  if (r['last_verified'] !== null) {
    if (typeof r['last_verified'] !== 'string' || !ISO_DATE_REGEX.test(r['last_verified'])) {
      errors.push({
        recordId: id,
        field: 'last_verified',
        message: '"last_verified" must be null or an ISO 8601 date (YYYY-MM-DD)',
      });
    }
  }

  // ── guide_phone: null, empty string, or valid E.164 ───
  const phone = r['guide_phone'];
  if (phone !== null && phone !== '') {
    if (typeof phone !== 'string' || !PHONE_REGEX.test(phone)) {
      errors.push({
        recordId: id,
        field: 'guide_phone',
        message: '"guide_phone" must be null, empty string, or a valid E.164 phone number (+countrycode...)',
      });
    }
  }

  // ── connections: array of strings ─────────────────────
  // Note: We can't validate connection targets here (we don't have
  // all IDs yet). That's done in the second pass in validateNodes().
  if (!Array.isArray(r['connections'])) {
    errors.push({ recordId: id, field: 'connections', message: '"connections" must be an array' });
  } else {
    (r['connections'] as unknown[]).forEach((conn, i) => {
      if (typeof conn !== 'string') {
        errors.push({
          recordId: id,
          field: `connections[${i}]`,
          message: `connections[${i}] must be a string ID`,
        });
      }
    });
  }

  // ── Connection target validation (second pass) ─────────
  // Only run if allIds is populated (second validation pass)
  if (allIds.size > 0 && Array.isArray(r['connections'])) {
    (r['connections'] as unknown[]).forEach((conn) => {
      if (typeof conn === 'string' && !allIds.has(conn)) {
        errors.push({
          recordId: id,
          field: 'connections',
          message: `Connection target "${conn}" does not exist as an id in nodes.json`,
        });
      }
    });
  }

  return errors;
}

/**
 * Validates the entire nodes dataset.
 * Runs two passes:
 *   Pass 1: validate individual record fields, collect all IDs
 *   Pass 2: validate connection references against collected IDs
 *
 * @param data - Raw parsed JSON (type unknown because we haven't validated yet)
 * @returns Array of all ValidationErrors found (empty = all valid)
 */
export function validateNodes(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  // Top-level check: must be an array
  if (!Array.isArray(data)) {
    return [{ recordId: 'root', field: 'root', message: 'nodes.json must be a JSON array' }];
  }

  // ── Pass 1: validate each record, collect IDs ─────────
  const seenIds = new Set<string>();
  const allIds = new Set<string>();

  // First, collect all IDs (empty set = skip connection target check)
  data.forEach((record) => {
    if (typeof record === 'object' && record !== null && 'id' in record) {
      const id = (record as Record<string, unknown>)['id'];
      if (typeof id === 'string') allIds.add(id);
    }
  });

  // Second, validate each record (including connection targets)
  data.forEach((record, index) => {
    const recordErrors = validateRecord(record, index, allIds);
    errors.push(...recordErrors);

    // Check for duplicate IDs
    if (typeof record === 'object' && record !== null && 'id' in record) {
      const id = (record as Record<string, unknown>)['id'];
      if (typeof id === 'string') {
        if (seenIds.has(id)) {
          errors.push({ recordId: id, field: 'id', message: `Duplicate id "${id}" found` });
        } else {
          seenIds.add(id);
        }
      }
    }
  });

  return errors;
}

/**
 * Type-safe accessor: validates and returns the nodes data.
 * Throws an Error (development only) if data is invalid.
 * Use this at the top of Astro pages to load destination data.
 */
export function getValidatedNodes(data: unknown): NodesData {
  const errors = validateNodes(data);
  if (errors.length > 0) {
    const messages = errors.map((e) => `  [${e.recordId}] ${e.field}: ${e.message}`).join('\n');
    throw new Error(`nodes.json validation failed:\n${messages}`);
  }
  return data as NodesData;
}
