/**
 * Icon Name Mapper
 *
 * 将数据中的图标名称映射到设计系统支持的图标
 * 实现图标名称的标准化和兼容性处理
 *
 * @layer Design System
 * @category Icons
 */

import type { IconName } from '../icons/icon.types';

/**
 * 图标名称映射表
 * 将 JSON 数据中的图标名称映射到设计系统支持的图标
 */
const iconNameMap: Record<string, IconName> = {
  // 数据/分析类图标
  graph: 'chart-bar',       // 图表
  database: 'cube',         // 数据立方体

  // AI/智能类图标
  ai: 'agent',              // 智能体
  brain: 'agent',           // 大脑（智能）
  spark: 'sparkles',        // 火花（智能）

  // 系统/平台类图标
  server: 'building-library', // 服务器（建筑/库）
  workflow: 'chevron-right',  // 工作流（箭头）
  trigger: 'arrow-right',     // 触发器（箭头）

  // 通讯类图标
  rocket: 'paperplane-tilt',  // 火箭（发送）

  // 兼容性映射
  'paper-plane': 'paperplane-tilt',
  'paper-plane-tilt': 'paperplane-tilt',
};

/**
 * 根据字符串标识符获取对应的设计系统图标名称
 * @param iconName - 图标名称（如 "graph", "code"）
 * @returns 标准化的图标名称
 */
export function getIconName(iconName: string): IconName {
  // 统一转换为小写处理
  const normalizedName = iconName.toLowerCase().trim();

  // 尝试从映射表中查找
  const mappedName = iconNameMap[normalizedName];
  if (mappedName) {
    return mappedName;
  }

  // 如果没有映射，直接返回原始名称（作为安全的 fallback）
  return normalizedName as IconName;
}
