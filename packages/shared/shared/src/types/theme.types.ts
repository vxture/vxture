/**
 * theme.types.ts - Theme Type Definitions
 * @package @vxture/shared
 *
 * Description: Shared theme-related types including ThemeType, ThemeConfig,
 * and ThemeState. Used across Core and Portal layers for theme management
 * and dark mode support.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Types
 *
 * @remarks
 * - No React/Next.js dependencies
 * - Framework-agnostic types
 *
 * @example
 * ```ts
 * import { type ThemeType, type ThemeConfig } from '@vxture/shared';
 *
 * const theme: ThemeType = 'dark';
 * const config: ThemeConfig = {
 *   name: 'light',
 *   displayName: '浅色',
 *   isDark: false
 * };
 * ```
 */

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Theme type
 * @description Valid theme variations (can be extended for new themes)
 */
export type ThemeType = 'light' | 'dark' | string;

/**
 * Theme configuration type
 * @description Describes a single theme's properties
 */
export interface ThemeConfig {
  name: ThemeType;
  displayName: string;
  isDark: boolean;
}

/**
 * Theme global state type
 * @description Global theme state for Zustand store usage
 */
export interface ThemeState {
  theme: ThemeType;
  availableThemes: ThemeConfig[];
  isDarkMode: boolean;

  /**
   * Set theme
   * @param theme - Theme name
   */
  setTheme: (theme: ThemeType) => void;

  /**
   * Toggle theme (light/dark)
   */
  toggleTheme: () => void;
}
