/**
 * locale-parser.utils.ts - Language parsing utilities
 * @package @vxture/core-locale
 * @description
 *   Language parsing utility functions
 */

import type { Locale } from '@vxture/shared';
import { SUPPORTED_LOCALES } from '@vxture/shared';

// ============================================================================
// Accept-Language parsing
// ============================================================================

/**
 * Parses Accept-Language header string, returns language list sorted by q value
 *
 * @example
 * parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8')
 * // → ['zh-cn', 'zh', 'en']
 */
export function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((entry) => {
      const [lang, q] = entry.trim().split(';q=');
      return {
        lang:     lang?.trim().toLowerCase() ?? '',
        quality:  q ? parseFloat(q) : 1.0,
      };
    })
    .filter((e) => e.lang.length > 0)
    .sort((a, b) => b.quality - a.quality)
    .map((e) => e.lang);
}

// ============================================================================
// Language normalization
// ============================================================================

/**
 * Normalizes various language string formats to platform-supported Locale
 *
 * Supported input formats:
 * - 'zh' / 'zh-CN' / 'zh-Hans' / 'zh-TW'  → 'zh'
 * - 'en' / 'en-US' / 'en-GB'               → 'en'
 * - Other unknown languages                → undefined
 */
export function normalizeLocale(raw: string): Locale | undefined {
  const lower = raw.trim().toLowerCase();

  // Exact match: directly hit supported list
  if (isSupportedLocale(lower)) return lower as Locale;

  // Prefix match: take language primary tag (BCP 47 format "zh-CN" → "zh")
  const primary = lower.split('-')[0];
  if (primary && isSupportedLocale(primary)) return primary as Locale;

  return undefined;
}

// ============================================================================
// Type guard
// ============================================================================

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// ============================================================================
// Cookie parsing
// ============================================================================

/**
 * Extracts value for specified key from raw Cookie header string
 *
 * @example
 * parseCookieValue('NEXT_LOCALE=en; session=abc123', 'NEXT_LOCALE')
 * // → 'en'
 */
export function parseCookieValue(cookieHeader: string, key: string): string | undefined {
  const entry = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`));

  return entry?.split('=')[1];
}
