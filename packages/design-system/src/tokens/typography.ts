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

  fontSize: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
