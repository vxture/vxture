/**
 * themeConfig.ts - 主题相关全局配置常量
 * 统一管理主题配置，供全局状态、组件等模块复用
 */

export type Theme = 'light' | 'dark' | string;

export const THEME_CONFIG = {
  themeAttribute: 'data-theme',    // DOM 中存储主题的属性名（如 <html data-theme="light">）
  darkClass: 'dark',               // 深色模式对应的 DOM 类名（用于 Tailwind 等 CSS 框架识别）
  storageKey: 'theme-storage',     // 本地存储键名
  defaultTheme: 'light' as Theme,  // 默认主题
};
