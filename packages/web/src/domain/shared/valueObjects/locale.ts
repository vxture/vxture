/**
 * locale.ts - 语言代码值对象
 *
 * Domain Layer - Shared Value Objects
 *
 * 职责：
 * - 定义语言代码的类型和验证规则
 * - 提供语言相关的纯函数
 *
 * @layer Domain
 * @category Shared - Value Objects
 */

/**
 * 支持的语言代码类型
 */
export type LocaleCode = 'zh-CN' | 'en-US';

/**
 * 语言代码值对象接口
 */
export interface Locale {
  readonly value: LocaleCode;
}

/**
 * 语言配置
 */
export interface LocaleConfig {
  readonly supportedLocales: readonly LocaleCode[];
  readonly defaultLocale: LocaleCode;
}

/**
 * 默认语言配置
 */
export const DEFAULT_LOCALE_CONFIG: LocaleConfig = {
  supportedLocales: ['zh-CN', 'en-US'],
  defaultLocale: 'zh-CN',
};

/**
 * 语言相关的纯函数
 */
export const LocaleHelpers = {
  /**
   * 创建 Locale 实例
   */
  create: (value: string, config: LocaleConfig = DEFAULT_LOCALE_CONFIG): Locale => {
    const normalized = LocaleHelpers.normalize(value);
    const isValid = LocaleHelpers.isSupported(normalized, config);

    return {
      value: isValid ? (normalized as LocaleCode) : config.defaultLocale,
    };
  },

  /**
   * 标准化语言代码
   */
  normalize: (locale: string): string => {
    const [lang, region] = locale.toLowerCase().split('-');
    if (region) {
      return `${lang}-${region.toUpperCase()}`;
    }
    // zh -> zh-CN, en -> en-US
    if (lang === 'zh') return 'zh-CN';
    if (lang === 'en') return 'en-US';
    return locale;
  },

  /**
   * 检查是否支持该语言
   */
  isSupported: (locale: string, config: LocaleConfig = DEFAULT_LOCALE_CONFIG): boolean => {
    return config.supportedLocales.includes(locale as LocaleCode);
  },

  /**
   * 获取语言部分（zh, en）
   */
  getLanguage: (locale: Locale): string => {
    return locale.value.split('-')[0];
  },

  /**
   * 获取地区部分（CN, US）
   */
  getRegion: (locale: Locale): string | undefined => {
    return locale.value.split('-')[1];
  },

  /**
   * 检查是否为中文
   */
  isChinese: (locale: Locale): boolean => {
    return LocaleHelpers.getLanguage(locale) === 'zh';
  },

  /**
   * 检查是否为英文
   */
  isEnglish: (locale: Locale): boolean => {
    return LocaleHelpers.getLanguage(locale) === 'en';
  },

  /**
   * 值相等性比较
   */
  equals: (a: Locale, b: Locale): boolean => {
    return a.value === b.value;
  },
};