/**
 * colors.ts - 颜色 Tokens
 * @package @vxture/design-system
 *
 * 功能：定义设计系统的颜色 tokens
 *
 * @copyright Vxture Team
 * @license MIT
 * @layer Presentation
 * @category Tokens
 */

export const colors = {
  white: "var(--vx-color-white)",
  black: "var(--vx-color-black)",

  brand: {
    50: "var(--vx-color-brand-50)",
    100: "var(--vx-color-brand-100)",
    200: "var(--vx-color-brand-200)",
    300: "var(--vx-color-brand-300)",
    400: "var(--vx-color-brand-400)",
    500: "var(--vx-color-brand-500)",
    600: "var(--vx-color-brand-600)",
    700: "var(--vx-color-brand-700)",
    800: "var(--vx-color-brand-800)",
    900: "var(--vx-color-brand-900)",
    950: "var(--vx-color-brand-950)",
  },

  gray: {
    50: "var(--vx-color-gray-50)",
    100: "var(--vx-color-gray-100)",
    200: "var(--vx-color-gray-200)",
    300: "var(--vx-color-gray-300)",
    400: "var(--vx-color-gray-400)",
    500: "var(--vx-color-gray-500)",
    600: "var(--vx-color-gray-600)",
    700: "var(--vx-color-gray-700)",
    800: "var(--vx-color-gray-800)",
    900: "var(--vx-color-gray-900)",
  },

  success: {
    50: "var(--vx-color-success-50)",
    100: "var(--vx-color-success-100)",
    200: "var(--vx-color-success-200)",
    300: "var(--vx-color-success-300)",
    400: "var(--vx-color-success-400)",
    500: "var(--vx-color-success-500)",
    600: "var(--vx-color-success-600)",
    700: "var(--vx-color-success-700)",
    800: "var(--vx-color-success-800)",
    900: "var(--vx-color-success-900)",
  },

  warning: {
    50: "var(--vx-color-warning-50)",
    100: "var(--vx-color-warning-100)",
    200: "var(--vx-color-warning-200)",
    300: "var(--vx-color-warning-300)",
    400: "var(--vx-color-warning-400)",
    500: "var(--vx-color-warning-500)",
    600: "var(--vx-color-warning-600)",
    700: "var(--vx-color-warning-700)",
    800: "var(--vx-color-warning-800)",
    900: "var(--vx-color-warning-900)",
  },

  danger: {
    50: "var(--vx-color-danger-50)",
    100: "var(--vx-color-danger-100)",
    200: "var(--vx-color-danger-200)",
    300: "var(--vx-color-danger-300)",
    400: "var(--vx-color-danger-400)",
    500: "var(--vx-color-danger-500)",
    600: "var(--vx-color-danger-600)",
    700: "var(--vx-color-danger-700)",
    800: "var(--vx-color-danger-800)",
    900: "var(--vx-color-danger-900)",
  },

  error: {
    50: "var(--vx-color-error-50)",
    100: "var(--vx-color-error-100)",
    200: "var(--vx-color-error-200)",
    300: "var(--vx-color-error-300)",
    400: "var(--vx-color-error-400)",
    500: "var(--vx-color-error-500)",
    600: "var(--vx-color-error-600)",
    700: "var(--vx-color-error-700)",
    800: "var(--vx-color-error-800)",
    900: "var(--vx-color-error-900)",
  },

  info: {
    50: "var(--vx-color-info-50)",
    100: "var(--vx-color-info-100)",
    200: "var(--vx-color-info-200)",
    300: "var(--vx-color-info-300)",
    400: "var(--vx-color-info-400)",
    500: "var(--vx-color-info-500)",
    600: "var(--vx-color-info-600)",
    700: "var(--vx-color-info-700)",
    800: "var(--vx-color-info-800)",
    900: "var(--vx-color-info-900)",
  },

  teal: {
    50: "var(--vx-color-teal-50)",
    100: "var(--vx-color-teal-100)",
    300: "var(--vx-color-teal-300)",
    400: "var(--vx-color-teal-400)",
    500: "var(--vx-color-teal-500)",
    600: "var(--vx-color-teal-600)",
    700: "var(--vx-color-teal-700)",
  },

  cyan: {
    50: "var(--vx-color-cyan-50)",
    100: "var(--vx-color-cyan-100)",
    600: "var(--vx-color-cyan-600)",
    700: "var(--vx-color-cyan-700)",
  },

  purple: {
    50: "var(--vx-color-purple-50)",
    600: "var(--vx-color-purple-600)",
  },

  indigo: {
    600: "var(--vx-color-indigo-600)",
  },

  social: {
    wechat: "var(--vx-color-social-wechat)",
    dingtalk: "var(--vx-color-social-dingtalk)",
    feishu: "var(--vx-color-social-feishu)",
    feishuAccent: "var(--vx-color-social-feishu-accent)",
    whatsapp: "var(--vx-color-green-whatsapp)",
  },

  semantic: {
    background: "var(--vx-color-background)",
    foreground: "var(--vx-color-foreground)",
    surface: "var(--vx-color-surface)",
    surfaceMuted: "var(--vx-color-surface-muted)",
    border: "var(--vx-color-border)",
    primary: "var(--vx-color-primary)",
    textPrimary: "var(--vx-color-text-primary)",
    textSecondary: "var(--vx-color-text-secondary)",
    textMuted: "var(--vx-color-text-muted)",
    textInverse: "var(--vx-color-text-inverse)",
    success: "var(--vx-color-success)",
    warning: "var(--vx-color-warning)",
    danger: "var(--vx-color-danger)",
    info: "var(--vx-color-info)",
  },
} as const;
