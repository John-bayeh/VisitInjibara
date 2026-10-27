// ──────────────────────────────────────────────────────────
// src/types/destination.ts  — TypeScript Type Definitions
//
// LEARNING NOTE — What are types?
//   TypeScript types describe the "shape" of your data.
//   They are ONLY for the compiler — they disappear at runtime.
//
//   Think of it like a contract:
//   "Every Destination object MUST have these fields."
//   The compiler enforces this contract across your entire app.
//
//   Without types: you'd typo "lat" as "latitude" and only
//   find out when the map fails to render for a real user.
//   With types: your editor underlines the typo instantly.
//
// LEARNING NOTE — interface vs type alias:
//   Both define object shapes. We use `interface` here because
//   it's idiomatic for data models — it's extendable and reads
//   well in error messages.
// ──────────────────────────────────────────────────────────

/**
 * The valid category labels for a destination.
 * Using a union of string literals (not just `string`) means
 * TypeScript will error if you type "natuer" instead of "nature".
 */
export type DestinationCategory =
  | 'nature'
  | 'culture'
  | 'ecology'
  | 'viewpoint'
  | 'heritage'
  | 'community';

/**
 * Represents one destination/point-of-interest in Injibara.
 * Every record in src/data/nodes.json must match this shape.
 *
 * Field-by-field explanation:
 */
export interface Destination {
  /** Unique identifier (slug-style, e.g. "lake-zengena") */
  id: string;

  /** English display name */
  title: string;

  /** Name in Amharic or Awi language (unicode string) */
  local_name: string;

  /** Classification — determines marker color and graph grouping */
  category: DestinationCategory;

  /** English description shown in Detail Panel / Bottom Sheet */
  description: string;

  /** Natural, authentic Amharic description for Amharic UI */
  description_am?: string;

  /** High-quality curated landscape/cultural photo URL */
  image_url?: string;

  /** Geographic coordinates — latitude (north/south, -90 to +90) */
  lat: number;

  /** Geographic coordinates — longitude (east/west, -180 to +180) */
  lng: number;

  /** Elevation above sea level in metres */
  altitude_m: number;

  /** How to get there (e.g. "4WD required", "walking only") */
  vehicle: string;

  /** Amharic transport & vehicle guidance */
  vehicle_am?: string;

  /** Hazards or closures by season */
  seasonal_warnings: string;

  /** Amharic seasonal warning */
  seasonal_warnings_am?: string;

  /**
   * ISO 8601 date (YYYY-MM-DD) when the guide contact was last verified.
   * If null, the guide contact is considered unverified.
   */
  last_verified: string | null;

  /**
   * Guide's phone number in E.164 international format (+251...).
   * null or empty string means no guide contact available.
   */
  guide_phone: string | null;

  /**
   * Array of other Destination IDs this destination connects to
   * in the Relational Graph View.
   */
  connections: string[];
}

/**
 * The shape of the entire nodes.json file.
 * It's just an array of Destinations at the top level.
 */
export type NodesData = Destination[];

/**
 * Validation result returned by the data validator.
 */
export interface ValidationError {
  /** The destination record ID where the error was found */
  recordId: string;
  /** The field name that failed validation */
  field: string;
  /** Human-readable description of what's wrong */
  message: string;
}

/**
 * Contact action URLs generated from a Destination's guide_phone.
 */
export interface GuideContactActions {
  /** tel: URI for direct call */
  call: string;
  /** WhatsApp deep link with pre-filled message */
  whatsapp: string;
  /** Telegram deep link with pre-filled message */
  telegram: string;
}
