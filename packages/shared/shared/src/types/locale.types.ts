/**
 * locale.types.ts - Locale Type Definitions
 * @package @vxture/shared
 *
 * Description: Shared locale-related types including LocaleType,
 * I18nConfig, I18nResource, and I18nState. Used across Core and Portal
 * layers for multi-language support.
 *
 * @author AI-Generated
 * @date 2026-03-13
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

import type { Locale } from '../constants/locale.constants';

/**
 * Supported locale type
 * @description 已废弃，请直接使用 Locale 类型
 * @deprecated 请使用从 @vxture/shared 导入的 Locale 类型
 */
export type LocaleType = Locale;

/**
 * Detailed language configuration
 * @description Describes a single language's complete configuration
 */
export interface LanguageConfig {
  locale: string;
  displayName: string;
  nativeName: string;
  icon: string;
  direction: 'ltr' | 'rtl';
  region: string;
  language: string;
  fallbackLocale: Locale;
  dateFormat: string;
  timeFormat: string;
}

/**
 * Single language configuration (simplified version)
 * @description Describes a single language's locale, display name, and optional icon
 */
export interface I18nConfig {
  locale: Locale;
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
  locale: Locale;
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
  setLocale: (locale: Locale) => void;
}
