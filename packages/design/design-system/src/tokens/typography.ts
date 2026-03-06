/**
 * typography.ts - 排版 Tokens
 * @package @vxture/design-system
 *
 * 功能：定义设计系统的排版 tokens
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Domain
 * @category Tokens
 */

export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
  },

  /**
   * 字体大小
   *
   * 实际渲染值通过 CSS 变量 --vx-font-size-* 控制，
   * 支持 density 动态缩放 (compact/default/comfortable)
   */
  fontSize: {
    xs: "var(--vx-font-size-xs, 12px)",
    sm: "var(--vx-font-size-sm, 14px)",
    md: "var(--vx-font-size-md, 16px)",
    lg: "var(--vx-font-size-lg, 18px)",
    xl: "var(--vx-font-size-xl, 20px)",
    "2xl": "var(--vx-font-size-2xl, 24px)",
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
