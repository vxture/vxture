/**
 * locale-parser.utils.ts - 语言解析工具
 * @package @vxture/core-locale
 * @description
 *   语言解析工具函数
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@vxture/shared';
import type { Locale } from '@vxture/shared';

// ============================================================================
// Accept-Language 解析
// ============================================================================

/**
 * 解析 Accept-Language header 字符串，返回按 q 值排序的语言列表
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
// 语言标准化
// ============================================================================

/**
 * 将各种格式的语言字符串标准化为平台支持的 Locale
 *
 * 支持的输入格式：
 * - 'zh' / 'zh-CN' / 'zh-Hans' / 'zh-TW'  → 'zh'
 * - 'en' / 'en-US' / 'en-GB'               → 'en'
 * - 其他未知语言                            → undefined
 */
export function normalizeLocale(raw: string): Locale | undefined {
  const lower = raw.trim().toLowerCase();

  // 精确匹配：直接命中支持列表
  if (isSupportedLocale(lower)) return lower as Locale;

  // 前缀匹配：取语言主标签（BCP 47 格式 "zh-CN" → "zh"）
  const primary = lower.split('-')[0];
  if (primary && isSupportedLocale(primary)) return primary as Locale;

  return undefined;
}

// ============================================================================
// 类型守卫
// ============================================================================

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

// ============================================================================
// Cookie 解析
// ============================================================================

/**
 * 从原始 Cookie header 字符串中提取指定 key 的值
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

// ============================================================================
// 默认导出
// ============================================================================

export { DEFAULT_LOCALE };