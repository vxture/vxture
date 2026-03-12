/**
 * locale.utils.ts - 本地化格式化工具函数
 * @package @vxture/shared
 *
 * Description: 提供纯工具函数式的日期、数字、货币格式化功能，
 * 不依赖任何状态管理，直接接受 locale 参数，支持浏览器和 Node.js 环境。
 * 同时运行于浏览器和 Node.js 环境，不依赖任何框架。
 *
 * @author AI-Generated
 * @date 2026-03-13
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Utils
 *
 * @remarks
 * - 纯工具函数，无副作用，基于标准 Intl API 实现
 * - 同时运行于浏览器和 Node.js 环境
 * - 不依赖任何框架（无 React、无 Next.js、无 NestJS）
 * - 前端（portals、agent-studio）和后端（bff、services、agent-server）
 *   都可以直接从 @vxture/shared 引入使用
 * - 禁止在此文件中引入任何内部包
 *
 * @example
 * ```ts
 * import { formatCurrency, formatDate, formatNumber } from '@vxture/shared';
 *
 * const date = formatDate(new Date(), 'zh');
 * const number = formatNumber(1000, 'en');
 * const currency = formatCurrency(100, 'zh');
 * ```
 */

import type { Locale } from '../constants';

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * 格式化货币
 * @param amount 金额
 * @param locale 语言代码
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, locale: Locale): string {
  try {
    const currencyMap: Record<Locale, string> = {
      'zh': 'CNY',
      'en': 'USD',
    };
    const currency = currencyMap[locale] || 'USD';
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * 格式化日期
 * @param date 日期对象
 * @param locale 语言代码
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(date);
  } catch {
    return date.toISOString();
  }
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * 格式化数字
 * @param number 数字
 * @param locale 语言代码
 * @returns 格式化后的数字字符串
 */
export function formatNumber(number: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(number);
  } catch {
    return String(number);
  }
}
