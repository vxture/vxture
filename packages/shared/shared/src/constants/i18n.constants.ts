/**
 * i18nConfig.ts - Internationalization (i18n) Constants
 * @package @vxture/shared
 *
 * Description: Global i18n constants including storage keys, default language,
 * available locales, and DOM attribute configuration. Used across Core and
 * Portal layers for consistent multi-language support.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Constants
 *
 * @remarks
 * - No runtime logic
 * - Only configuration objects
 *
 * @example
 * ```ts
 * import { I18N_CONSTANTS } from '@vxture/shared';
 *
 * const defaultLocale = I18N_CONSTANTS.DEFAULT_LOCALE;
 * const availableLocales = I18N_CONSTANTS.AVAILABLE_LOCALES;
 * ```
 */

/**
 * i18n related constants
 * @description Global configuration constants for internationalization
 */
export const I18N_CONSTANTS = {
  /** localStorage key */
  STORAGE_KEY: 'locale-storage',

  /** HTML lang attribute */
  HTML_LANG_ATTRIBUTE: 'lang',

  /** Default locale */
  DEFAULT_LOCALE: 'zh-CN',

  /** Available locales */
  AVAILABLE_LOCALES: [
    { locale: 'zh-CN', displayName: '简体中文', icon: '🇨🇳' },
    { locale: 'en-US', displayName: 'English', icon: '🇺🇸' },
  ],

  /** Meta tag selector for content-language */
  META_SELECTOR: 'meta[http-equiv="content-language"]',
} as const;
