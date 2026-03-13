/**
 * locale.constants.ts - Shared locale constants
 * @package @vxture/shared
 * @description Global configuration constants for language and localization, shared across all layers. Contains supported locales, default locale, and locale-to-BCP47 mappings.
 */

import type { Locale } from '../types/locale.types';

// =============================================================================
// 语言枚举定义
// =============================================================================

/**
 * 全平台支持的语言列表
 * @description 这是全平台唯一的语言定义
 */
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;


/**
 * 默认语言
 * @description 全平台统一的默认语言
 */
export const DEFAULT_LOCALE: Locale = 'zh';

// =============================================================================
// 语言映射常量
// =============================================================================

/** Locale 语言标签的映射 */
export const LOCALE_INTL_MAP: Record<Locale, string> = {
  'zh': 'zh-CN',
  'en': 'en-US',
} as const;

/** Locale 的默认货币，调用方未指定货币时使用 */
export const LOCALE_DEFAULT_CURRENCY: Record<Locale, string> = {
  'zh': 'CNY',
  'en': 'USD',
} as const;

// =============================================================================
// 国际化系统配置
// =============================================================================

/**
 * LOCALE 系统配置常量
 * @description 本地化系统的配置项
 */
export const LOCALE_CONSTANTS = {
  /** localStorage key */
  STORAGE_KEY: 'locale-storage',

  /** HTML lang attribute */
  HTML_LANG_ATTRIBUTE: 'lang',

  /** Meta tag selector for content-language */
  META_SELECTOR: 'meta[http-equiv="content-language"]',
} as const;
