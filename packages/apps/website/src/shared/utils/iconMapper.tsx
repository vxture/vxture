/**
 * iconMapper.tsx - Icon String to React Icon Component Mapper
 *
 * Shared Layer - Utility
 *
 * 职责：
 * - 将 JSON 中的 icon 字符串标识符映射为实际的 React Icon 组件
 * - 支持扩展，方便添加新的图标映射
 * - 直接使用 design-system 的图标系统
 *
 * @layer Shared
 * @category Utils
 */

import { Icon, getIconName } from '@vxture/design-system';

/**
 * 根据字符串标识符获取对应的图标名称
 * @param iconName - 图标名称（如 "graph", "code"）
 * @returns 标准化的图标名称
 */
export function getIconComponent(iconName: string) {
  return getIconName(iconName);
}

/**
 * 渲染图标组件
 * @param iconName - 图标名称
 * @param className - 可选的 CSS 类名
 * @returns 渲染的图标元素
 */
export function renderIcon(iconName: string, className?: string): React.ReactElement {
  return <Icon name={iconName} className={className} />;
}