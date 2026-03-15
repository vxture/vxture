/**
 * locale.types.ts - Localization types
 * @package @vxture/core-locale
 * @description
 *   Localization type definitions
 *
 * @author AI-Generated
 * @date 2026-03-15
 */

import type { Locale } from '@vxture/shared';

export interface LocaleRequest {
  headers: {
    get(name: string): string | null | undefined;
  };
  cookies?: Record<string, string>;
}

/**
 * Server-side content localization configuration
 * @description Configures server-side content localization behavior
 */
export interface LocalizationOptions {
  /** Whether to enable strict mode (throw error when missing translation) */
  strict?: boolean;
  /** Default fallback language */
  fallbackLocale?: string;
  /** Whether to log missing translations */
  logMissing?: boolean;
}

/**
 * Request resolution options
 * @description Configures request language resolution behavior
 */
export interface ResolveLocaleOptions {
  /** Whether to ignore Cookie */
  ignoreCookie?: boolean;
  /** Whether to ignore Accept-Language header */
  ignoreAcceptLanguage?: boolean;
  /** Whether to use an alternative default language */
  fallback?: Locale;
}
