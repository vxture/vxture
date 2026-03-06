/**
 * i18n.types.ts - Internationalization (i18n) Type Definitions
 * @package @vxture/shared
 *
 * Description: Shared internationalization-related types including LocaleType,
 * I18nConfig, I18nResource, and I18nState. Used across Core and Portal
 * layers for multi-language support.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Types
 *
 * @remarks
 * - No React/Next.js dependencies
 * - Framework-agnostic types
 *
 * @example
 * ```ts
 * import { type LocaleType, type I18nConfig } from '@vxture/shared';
 *
 * const locale: LocaleType = 'zh-CN';
 * const config: I18nConfig = {
 *   locale: 'en-US',
 *   displayName: 'English',
 *   icon: '🇺🇸'
 * };
 * ```
 */

// ============================================================================
// i18n Types
// ============================================================================

/**
 * Supported locale type
 * @description Constrains all valid locale strings
 */
export type LocaleType = 'zh-CN' | 'en-US' | string;

/**
 * Single language configuration
 * @description Describes a single language's locale, display name, and optional icon
 */
export interface I18nConfig {
  locale: LocaleType;
  displayName: string;
  icon?: string;
}

/**
 * Translation resource type (key-value structure)
 * @description Constrains all translation text key-value pairs
 */
export type I18nResource = Record<string, string>;

/**
 * Global i18n state type
 * @description Global i18n state for Zustand store usage
 */
export interface I18nState {
  locale: LocaleType;
  availableLocales: I18nConfig[];

  /**
   * Translation function
   * @param key - Translation key
   * @returns Translated text
   */
  t: (key: string) => string;

  /**
   * Set current locale
   * @param locale - Locale identifier
   */
  setLocale: (locale: LocaleType) => void;
}
