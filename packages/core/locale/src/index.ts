/**
 * index.ts - Vxture Core Localization/i18n Package
 * @package @vxture/core-locale
 *
 * Description: Platform localization and i18n package for Vxture, providing
 * locale management, translation utilities, and date/time formatting.
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Services - Locale
 */

// ============================================
// Locale Types
// ============================================

export type {
  LocaleConfig,
  TranslationDictionary,
  TranslateOptions,
  FormatOptions,
  NumberFormatOptions,
  DateFormatOptions,
} from './types';

// ============================================
// Locale Client
// ============================================

export * from './client';
export { LocaleManager, LocaleDetector } from './client';
export { getLocaleManager } from './client';

// ============================================
// Locale Utils
// ============================================

// TODO: 将来需要迁移的工具函数放这里

