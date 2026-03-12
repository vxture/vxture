/**
 * motion.ts - 动画 Tokens
 * @package @vxture/design-system
 *
 * 功能：定义设计系统的动画 tokens，包括缓动函数、持续时间等
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Tokens
 */

/**
 * 缓动函数 tokens
 *
 * - easeIn: 加速进入
 * - easeOut: 减速退出
 * - easeInOut: 平滑进入退出
 * - bounce: 弹跳效果
 * - elastic: 弹性效果
 */
export const easing = {
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;

/**
 * 动画持续时间 tokens (毫秒)
 *
 * - fast: 快速动画 (100ms)
 * - normal: 普通动画 (200ms)
 * - slow: 慢速动画 (300ms)
 * - verySlow: 超慢动画 (500ms)
 */
export const duration = {
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  verySlow: "500ms",
} as const;

/**
 * 动画预设 tokens
 *
 * 常用动画组合，包含 duration 和 easing
 */
export const motionPresets = {
  fadeIn: {
    duration: duration.normal,
    easing: easing.easeOut,
  },
  slideIn: {
    duration: duration.slow,
    easing: easing.easeOut,
  },
  scaleIn: {
    duration: duration.normal,
    easing: easing.easeOut,
  },
  bounce: {
    duration: duration.slow,
    easing: easing.bounce,
  },
  elastic: {
    duration: duration.verySlow,
    easing: easing.elastic,
  },
} as const;
