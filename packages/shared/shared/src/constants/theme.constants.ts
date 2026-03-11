/**
 * themeConfig.ts - Theme Constants
 * @package @vxture/shared
 *
 * Description: Global theme constants including storage keys, default theme,
 * available themes, and DOM attribute configuration. Used across Core and
 * Portal layers for consistent theme management and dark mode support.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Constants
 *
 * @remarks
 * - No runtime logic
 * - Only configuration objects
 *
 * @example
 * ```ts
 * import { THEME_CONSTANTS } from '@vxture/shared';
 *
 * const defaultTheme = THEME_CONSTANTS.DEFAULT_THEME;
 * const availableThemes = THEME_CONSTANTS.AVAILABLE_THEMES;
 * ```
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
