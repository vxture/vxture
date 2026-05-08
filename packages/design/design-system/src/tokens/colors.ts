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
  white: "#ffffff",
  black: "#000000",

  brand: {
    50: "#f5f8ff",
    100: "#e6edff",
    200: "#c7d6ff",
    300: "#9fb7ff",
    400: "#6f90ff",
    500: "#3f6cff",
    600: "#2f55e6",
    700: "#2443b4",
    800: "#1a3282",
    900: "#101f52",
    950: "#172554",
  },

  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  danger: {
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
  },

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  info: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
  },

  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    600: "#0891b2",
    700: "#0e7490",
  },

  purple: {
    50: "#f5f3ff",
    600: "#7c3aed",
  },

  indigo: {
    600: "#4f46e5",
  },

  social: {
    wechat: "#07c160",
    dingtalk: "#1677ff",
    feishu: "#3370ff",
    feishuAccent: "#56d5cc",
    whatsapp: "#25d366",
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
