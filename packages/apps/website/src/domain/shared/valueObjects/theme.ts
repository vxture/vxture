/**
 * theme.ts - 主题值对象
 *
 * Domain Layer - Shared Value Objects
 *
 * @layer Domain
 * @category Shared - Value Objects
 */

/**
 * 主题类型
 */
export type ThemeType = 'primary' | 'secondary' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

/**
 * Theme 值对象接口
 */
export interface Theme {
  readonly value: ThemeType;
}

/**
 * Theme 相关的纯函数
 */
export const ThemeHelpers = {
  /**
   * 所有有效的主题
   */
  VALID_THEMES: ['primary', 'secondary', 'brand', 'info', 'success', 'warning', 'danger'] as const,

  /**
   * 创建 Theme 实例
   */
  create: (theme: string): Theme => {
    if (!ThemeHelpers.isValid(theme)) {
      console.warn(`Invalid theme: ${theme}, falling back to 'primary'`);
      return { value: 'primary' };
    }
    return { value: theme as ThemeType };
  },

  /**
   * 检查主题是否有效
   */
  isValid: (theme: string): theme is ThemeType => {
    return ThemeHelpers.VALID_THEMES.includes(theme as ThemeType);
  },

  /**
   * 检查是否为主要主题
   */
  isPrimary: (theme: Theme): boolean => {
    return theme.value === 'primary';
  },

  /**
   * 检查是否为品牌主题
   */
  isBrand: (theme: Theme): boolean => {
    return theme.value === 'brand';
  },

  /**
   * 值相等性比较
   */
  equals: (a: Theme, b: Theme): boolean => {
    return a.value === b.value;
  },
};