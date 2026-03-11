/**
 * locale.types.ts - 本地化类型定义
 * @package @vxture/core-locale
 *
 * Description: Core locale types and constants
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types - Locale
 */

// ============================================================================
// Locale Types
// ============================================================================

export interface LocaleConfig {
  currentLocale: string;
  availableLocales: string[];
  fallbackLocale: string;
  enablePluralization?: boolean;
  enableDateTimeFormatting?: boolean;
  enableNumberFormatting?: boolean;
}

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface TranslateOptions {
  defaultValue?: string;
  variables?: Record<string, string | number | null | undefined>;
  count?: number;
  pluralForms?: string[];
}

export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  options?: Intl.NumberFormatOptions;
}

export interface FormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  weekday?: 'narrow' | 'short' | 'long';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  options?: Intl.DateTimeFormatOptions;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_LOCALE_CONFIG: LocaleConfig = {
  currentLocale: 'en-US',
  availableLocales: ['en-US', 'zh-CN', 'ja-JP'],
  fallbackLocale: 'en-US',
  enablePluralization: true,
  enableDateTimeFormatting: true,
  enableNumberFormatting: true,
};
