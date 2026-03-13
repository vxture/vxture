/**
 * locale.constants.ts - core-locale 语言常量
 * @package @vxture/core-locale
 *
 * Description: core-locale 包的语言常量定义。
 * 为了避免路径映射导入问题，这些常量复制自 @vxture/shared。
 */

// ============================================================================
// 语言枚举定义
// ============================================================================

/**
 * 全平台支持的语言列表
 * @description 这是全平台唯一的语言定义，与 @vxture/shared 同步
 */
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

/**
 * Locale 类型
 * @description 全平台唯一的语言类型定义
 */
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * 默认语言
 * @description 全平台统一的默认语言
 */
export const DEFAULT_LOCALE: Locale = 'zh';
