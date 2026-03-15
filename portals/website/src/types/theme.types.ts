/**
 * 主题类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

export interface ThemeConfig {
  name: string;
  displayName: string;
  isDark: boolean;
}

export interface ThemeState {
  /** 当前主题名（如 'light' | 'dark'） */
  theme: string;
  /** 可用主题列表（如 light/dark/自定义） */
  availableThemes: ThemeConfig[];
  /** 是否为暗色模式 */
  isDarkMode: boolean;
  /**
   * 设置主题（支持任意已注册主题）
   * @param theme 主题名
   */
  setTheme: (theme: string) => void;
  /**
   * 切换主题（明暗互换）
   * @returns void
   */
  toggleTheme: () => void;
}
