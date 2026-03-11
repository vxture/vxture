/**
 * debug.ts - 调试工具函数
 * @package @vxture/shared
 *
 * Description: 仅用于开发环境的调试工具，在生产环境自动禁用。
 * 提供 debugLog、debugWarn 和 debugError 函数，用于平台统一的日志输出。
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.1
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Utilities
 *
 * @remarks
 * - 纯工具函数
 * - 生产环境无副作用
 * - 框架无关
 * - 必须通过 configureDebug() 配置开发环境标识
 *
 * @example
 * ```ts
 * import { configureDebug, debugLog, debugWarn, debugError } from '@vxture/shared';
 *
 * // 在应用初始化时配置
 * configureDebug({ isDevelopment: true });
 *
 * debugLog('应用已初始化'); // 仅在开发环境输出
 * debugWarn('使用了已废弃的 API');
 * debugError('严重故障');
 * ```
 */

// ============================================================================
// 调试配置
// ============================================================================

/**
 * 调试工具配置接口
 */
export interface DebugConfig {
  /** 是否为开发环境 */
  isDevelopment: boolean;
}

/**
 * 当前调试配置
 */
let debugConfig: DebugConfig = {
  isDevelopment: false
};

// ============================================================================
// 配置函数
// ============================================================================

/**
 * 配置调试工具
 * @param config 调试配置
 */
export function configureDebug(config: Partial<DebugConfig>): void {
  debugConfig = { ...debugConfig, ...config };
}

/**
 * 获取当前调试配置
 * @returns 当前调试配置的副本
 */
export function getDebugConfig(): DebugConfig {
  return { ...debugConfig };
}

// ============================================================================
// 日志函数
// ============================================================================

/**
 * 调试日志（仅在开发环境）
 * @param args - 日志参数，与 console.log 相同
 */
export function debugLog(...args: unknown[]): void {
  if (debugConfig.isDevelopment) {
    console.log(...args);
  }
}

/**
 * 调试警告（仅在开发环境）
 * @param args - 警告参数，与 console.warn 相同
 */
export function debugWarn(...args: unknown[]): void {
  if (debugConfig.isDevelopment) {
    console.warn(...args);
  }
}

/**
 * 调试错误（仅在开发环境）
 * @param args - 错误参数，与 console.error 相同
 */
export function debugError(...args: unknown[]): void {
  if (debugConfig.isDevelopment) {
    console.error(...args);
  }
}
