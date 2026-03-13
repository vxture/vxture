/**
 * format.utils.ts - Shared format utility functions
 * @package @vxture/shared
 * @description Number, date, and currency formatting functions based on locale, supporting automatic or manual currency specification.
 */

import type { Locale } from '../types/locale.types';
import { LOCALE_INTL_MAP, LOCALE_DEFAULT_CURRENCY } from '../constants/locale.constants';

/**
 * 格式化货币
 * @param amount 金额
 * @param locale 语言
 * @param currency 货币代码（可选，默认按 locale 推断）
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency?: string,
): string {
  try {
    const resolvedCurrency = currency ?? LOCALE_DEFAULT_CURRENCY[locale];
    return new Intl.NumberFormat(LOCALE_INTL_MAP[locale], {
      style: 'currency',
      currency: resolvedCurrency,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

/**
 * 格式化日期
 * @param date 日期对象
 * @param locale 语言
 */
export function formatDate(date: Date, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(LOCALE_INTL_MAP[locale]).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * 格式化数字
 * @param value 数字
 * @param locale 语言
 */
export function formatNumber(value: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(LOCALE_INTL_MAP[locale]).format(value);
  } catch {
    return String(value);
  }
}
