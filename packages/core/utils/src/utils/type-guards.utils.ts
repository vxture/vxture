/**
 * type-guards.utils.ts - type-guards相关工具
 * @package @vxture/core-utils
 * @layer Infrastructure
 * @category Utils
 * @author AI-Generated
 * @date 2026-03-14
 * @copyright Vxture Team
 * @description
 *   文件功能描述
 */

// ============================================================================
// 基础类型守卫
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

// ============================================================================
// null / undefined 守卫
// ============================================================================

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ============================================================================
// 对象 / 数组守卫
// ============================================================================

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0;
}

export function isEmptyArray(value: unknown): value is [] {
  return isArray(value) && value.length === 0;
}

// ============================================================================
// 字符串内容守卫
// ============================================================================

/** 非空字符串（排除空白） */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/** 有效的 URL 字符串 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** 有效的 UUID v4 */
export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}