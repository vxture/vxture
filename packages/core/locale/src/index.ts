/**
 * index.ts - core-locale 包入口
 * @package @vxture/core-locale
 * @description
 *   服务端 locale 解析与内容本地化工具包，框架无关，运行于 Node.js 环境
 */

// ============================================================================
// Re-exports from @vxture/shared
// ============================================================================

// 导出 shared 包定义的 Locale 类型和常量
export type { Locale } from '@vxture/shared';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@vxture/shared';

// ============================================================================
// Service-side Locale Utils
// ============================================================================

export { resolveLocale, localizeContent } from './utils';
