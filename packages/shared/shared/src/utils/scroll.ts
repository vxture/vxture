/**
 * scroll.ts - Scroll Utility Functions
 * @package @vxture/shared
 *
 * Description: Browser scroll utility functions for scroll management.
 * Includes window scroll reset functionality.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Utilities
 *
 * @remarks
 * - Pure utility functions
 * - Browser API dependent
 * - Handles server-side rendering (SSR)
 *
 * @example
 * ```ts
 * import { resetWindowScrollTop } from '@vxture/shared';
 *
 * // Reset scroll to top on page load
 * resetWindowScrollTop('smooth');
 * ```
 */

/**
 * Scroll behavior type
 * @description Valid scroll behavior options
 */
export type ScrollBehavior = 'auto' | 'smooth' | 'instant';

/**
 * Reset window scroll to top
 * @param behavior - Scroll behavior: 'auto', 'smooth', or 'instant'
 */
export const resetWindowScrollTop = (behavior: ScrollBehavior = 'instant'): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior });
  }
};
