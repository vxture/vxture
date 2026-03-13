/**
 * index.ts - Vxture Core Locale Package
 * @package @vxture/core-locale
 *
 * Description: 服务端 locale 解析与内容本地化工具。
 * 职责：服务端 locale 解析与内容本地化，框架无关，运行于 Node.js 环境。
 *
 * @author AI-Generated
 * @date 2026-03-13
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Infrastructure
 * @category Core
 *
 * @remarks
 * - 仅提供服务端能力（bff、services、agent-server）
 * - 前端代码禁止直接引用此包，应从 @vxture/shared 引入格式化工具
 * - 使用本地定义的 Locale 类型，避免路径映射导入问题
 *
 * @example
 * ```ts
 * // 服务端使用
 * import { resolveLocale, localizeContent, type Locale } from '@vxture/core-locale';
 *
 * const locale = resolveLocale(request);
 * const content = localizeContent({ zh: '你好', en: 'Hello' }, locale);
 * ```
 */

// ============================================================================
// Re-exports from local constants
// ============================================================================

// 导出本地定义的 Locale 类型，与 @vxture/shared 同步
export type { Locale } from './constants/locale.constants';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './constants/locale.constants';

// ============================================================================
// Service-side Locale Utils
// ============================================================================

export { resolveLocale, localizeContent } from './utils/locale.utils';
