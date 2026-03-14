/**
 * locale.utils.ts - locale 工具
 * @package @vxture/core-locale
 * @description
 *   服务端 locale 解析与内容本地化工具
 */

import type { Locale } from '@vxture/shared';
import { DEFAULT_LOCALE } from '@vxture/shared';
import type { LocaleRequest } from '../types';
import { isSupportedLocale, normalizeLocale, parseCookieValue } from './locale-parser.utils';

export function resolveLocale(request: LocaleRequest): Locale {
  // 1. 已解析的 cookie 对象（Express/NestJS cookie-parser 提供）
  if (request.cookies) {
    const raw = request.cookies['NEXT_LOCALE'];
    if (raw && isSupportedLocale(raw)) return raw as Locale;
  }

  // 2. 原始 Cookie header 字符串兜底
  const cookieHeader = request.headers.get('cookie') ?? request.headers.get('Cookie');
  if (cookieHeader) {
    const raw = parseCookieValue(cookieHeader, 'NEXT_LOCALE');
    if (raw) {
      const normalized = normalizeLocale(raw);
      if (normalized) return normalized;
    }
  }

  // 3. Accept-Language header
  const acceptLanguage =
    request.headers.get('accept-language') ??
    request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const candidates = acceptLanguage
      .split(',')
      .flatMap((l) => {
        const part = l.split(';').at(0)?.trim();
        return part && part.length > 0 ? [part] : [];
      });

    for (const candidate of candidates) {
      const normalized = normalizeLocale(candidate);
      if (normalized) return normalized;
    }
  }

  // 4. 回退
  return DEFAULT_LOCALE;
}

// ============================================================================
// Service-side Content Localization
// ============================================================================

/**
 * 服务端内容本地化查找
 * @param content 多语言内容对象
 * @param locale 目标语言
 * @returns 本地化后的字符串
 *
 * 实现逻辑：
 * 1. 返回 content[locale]
 * 2. 如果目标语言不存在，回退到 content[DEFAULT_LOCALE]
 * 3. 如果 DEFAULT_LOCALE 也不存在，返回空字符串
 *
 * 使用场景：
 * - BFF 返回多语言内容字段时，按请求语言取值
 * - Service 层生成账单描述、通知文案等需要本地化的内容
 */
export function localizeContent(
  content: Partial<Record<Locale, string>>,
  locale: Locale
): string {
  // 1. 返回 content[locale]
  if (content[locale]) {
    return content[locale]!;
  }

  // 2. 如果目标语言不存在，回退到 content[DEFAULT_LOCALE]
  if (content[DEFAULT_LOCALE]) {
    return content[DEFAULT_LOCALE]!;
  }

  // 3. 如果 DEFAULT_LOCALE 也不存在，返回空字符串
  return '';
}

