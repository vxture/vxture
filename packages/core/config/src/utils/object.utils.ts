/**
 * object.utils.ts - 对象工具
 * @package @vxture/core-config
 * @description Object utility functions (deepMerge, deepClone, isPlainObject)
 */

// ============================================================================
// Deep Merge
// ============================================================================

/**
 * 深度合并两个对象，source 优先级高于 target。
 *
 * 规则：
 * - 普通对象递归合并
 * - 数组直接替换（不追加）
 * - 返回新对象，不修改原始入参
 *
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // → { a: 1, b: { c: 2, d: 3 } }
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const tv = result[key as keyof T];
    const sv = source[key as keyof T];

    if (isPlainObject(tv) && isPlainObject(sv)) {
      result[key as keyof T] = deepMerge(
        tv as object,
        sv as object,
      ) as T[keyof T];
    } else if (sv !== undefined) {
      result[key as keyof T] = sv as T[keyof T];
    }
  }

  return result;
}

// ============================================================================
// Deep Clone
// ============================================================================

/**
 * 深度克隆对象。
 *
 * 支持：Date、Array、普通对象、原始类型。
 * 不支持：Map、Set、循环引用（超出当前平台需求范围）。
 *
 * @example
 * const clone = deepClone({ a: { b: 1 }, c: [1, 2] });
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;

  const clone = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

// ============================================================================
// isPlainObject
// ============================================================================

/**
 * 判断值是否为普通对象（非 null、非数组、非 Date、非 class 实例）。
 *
 * @example
 * isPlainObject({})          // true
 * isPlainObject([])          // false
 * isPlainObject(new Date())  // false
 * isPlainObject(null)        // false
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
