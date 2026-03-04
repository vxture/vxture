/**
 * iconMapper.tsx - Icon String to React Icon Component Mapper
 *
 * Shared Layer - Utility
 *
 * 职责：
 * - 将 JSON 中的 icon 字符串标识符映射为实际的 React Icon 组件
 * - 支持扩展，方便添加新的图标映射
 *
 * @layer Shared
 * @category Utils
 */
import {
  HiChartBar,
  HiCommandLine,
  HiCube,
  HiLightBulb,
  HiPaperAirplane,
  HiShieldCheck,
  HiSparkles,
  HiCog,
} from 'react-icons/hi2';

// Icon 映射表
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  graph: HiChartBar,
  code: HiCommandLine,
  cube: HiCube,
  lightbulb: HiLightBulb,
  rocket: HiPaperAirplane,
  shield: HiShieldCheck,
  sparkles: HiSparkles,
  cog: HiCog,
};

/**
 * 根据字符串标识符获取对应的 React Icon 组件
 * @param iconName - 图标名称（如 "graph", "code"）
 * @returns React Icon 组件，如果找不到则返回默认图标
 */
export function getIconComponent(
  iconName: string
): React.ComponentType<{ className?: string }> {
  return iconMap[iconName.toLowerCase()] || HiCube; // 默认使用 HiCube
}

/**
 * 渲染图标组件
 * @param iconName - 图标名称
 * @param className - 可选的 CSS 类名
 * @returns 渲染的图标元素
 */
export function renderIcon(iconName: string, className?: string): React.ReactElement {
  const IconComponent = getIconComponent(iconName);
  return <IconComponent className={className} />;
}
