/**
 * index.ts - core-locale 包入口
 * @package @vxture/core-locale
 * @description
 *   服务端 locale 解析与内容本地化工具包，框架无关，运行于 Node.js 环境
 */

// ============================================================================
// Re-exports from local constants
// ============================================================================

// 导出本地定义的 Locale 类型，与 @vxture/shared 同步
export type { Locale } from './constants';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants';

// ============================================================================
// Service-side Locale Utils
// ============================================================================

export { resolveLocale, localizeContent } from './utils';
