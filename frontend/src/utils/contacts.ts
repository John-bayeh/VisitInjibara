// ──────────────────────────────────────────────────────────
// src/utils/contacts.ts  — Guide Contact URL Builders
//
// LEARNING NOTE — URL encoding:
//   When you put text into a URL (like a WhatsApp message),
//   spaces and special characters must be "encoded".
//   Space → %20, & → %26, etc.
//   encodeURIComponent() handles this automatically.
//
// LEARNING NOTE — Deep links:
//   Mobile apps register custom URL schemes:
//     tel:    → opens the Phone app
//     https://wa.me/...  → opens WhatsApp
//     https://t.me/...   → opens Telegram
//   These are NOT regular web URLs — they're inter-app links.
//
// LEARNING NOTE — Why separate this into its own file?
//   "Single Responsibility Principle" — each file/module
//   does one job. This file builds contact URLs. It can be
//   imported by both the Map Detail Panel and the Graph
//   Bottom Sheet without duplicating the logic.
//   It's also trivially testable in isolation.
// ──────────────────────────────────────────────────────────

import type { GuideContactActions } from '../types/destination.ts';

/**
 * Strips any non-digit characters from a phone number,
 * keeping the leading '+' for E.164 format.
 *
 * Example: "+251 91 234 5678" → "+251912345678"
 */
function normalizePhone(phone: string): string {
  // Keep the '+' prefix, strip spaces and dashes from the rest
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Builds the WhatsApp deep link.
 * Format: https://wa.me/{number}?text={encoded message}
 *
 * The phone number for WhatsApp must be digits only (no '+' or dashes).
 * WhatsApp's wa.me expects the number without '+'.
 */
function buildWhatsAppUrl(phone: string, destinationTitle: string): string {
  // Remove the '+' prefix for wa.me (it expects plain digits)
  const digits = normalizePhone(phone).replace('+', '');
  const message = encodeURIComponent(
    `Hello! I'm interested in visiting ${destinationTitle} and would like to arrange a guided tour. Can you help?`
  );
  return `https://wa.me/${digits}?text=${message}`;
}

/**
 * Builds the Telegram deep link.
 * Format: https://t.me/+{number}
 *
 * Note: Telegram phone links use t.me/+{number}.
 * This opens a chat with that phone number if they have Telegram.
 */
function buildTelegramUrl(phone: string, destinationTitle: string): string {
  const normalized = normalizePhone(phone);
  // Telegram uses the phone number as the identifier
  // The 'start' parameter pre-fills a message
  const message = encodeURIComponent(
    `Hi, I want to visit ${destinationTitle} and need a local guide.`
  );
  return `https://t.me/${normalized}?text=${message}`;
}

/**
 * Builds all three contact actions for a guide.
 *
 * @param phone - Verified guide phone in E.164 format (+251...)
 * @param destinationTitle - Used to pre-fill messages
 * @returns Object with call, whatsapp, and telegram URLs
 */
export function buildContactActions(
  phone: string,
  destinationTitle: string
): GuideContactActions {
  const normalized = normalizePhone(phone);
  return {
    // tel: URI — clicking this opens the phone dialer
    call: `tel:${normalized}`,
    whatsapp: buildWhatsAppUrl(normalized, destinationTitle),
    telegram: buildTelegramUrl(normalized, destinationTitle),
  };
}

/**
 * Determines if a destination has a verified guide contact.
 * Per requirements: guide_phone must be non-null/non-empty
 * AND last_verified must be present and non-null.
 */
export function hasVerifiedContact(
  guide_phone: string | null,
  last_verified: string | null
): boolean {
  return (
    guide_phone !== null &&
    guide_phone.trim() !== '' &&
    last_verified !== null &&
    last_verified.trim() !== ''
  );
}
