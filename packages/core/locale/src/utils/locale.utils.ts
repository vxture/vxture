/**
 * locale.utils.ts - 服务端 locale 解析与内容本地化工具
 * @package @vxture/core-locale
 *
 * Description: 服务端 locale 解析与内容本地化工具。
 * 职责：服务端 locale 解析与内容本地化，框架无关，运行于 Node.js 环境。
 *
 * @author AI-Generated
 * @date 2026-03-13
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Utils
 *
 * @remarks
 * - request 类型为标准 Web API 的 Request，不绑定 NestJS 或 Express 的特定类型
 * - Locale 类型从 @vxture/shared 引入，不重复定义
 * - 此函数仅在服务端调用（bff、services、agent-server）
 * - 禁止在前端代码中调用此函数
 *
 * @example
 * ```ts
 * // bff/_ 或 agent-server/_ 或 services/* 内部
 * import { resolveLocale, localizeContent } from '@vxture/core-locale';
 *
 * const locale = resolveLocale(request);
 *
 * const description = localizeContent(
 *   { zh: '专业版订阅', en: 'Pro Subscription' },
 *   locale
 * );
 * ```
 */

import type { Locale } from '@vxture/shared';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@vxture/shared';

// ============================================================================
// Service-side Locale Resolution
// ============================================================================

/**
 * 从请求解析语言
 * @param request 标准 Web API 的 Request 对象
 * @returns 解析出的语言
 *
 * 实现逻辑（按优先级顺序）：
 * 1. 读取请求 Cookie 中的 NEXT_LOCALE 字段
 * 2. 解析 Accept-Language Header，匹配 SUPPORTED_LOCALES
 * 3. 查询租户级语言配置（如果租户有独立语言设置）
 * 4. 回退到 DEFAULT_LOCALE
 */
export function resolveLocale(request: Request): Locale {
  // 1. 读取请求 Cookie 中的 NEXT_LOCALE 字段
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const nextLocale = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('NEXT_LOCALE='))
      ?.split('=')[1];

    if (nextLocale && isValidSupportedLocale(nextLocale)) {
      return nextLocale as Locale;
    }
  }

  // 2. 解析 Accept-Language Header，匹配 SUPPORTED_LOCALES
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const locales = acceptLanguage
      .split(',')
      .map((l) => l.split(';')[0].trim())
      .filter((l) => l.length > 0);

    for (const locale of locales) {
      const normalizedLocale = normalizeLocale(locale);
      if (isValidSupportedLocale(normalizedLocale)) {
        return normalizedLocale as Locale;
      }
    }
  }

  // 3. 查询租户级语言配置（如果租户有独立语言设置）
  // 注意：这里暂时未实现，后续可以扩展

  // 4. 回退到 DEFAULT_LOCALE
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 检查语言是否在支持列表中
 */
function isValidSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * 标准化语言字符串
 */
function normalizeLocale(locale: string): string {
  const normalized = locale.trim().toLowerCase();

  // 处理常见的语言格式变体
  const variations: Record<string, string> = {
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-hans': 'zh',
    'chinese': 'zh',

    'en': 'en',
    'en-us': 'en',
    'en-gb': 'en',
    'english': 'en',
  };

  return variations[normalized] || locale;
}
