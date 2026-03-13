/**
 * locale.types.ts - 本地化类型定义
 * @package @vxture/core-locale
 *
 * Description: 服务端 locale 解析与内容本地化相关的类型定义。
 * 职责：服务端 locale 解析与内容本地化，框架无关，运行于 Node.js 环境。
 *
 * @author AI-Generated
 * @date 2026-03-13
 * @version 1.1
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Types
 *
 * @remarks
 * - 类型定义保持精简
 * - Locale 类型从 @vxture/shared 引入，不重复定义
 * - 此文件只包含 core-locale 包特有类型
 */

import type { Locale } from '@vxture/shared';

/**
 * 单个语言的完整配置，供 core-locale 内部及基础设施层使用
 */
export interface LanguageConfig {
  locale: Locale;
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
 * 翻译资源的键值结构
 */
export type TranslationResource = Record<string, string>;

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
  fallbackLocale?: string;
}
