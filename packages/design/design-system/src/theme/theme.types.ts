/**
 * theme.types.ts - 主题系统类型定义
 * @package @vxture/design-system
 *
 * 功能：定义主题系统的类型
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Types
 */

import type { Theme } from '@vxture/shared';

/**
 * 单个主题的展示配置，用于主题切换列表渲染
 * isDark 由消费方按需计算，不在此冗余存储
 */
export interface ThemeConfig {
  theme: Theme;
  displayName: string;
  icon?: string;
}
