/**
 * debug.ts - Debug Utility Functions
 * @package @vxture/shared
 *
 * Description: Development-only debug utilities that are automatically disabled
 * in production. Provides debugLog, debugWarn, and debugError functions for
 * consistent logging across the platform.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Utilities
 *
 * @remarks
 * - Pure utility functions
 * - No side effects in production
 * - Framework-agnostic
 *
 * @example
 * ```ts
 * import { debugLog, debugWarn, debugError } from '@vxture/shared';
 *
 * debugLog('App initialized'); // Only in development
 * debugWarn('Deprecated API used');
 * debugError('Critical failure');
 * ```
 */

/**
 * Check if running in development environment
 * @description Determines if NODE_ENV is set to development
 */
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Debug log (only in development)
 * @param args - Log arguments, same as console.log
 */
export function debugLog(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.log(...args);
  }
}

/**
 * Debug warning (only in development)
 * @param args - Warning arguments, same as console.warn
 */
export function debugWarn(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.warn(...args);
  }
}

/**
 * Debug error (only in development)
 * @param args - Error arguments, same as console.error
 */
export function debugError(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.error(...args);
  }
}
