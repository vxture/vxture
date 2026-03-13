/**
 * Shared locale type definitions.
 * Pure structural types only — no store logic, no runtime behavior.
 * @package @vxture/shared
 */

// ============================================================================
// Shared Locale Types
// ============================================================================

/**
 * 全平台唯一的 Locale 类型
 */
export type Locale = 'zh' | 'en';

/**
 * 单个语言的展示配置，用于语言切换列表等 UI 场景
 */
export interface LocaleConfig {
  locale: Locale;
  displayName: string;
  icon?: string;
}
