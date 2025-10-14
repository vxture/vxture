/**
 * locateConfig.ts - 语言相关全局配置常量
 * 统一管理多语言配置，供全局状态、组件等模块复用
 */

import { Locale } from '@/stores/i18nStore';

/**
 * I18N 全局配置常量
 * - defaultLocale 明确使用项目的 Locale 类型以保证跨文件一致性
 */
export const I18N_CONFIG: {
  htmlLangAttribute: string;
  metaSelector: string;
  storageKey: string;
  defaultLocale: Locale;
} = {
  htmlLangAttribute: 'lang', // HTML语言属性名
  metaSelector: 'meta[http-equiv="content-language"]', // 语言meta标签选择器
  storageKey: 'i18n-storage', // 国际化本地存储键名
  defaultLocale: 'zh-CN', // 默认语言，需与store初始值保持一致
};
