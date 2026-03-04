/**
 * debug.ts - 调试工具函数
 *
 * 功能：
 * - 开发环境输出调试日志，生产环境自动禁用
 * - 统一管理 console.log，避免生产环境忘记移除
 *
 * @example
 * ```ts
 * import { debugLog } from '@vxture/shared-utils';
 *
 * debugLog('Hero data:', hero); // 仅开发环境输出
 * ```
 */

/**
 * 判断是否为开发环境
 */
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * 开发环境调试日志（生产环境自动禁用）
 * @param args - 日志参数，同 console.log
 */
export function debugLog(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.log(...args);
  }
}

/**
 * 开发环境调试警告（生产环境自动禁用）
 * @param args - 警告参数，同 console.warn
 */
export function debugWarn(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.warn(...args);
  }
}

/**
 * 开发环境调试错误（生产环境自动禁用）
 * @param args - 错误参数，同 console.error
 */
export function debugError(...args: unknown[]): void {
  if (IS_DEVELOPMENT) {
    console.error(...args);
  }
}
