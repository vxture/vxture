/**
 * index.ts - Vxture Core Localization/i18n Package
 * @package @vxture/core-locale
 *
 * Description: Platform localization and i18n package for Vxture, providing
 * locale management, translation utilities, and date/time formatting.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Core
 * @category Services - Locale
 */

// ============================================
// Locale Types
// ============================================

/**
 * Locale Configuration
 * @interface LocaleConfig
 */
export interface LocaleConfig {
  /** Current locale code (e.g., 'en-US', 'zh-CN') */
  currentLocale: string;
  /** Available locales */
  availableLocales: string[];
  /** Fallback locale */
  fallbackLocale: string;
  /** Enable/disable pluralization */
  enablePluralization?: boolean;
  /** Enable/disable date/time formatting */
  enableDateTimeFormatting?: boolean;
  /** Enable/disable number formatting */
  enableNumberFormatting?: boolean;
}

/**
 * Translation Dictionary
 * @interface TranslationDictionary
 */
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/**
 * Translation Options
 * @interface TranslateOptions
 */
export interface TranslateOptions {
  /** Default value if translation not found */
  defaultValue?: string;
  /** Variables for interpolation */
  variables?: Record<string, string | number | null | undefined>;
  /** Count for pluralization */
  count?: number;
  /** Plural forms */
  pluralForms?: string[];
}

/**
 * Date Format Options
 * @interface DateFormatOptions
 */
export interface DateFormatOptions {
  /** Date style */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Time style */
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Locale-specific options */
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Number Format Options
 * @interface NumberFormatOptions
 */
export interface NumberFormatOptions {
  /** Number style */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  /** Currency code */
  currency?: string;
  /** Unit */
  unit?: string;
  /** Locale-specific options */
  options?: Intl.NumberFormatOptions;
}

/**
 * Default locale configuration
 */
const DEFAULT_LOCALE_CONFIG: LocaleConfig = {
  currentLocale: 'en-US',
  availableLocales: ['en-US', 'zh-CN', 'ja-JP'],
  fallbackLocale: 'en-US',
  enablePluralization: true,
  enableDateTimeFormatting: true,
  enableNumberFormatting: true,
};

// ============================================
// Locale Manager
// ============================================

/**
 * Locale Manager class for managing i18n functionality
 * @class LocaleManager
 */
export class LocaleManager {
  private config: LocaleConfig;
  private translations: Map<string, TranslationDictionary>;

  constructor(initialConfig?: Partial<LocaleConfig>) {
    this.config = {
      ...DEFAULT_LOCALE_CONFIG,
      ...initialConfig,
    };

    this.translations = new Map();
  }

  /**
   * Get current locale configuration
   */
  public getConfig(): LocaleConfig {
    return this.config;
  }

  /**
   * Get current locale
   */
  public getCurrentLocale(): string {
    return this.config.currentLocale;
  }

  /**
   * Get available locales
   */
  public getAvailableLocales(): string[] {
    return this.config.availableLocales;
  }

  /**
   * Set current locale
   * @param locale Locale code
   */
  public setLocale(locale: string): void {
    if (this.config.availableLocales.includes(locale)) {
      this.config.currentLocale = locale;
    }
  }

  /**
   * Add a locale to available locales
   * @param locale Locale code
   */
  public addLocale(locale: string): void {
    if (!this.config.availableLocales.includes(locale)) {
      this.config.availableLocales.push(locale);
    }
  }

  /**
   * Check if a locale is available
   * @param locale Locale code
   */
  public isLocaleAvailable(locale: string): boolean {
    return this.config.availableLocales.includes(locale);
  }

  /**
   * Set translations for a locale
   * @param locale Locale code
   * @param translations Translation dictionary
   */
  public setTranslations(locale: string, translations: TranslationDictionary): void {
    this.translations.set(locale, translations);
  }

  /**
   * Get translations for a locale
   * @param locale Locale code
   */
  public getTranslations(locale: string): TranslationDictionary | undefined {
    return this.translations.get(locale);
  }

  /**
   * Merge translations into existing translations
   * @param locale Locale code
   * @param translations Translation dictionary to merge
   */
  public mergeTranslations(locale: string, translations: TranslationDictionary): void {
    const existing = this.translations.get(locale) || {};
    this.translations.set(locale, this.deepMerge(existing, translations));
  }

  /**
   * Deep merge two objects
   * @param target Target object
   * @param source Source object
   * @returns Merged object
   */
  private deepMerge(
    target: TranslationDictionary,
    source: TranslationDictionary
  ): TranslationDictionary {
    const result = { ...target };

    for (const key in source) {
      const targetValue = result[key];
      const sourceValue = source[key];

      if (
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue) &&
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue)
      ) {
        result[key] = this.deepMerge(
          targetValue as TranslationDictionary,
          sourceValue as TranslationDictionary
        );
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Translate a key
   * @param key Translation key
   * @param options Translation options
   * @returns Translated string
   */
  public t(key: string, options?: TranslateOptions): string {
    return this.translate(key, options);
  }

  /**
   * Translate a key
   * @param key Translation key
   * @param options Translation options
   * @returns Translated string
   */
  public translate(key: string, options?: TranslateOptions): string {
    let value = this.findTranslation(key, this.config.currentLocale);

    if (!value) {
      value = this.findTranslation(key, this.config.fallbackLocale);
    }

    if (!value) {
      return options?.defaultValue || key;
    }

    // Apply pluralization if count is provided
    if (options?.count !== undefined && this.config.enablePluralization) {
      value = this.pluralize(value, options.count, options.pluralForms);
    }

    // Interpolate variables
    if (options?.variables) {
      value = this.interpolate(value, options.variables);
    }

    return value;
  }

  /**
   * Find translation by key
   * @param key Translation key
   * @param locale Locale code
   * @returns Translation value or undefined
   */
  private findTranslation(key: string, locale: string): string | undefined {
    const translations = this.translations.get(locale);

    if (!translations) {
      return undefined;
    }

    const parts = key.split('.');
    let current: string | TranslationDictionary | undefined = translations;

    for (const part of parts) {
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Apply pluralization
   * @param value Translation value
   * @param count Count
   * @param pluralForms Optional plural forms
   * @returns Pluralized string
   */
  private pluralize(
    value: string,
    count: number,
    pluralForms?: string[]
  ): string {
    const forms = pluralForms || value.split('|');

    if (forms.length === 1) {
      return value.replace('{count}', String(count));
    }

    let index: number;

    // Simple pluralization rules (can be extended for different locales)
    if (count === 0 && forms.length > 2) {
      index = 0;
    } else if (count === 1) {
      index = 1;
    } else {
      index = Math.min(2, forms.length - 1);
    }

    return forms[index].trim().replace('{count}', String(count));
  }

  /**
   * Interpolate variables into string
   * @param value String to interpolate
   * @param variables Variables to use
   * @returns Interpolated string
   */
  private interpolate(
    value: string,
    variables: Record<string, string | number | null | undefined>
  ): string {
    return value.replace(/\{([^}]+)\}/g, (match, key) => {
      if (key in variables) {
        const value = variables[key];
        return value ?? '';
      }
      return match;
    });
  }

  /**
   * Format a date
   * @param date Date to format
   * @param options Format options
   * @returns Formatted date string
   */
  public formatDate(
    date: Date | number | string,
    options?: DateFormatOptions
  ): string {
    if (!this.config.enableDateTimeFormatting) {
      return String(date);
    }

    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const formatOptions: Intl.DateTimeFormatOptions = {
      ...options?.options,
    };

    if (options?.dateStyle) {
      formatOptions.dateStyle = options.dateStyle;
    }

    if (options?.timeStyle) {
      formatOptions.timeStyle = options.timeStyle;
    }

    return new Intl.DateTimeFormat(this.config.currentLocale, formatOptions).format(dateObj);
  }

  /**
   * Format a number
   * @param number Number to format
   * @param options Format options
   * @returns Formatted number string
   */
  public formatNumber(
    number: number | string,
    options?: NumberFormatOptions
  ): string {
    if (!this.config.enableNumberFormatting) {
      return String(number);
    }

    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatOptions: Intl.NumberFormatOptions = {
      ...options?.options,
    };

    if (options?.style) {
      formatOptions.style = options.style;
    }

    if (options?.currency) {
      formatOptions.currency = options.currency;
    }

    if (options?.unit) {
      formatOptions.unit = options.unit;
    }

    return new Intl.NumberFormat(this.config.currentLocale, formatOptions).format(num);
  }

  /**
   * Format currency
   * @param amount Amount
   * @param currency Currency code
   * @returns Formatted currency string
   */
  public formatCurrency(amount: number | string, currency: string = 'USD'): string {
    return this.formatNumber(amount, {
      style: 'currency',
      currency,
    });
  }

  /**
   * Format percent
   * @param value Value
   * @returns Formatted percent string
   */
  public formatPercent(value: number | string): string {
    return this.formatNumber(value, {
      style: 'percent',
    });
  }

  /**
   * Get relative time format
   * @param date Date to compare
   * @param baseDate Base date for comparison
   * @returns Relative time string
   */
  public formatRelativeTime(
    date: Date | number | string,
    baseDate: Date | number = Date.now()
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const baseObj = typeof baseDate === 'number' ? new Date(baseDate) : baseDate;
    const diffInSeconds = Math.floor((dateObj.getTime() - baseObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(this.config.currentLocale, {
      numeric: 'auto',
    });

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
      { unit: 'year', seconds: 60 * 60 * 24 * 365 },
      { unit: 'month', seconds: 60 * 60 * 24 * 30 },
      { unit: 'week', seconds: 60 * 60 * 24 * 7 },
      { unit: 'day', seconds: 60 * 60 * 24 },
      { unit: 'hour', seconds: 60 * 60 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
      const value = Math.floor(diffInSeconds / seconds);
      if (Math.abs(value) >= 1 || unit === 'second') {
        return rtf.format(value, unit);
      }
    }

    return '';
  }
}

// ============================================
// Locale Detector
// ============================================

/**
 * Locale Detector class for detecting user's locale
 * @class LocaleDetector
 */
export class LocaleDetector {
  /**
   * Detect locale from browser
   * @returns Detected locale or undefined
   */
  public static detectFromBrowser(): string | undefined {
    if (typeof navigator !== 'undefined') {
      return navigator.language || navigator.languages?.[0];
    }
    return undefined;
  }

  /**
   * Detect locale from URL
   * @param url URL string
   * @returns Detected locale or undefined
   */
  public static detectFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      if (pathSegments.length > 0) {
        const firstSegment = pathSegments[0];
        // Check if segment looks like a locale (e.g., en-US, zh-CN)
        if (/^[a-z]{2}(-[A-Z]{2})?$/.test(firstSegment)) {
          return firstSegment;
        }
      }

      // Check query parameters
      const localeParam = urlObj.searchParams.get('lang') || urlObj.searchParams.get('locale');
      if (localeParam) {
        return localeParam;
      }
    } catch {
      // Ignore URL parsing errors
    }

    return undefined;
  }

  /**
   * Detect locale from cookie
   * @param cookies Cookie string
   * @returns Detected locale or undefined
   */
  public static detectFromCookie(cookies: string): string | undefined {
    const localeCookie = 'locale';
    const regex = new RegExp(`${localeCookie}=([^;]+)`);
    const match = regex.exec(cookies);

    return match?.[1];
  }

  /**
   * Detect locale from local storage
   * @returns Detected locale or undefined
   */
  public static detectFromLocalStorage(): string | undefined {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem('locale');
      return value || undefined;
    }
    return undefined;
  }

  /**
   * Detect locale from request headers
   * @param headers Request headers
   * @returns Detected locale or undefined
   */
  public static detectFromHeaders(headers: Record<string, string>): string | undefined {
    const acceptLanguage = headers['accept-language'] || headers['Accept-Language'];

    if (acceptLanguage) {
      const primaryLocale = acceptLanguage.split(',')[0].split(';')[0];
      return primaryLocale;
    }

    return undefined;
  }
}

// ============================================
// Singleton Instance
// ============================================

let localeManagerInstance: LocaleManager | null = null;

/**
 * Get or create the Locale Manager singleton
 * @param initialConfig Initial locale configuration
 * @returns LocaleManager instance
 */
export function getLocaleManager(initialConfig?: Partial<LocaleConfig>): LocaleManager {
  localeManagerInstance ??= new LocaleManager(initialConfig);
  return localeManagerInstance;
}