/**
 * Icon Name Mapper
 *
 * 将数据中的图标名称映射到设计系统支持的图标
 * 实现图标名称的标准化和兼容性处理
 *
 * @layer Design System
 * @category Icons
 */

import type { IconName } from './iconTokens';

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

/**
 * 验证图标名称是否有效
 * @param iconName - 图标名称
 * @returns 是否有效
 */
export function isValidIconName(iconName: string): boolean {
  const validIconNames = new Set<IconName>([
    // 通用交互
    'home', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
    'arrow-long-right', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
    'search', 'settings', 'edit', 'delete', 'add', 'plus', 'x', 'check', 'trash', 'cog',
    'success', 'error', 'warning', 'info',

    // 云服务/智能体专属
    'agent', 'workflow', 'trigger', 'database', 'cloud', 'server', 'cube',
    'building-library', 'chart', 'chart-bar', 'table', 'code', 'api', 'graph',
    'lightbulb', 'sparkles', 'shield-check',

    // 用户/组织
    'user', 'user-group', 'users', 'medal', 'star',

    // 通讯/联系
    'mail', 'phone', 'wechat', 'github', 'linkedin', 'chat-circle', 'paperplane-tilt',

    // 时间/日历
    'calendar', 'calendar-days', 'clock',

    // 地图/位置
    'map-pin', 'map-marker',

    // 主题/显示
    'sun', 'moon', 'globe',

    // 额外需要的图标
    'caret-left-bold', 'caret-right-bold',
  ]);

  const normalizedName = iconName.toLowerCase().trim();
  return validIconNames.has(normalizedName as IconName);
}
