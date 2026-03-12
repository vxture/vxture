/**
 * densityConfig.ts - Density 配置
 * @package @vxture/design-system
 *
 * 功能：定义 UI 密度系统的配置
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Configuration
 */

import type { Density } from "./density.types";

/**
 * 默认 Density
 */
export const DEFAULT_DENSITY: Density = "default";

/**
 * Density 缩放配置
 *
 * compact: 0.875x
 * default: 1x
 * comfortable: 1.125x
 */
export const DENSITY_SCALE = {
  compact: 0.875,
  default: 1,
  comfortable: 1.125,
} as const satisfies Record<Density, number>;

/**
 * Density localStorage key
 */
export const DENSITY_STORAGE_KEY = "vx-density";
