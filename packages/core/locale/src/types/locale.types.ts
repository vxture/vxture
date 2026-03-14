/**
 * locale.types.ts - 本地化类型
 * @package @vxture/core-locale
 * @description
 *   本地化类型定义
 */

import type { Locale } from '@vxture/shared';

export interface LocaleRequest {
  headers: {
    get(name: string): string | null | undefined;
  };
  cookies?: Record<string, string>;
}

/**
 * 服务端内容本地化配置
 * @description 用于配置服务端内容本地化的行为
 */
export interface LocalizationOptions {
  /** 是否启用严格模式（缺少翻译时抛出错误） */
  strict?: boolean;
  /** 默认回退语言 */
  fallbackLocale?: string;
  /** 是否记录翻译缺失日志 */
  logMissing?: boolean;
}

/**
 * 请求解析选项
 * @description 用于配置请求解析语言的行为
 */
export interface ResolveLocaleOptions {
  /** 是否忽略 Cookie */
  ignoreCookie?: boolean;
  /** 是否忽略 Accept-Language 头 */
  ignoreAcceptLanguage?: boolean;
  /** 是否使用备用的默认语言 */
  fallback?: Locale;
}
