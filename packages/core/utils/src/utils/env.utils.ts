/**
 * env.utils.ts - env相关工具
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
// 环境判断
// ============================================================================

/** 当前 NODE_ENV 值，未设置时默认 'development' */
export function getNodeEnv(): string {
  return process.env['NODE_ENV'] ?? 'development';
}

/** 是否为生产环境 */
export function isProduction(): boolean {
  return getNodeEnv() === 'production';
}

/** 是否为开发环境 */
export function isDevelopment(): boolean {
  return getNodeEnv() === 'development';
}

/** 是否为测试环境 */
export function isTest(): boolean {
  return getNodeEnv() === 'test';
}

/** 是否为 staging 环境 */
export function isStaging(): boolean {
  return getNodeEnv() === 'staging';
}

// ============================================================================
// 进程判断
// ============================================================================

/** 是否运行在 Node.js 环境 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions?.node !== undefined;
}

/** 是否运行在浏览器环境 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}