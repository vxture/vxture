/**
 * object.utils.ts - Object utilities
 * @package @vxture/core-config
 * @description
 *   Object utility functions (deepMerge, deepClone, isPlainObject)
 * 
 * @author AI-Generated
 * @date 2026-03-15
 */

// ============================================================================
// Deep Merge
// ============================================================================

/**
 * Deep merge two objects, source properties have higher precedence than target.
 *
 * Rules:
 * - Plain objects are merged recursively
 * - Arrays are replaced directly (not appended)
 * - Returns new object, original inputs are not modified
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
 * Deep clone an object.
 *
 * Supports: Date, Array, plain objects, primitive types.
 * Does not support: Map, Set, circular references (outside current platform needs).
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
 * Check if a value is a plain object (not null, not array, not Date, not class instance).
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
