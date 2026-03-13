/**
 * i18n.constants.ts - Vxture 国际化常量
 * @package @vxture/shared
 *
 * Description: 全平台国际化常量定义。包含语言枚举、默认语言、
 * 系统配置等所有国际化相关的常量。
 *
 * @remarks
 * - 这是全平台唯一的国际化常量定义
 * - 语言枚举和配置常量放在同一文件，方便使用
 * - 所有包统一从 @vxture/shared 引入
 *
 * @example
 * ```ts
 * import {
 *   SUPPORTED_LOCALES,
 *   type Locale,
 *   DEFAULT_LOCALE,
 *   LOCALE_CONSTANTS
 * } from '@vxture/shared';
 *
 * const locale: Locale = 'zh';
 * const storageKey = LOCALE_CONSTANTS.STORAGE_KEY;
 * ```
 */

// ============================================================================
// 语言枚举定义
// ============================================================================

/**
 * 全平台支持的语言列表
 * @description 这是全平台唯一的语言定义
 */
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

/**
 * Locale 类型
 * @description 全平台唯一的语言类型定义
 */
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * 默认语言
 * @description 全平台统一的默认语言
 */
export const DEFAULT_LOCALE: Locale = 'zh';

// ============================================================================
// 国际化系统配置
// ============================================================================

/**
 * i18n 系统配置常量
 * @description 国际化系统的配置项
 */
export const LOCALE_CONSTANTS = {
  /** localStorage key */
  STORAGE_KEY: 'locale-storage',

  /** HTML lang attribute */
  HTML_LANG_ATTRIBUTE: 'lang',

  /** Meta tag selector for content-language */
  META_SELECTOR: 'meta[http-equiv="content-language"]',
} as const;
