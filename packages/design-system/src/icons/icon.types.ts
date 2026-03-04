/**
 * icon.types.ts
 * @package @vxture/design-system
 *
 * Icon 系统全部类型定义。
 * IconName 从 iconMap 自动推导，无需手动维护枚举。
 * 此文件只做类型声明，不包含任何运行时代码。
 */

import type { iconMap } from './iconMap';

// ─────────────────────────────────────────
// 核心类型：从 iconMap 自动推导，永远与注册表同步
// ─────────────────────────────────────────

/**
 * 所有合法的图标名称。
 * 由 iconMap 的 key 自动推导，新增图标只需改 iconMap.ts，此处自动更新。
 *
 * @example
 * const name: IconName = 'agent'   // ✅
 * const name: IconName = 'rocket'  // ❌ TS 报错
 */
export type IconName = keyof typeof iconMap;

// ─────────────────────────────────────────
// Phosphor 变体类型
// ─────────────────────────────────────────

/**
 * Phosphor Icons 支持的 6 种粗细变体。
 *
 * - thin      极细，装饰性场景
 * - light     细线，次要信息
 * - regular   默认，通用场景
 * - bold      加粗，强调/标题旁
 * - fill      实心填充，选中态 / 激活态
 * - duotone   双色，云服务/智能体状态展示
 */
export type IconWeight =
  | 'thin'
  | 'light'
  | 'regular'
  | 'bold'
  | 'fill'
  | 'duotone';

// ─────────────────────────────────────────
// 尺寸类型
// ─────────────────────────────────────────

/**
 * 语义化尺寸规格，对应 px 值见 Icon.tsx 的 sizeMap。
 *
 * xs → 12px  用于 badge、tag 内嵌图标
 * sm → 16px  用于按钮内图标、辅助说明
 * md → 20px  默认，通用场景
 * lg → 24px  卡片标题、侧边栏导航
 * xl → 32px  空状态插图、Feature 展示区
 *
 * 也接受 number 直接传像素值，用于特殊场景。
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ─────────────────────────────────────────
// 组件 Props
// ─────────────────────────────────────────

/**
 * <Icon /> 组件的完整 Props 定义。
 */
export interface IconProps {
  /**
   * 语义化图标名称，必填。
   * 类型安全：只接受 iconMap 中注册的名称。
   * 动态数据场景请配合 fallback 使用。
   */
  name: IconName;

  /**
   * 图标尺寸。
   * 接受语义化规格或直接传 px 数值。
   * @default 'md'
   */
  size?: IconSize | number;

  /**
   * Phosphor 粗细变体。
   * @default 'regular'
   */
  weight?: IconWeight;

  /**
   * 图标颜色，接受任意合法 CSS 颜色值。
   * @default 'currentColor'  继承父元素文字颜色，推荐默认值
   */
  color?: string;

  /**
   * 额外 className，用于 Tailwind 工具类覆盖。
   * @example className="text-blue-500"
   */
  className?: string;

  /**
   * name 无匹配时的降级图标名。
   * 主要用于 JSON / API 驱动的动态图标名场景。
   * @default 'placeholder'
   */
  fallback?: IconName;
}

// ─────────────────────────────────────────
// 工具类型
// ─────────────────────────────────────────

/**
 * 将语义化 IconSize 转换为 px 数值的映射类型。
 * 供 Icon.tsx 内部的 sizeMap 对象使用。
 */
export type IconSizeMap = Record<IconSize, number>;

/**
 * iconMap 中单条记录的值类型。
 * 即 Phosphor 图标 React 组件的类型。
 */
export type IconComponent = (typeof iconMap)[IconName];