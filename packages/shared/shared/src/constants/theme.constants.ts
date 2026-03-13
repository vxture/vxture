/**
 * theme.constants.ts - Theme constants
 * @package @vxture/shared
 * @description Global configuration constants for theme management, shared across all layers. Contains theme storage keys, HTML attributes, and available theme definitions.
 */

/**
 * Theme related constants
 * @description Global configuration constants for theme management
 */
export const THEME_CONSTANTS = {
  /** localStorage key */
  STORAGE_KEY: 'theme-storage',

  /** HTML data-theme attribute */
  THEME_ATTRIBUTE: 'data-theme',

  /** Dark mode class for TailwindCSS */
  DARK_CLASS: 'dark',

  /** Default theme */
  DEFAULT_THEME: 'light',

  /** Available themes */
  AVAILABLE_THEMES: [
    { name: 'light', displayName: '浅色', isDark: false },
    { name: 'dark', displayName: '深色', isDark: true },
  ],
} as const;
